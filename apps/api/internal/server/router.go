package server

import (
	"net/http/pprof"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
	"github.com/night/go-astro-template/apps/api/internal/server/routes"
	"go.uber.org/zap"
)

type Handlers struct {
	System  routes.SystemHandler
	Auth    routes.AuthHandler
	Admin   routes.AdminHandler
	Teams   routes.TeamsHandler
	Billing routes.BillingHandler
}

func NewRouter(
	cfg *config.Config,
	logger *zap.Logger,
	handlers Handlers,
	identityService middleware.IdentityService,
	rateLimiter *redisrepo.RateLimiter,
	idempotency *redisrepo.IdempotencyStore,
	sessions *postgres.SessionRepository,
	teams *postgres.TeamRepository,
) *gin.Engine {
	engine := gin.New()
	engine.Use(gin.Recovery())
	engine.Use(middleware.RequestID())
	engine.Use(middleware.TenantScope())
	engine.Use(middleware.BodyLimit(cfg.Security.MaxBodyBytes))
	engine.Use(middleware.Logger(logger))
	engine.Use(middleware.CORS(cfg.App.WebOrigin))
	engine.Use(middleware.SecurityHeaders())
	if cfg.Security.CSRFEnabled {
		engine.Use(middleware.CSRFMiddleware(middleware.CSRFConfig{
			Header:            cfg.Security.CSRFHeader,
			CookieName:        cfg.Security.CSRFCookieName,
			Secret:            cfg.Security.CSRFSecret,
			BindSession:       true,
			SessionCookieName: cfg.Session.CookieName,
		}))
	}

	routes.RegisterSystemRoutes(engine, handlers.System, cfg.Security.MetricsEnabled)
	if cfg.Security.EnablePprof {
		registerPprofRoutes(engine)
	}

	apiV1 := engine.Group("/api/v1")
	routes.RegisterAuthRoutes(apiV1, handlers.Auth, cfg, rateLimiter, idempotency)
	routes.RegisterSettingsRoutes(apiV1, handlers.Auth)
	routes.RegisterPublicBlogRoutes(apiV1, handlers.Admin)
	if handlers.Teams != nil {
		routes.RegisterTeamsRoutes(apiV1, handlers.Teams, cfg, sessions, teams)
	}
	if handlers.Billing != nil {
		routes.RegisterBillingRoutes(apiV1, handlers.Billing)
	}
	adminGroup := apiV1.Group("")
	adminGroup.Use(middleware.AdminIdentity(cfg, identityService))
	adminGroup.Use(middleware.RateLimit(
		rateLimiter,
		"admin.request",
		cfg.Security.AdminRateLimitMax,
		func(c *gin.Context) string {
			userID, _ := c.Get("current_user")
			tenantID, _ := c.Get("tenant_id")
			return c.Request.URL.Path + "|" + c.ClientIP() + "|" + stringifyIdentity(userID) + "|" + stringifyIdentity(tenantID)
		},
		int64(cfg.Security.AdminRateLimitWindow/time.Second),
	))
	routes.RegisterAdminRoutes(adminGroup, handlers.Admin)

	if handlers.Auth != nil && handlers.Teams != nil && handlers.Billing != nil && handlers.Admin != nil {
		routes.RegisterReferenceAPICompatRoutes(engine, cfg, handlers.Auth, handlers.Teams, handlers.Billing, handlers.Admin, identityService, sessions, teams)
	}

	return engine
}

func registerPprofRoutes(engine *gin.Engine) {
	pprofGroup := engine.Group("/debug/pprof")
	pprofGroup.GET("/", gin.WrapF(pprof.Index))
	pprofGroup.GET("/cmdline", gin.WrapF(pprof.Cmdline))
	pprofGroup.GET("/profile", gin.WrapF(pprof.Profile))
	pprofGroup.POST("/symbol", gin.WrapF(pprof.Symbol))
	pprofGroup.GET("/symbol", gin.WrapF(pprof.Symbol))
	pprofGroup.GET("/trace", gin.WrapF(pprof.Trace))
	pprofGroup.GET("/allocs", gin.WrapH(pprof.Handler("allocs")))
	pprofGroup.GET("/block", gin.WrapH(pprof.Handler("block")))
	pprofGroup.GET("/goroutine", gin.WrapH(pprof.Handler("goroutine")))
	pprofGroup.GET("/heap", gin.WrapH(pprof.Handler("heap")))
	pprofGroup.GET("/mutex", gin.WrapH(pprof.Handler("mutex")))
	pprofGroup.GET("/threadcreate", gin.WrapH(pprof.Handler("threadcreate")))
}

func stringifyIdentity(raw any) string {
	if raw == nil {
		return "unknown"
	}
	if value, ok := raw.(string); ok && value != "" {
		return value
	}
	if userMap, ok := raw.(map[string]any); ok {
		if id, ok := userMap["id"].(string); ok && id != "" {
			return id
		}
		if email, ok := userMap["email"].(string); ok && email != "" {
			return email
		}
	}
	return "unknown"
}
