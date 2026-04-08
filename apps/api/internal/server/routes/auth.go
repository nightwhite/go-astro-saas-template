package routes

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func RegisterAuthRoutes(group *gin.RouterGroup, handler AuthHandler, cfg *config.Config, rateLimiter *redisrepo.RateLimiter, idempotency *redisrepo.IdempotencyStore) {
	authGroup := group.Group("/auth")
	authGroup.GET("/csrf", handler.CSRF)
	authGroup.GET("/sso/google/start", handler.GoogleSSOStart)
	authGroup.GET("/sso/google/callback", handler.GoogleSSOCallback)
	authGroup.POST("/passkey/register/options", handler.PasskeyRegisterOptions)
	authGroup.POST("/passkey/register/verify", handler.PasskeyRegisterVerify)
	authGroup.POST("/passkey/login/options", handler.PasskeyLoginOptions)
	authGroup.POST("/passkey/login/verify", handler.PasskeyLoginVerify)
	authGroup.POST("/register", handler.Register)
	authGroup.POST(
		"/login",
		middleware.RateLimit(rateLimiter, "auth.login", cfg.Security.LoginRateLimitMax, func(c *gin.Context) string {
			return c.ClientIP()
		}, int64(cfg.Security.LoginRateLimitWindow/time.Second)),
		handler.Login,
	)
	authGroup.POST("/refresh", handler.Refresh)
	authGroup.POST("/logout", handler.Logout)
	authGroup.POST("/logout-all", handler.LogoutAll)
	authGroup.POST(
		"/forgot-password",
		middleware.RateLimit(rateLimiter, "auth.password_reset", cfg.Security.ResetRateLimitMax, func(c *gin.Context) string {
			return c.ClientIP()
		}, int64(cfg.Security.ResetRateLimitWindow/time.Second)),
		middleware.Idempotency(idempotency, "auth.password_reset", cfg.Security.IdempotencyTTL),
		handler.ForgotPassword,
	)
	authGroup.POST(
		"/verification-code",
		middleware.RateLimit(rateLimiter, "auth.verification_code", cfg.Security.ResetRateLimitMax, func(c *gin.Context) string {
			return c.ClientIP()
		}, int64(cfg.Security.ResetRateLimitWindow/time.Second)),
		middleware.Idempotency(idempotency, "auth.verification_code", cfg.Security.IdempotencyTTL),
		handler.SendVerificationCode,
	)
	authGroup.POST(
		"/resend-verification",
		middleware.RateLimit(rateLimiter, "auth.verification_code", cfg.Security.ResetRateLimitMax, func(c *gin.Context) string {
			return c.ClientIP()
		}, int64(cfg.Security.ResetRateLimitWindow/time.Second)),
		middleware.Idempotency(idempotency, "auth.verification_code", cfg.Security.IdempotencyTTL),
		handler.SendVerificationCode,
	)
	authGroup.POST("/confirm-email", handler.ConfirmEmail)
	authGroup.GET("/verify-email", handler.VerifyEmailToken)
	authGroup.POST(
		"/reset-password",
		middleware.RateLimit(rateLimiter, "auth.password_reset_confirm", cfg.Security.ResetRateLimitMax, func(c *gin.Context) string {
			return c.ClientIP()
		}, int64(cfg.Security.ResetRateLimitWindow/time.Second)),
		middleware.Idempotency(idempotency, "auth.password_reset_confirm", cfg.Security.IdempotencyTTL),
		handler.ResetPassword,
	)
	authGroup.GET("/me", handler.Me)
	authGroup.PUT("/me", handler.UpdateMe)
	authGroup.GET("/sessions", handler.Sessions)
	authGroup.DELETE("/sessions/:sessionID", handler.LogoutSession)
}
