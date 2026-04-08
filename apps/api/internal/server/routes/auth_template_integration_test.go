package routes

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

type contractAuthHandler struct {
	settingsStubAuthHandler
}

func (contractAuthHandler) Login(c *gin.Context) {
	httpx.Fail(c, apperrors.Unauthorized("invalid credentials"))
}

func (contractAuthHandler) Me(c *gin.Context) {
	httpx.OK(c, gin.H{
		"user": gin.H{
			"id":    "user-1",
			"email": "admin@example.com",
		},
	})
}

func (contractAuthHandler) CSRF(c *gin.Context) {
	httpx.OK(c, gin.H{"token": "csrf-token"})
}

func (contractAuthHandler) SettingsSessions(c *gin.Context) {
	httpx.OK(c, gin.H{"sessions": []any{}})
}

type contractAdminHandler struct {
	settingsStubAdminHandler
}

func (contractAdminHandler) Overview(c *gin.Context) {
	httpx.OK(c, gin.H{"stats": gin.H{"users": 1}})
}

func (contractAdminHandler) Stats(c *gin.Context) {
	httpx.OK(c, gin.H{
		"totalUsers":        1,
		"totalCredits":      1000,
		"totalTransactions": 1,
	})
}

func (contractAdminHandler) ListUsers(c *gin.Context) {
	httpx.Paginated(c, gin.H{
		"users": []any{
			gin.H{"id": "user-1", "email": "admin@example.com"},
		},
	}, pagination.NewMeta(1, 20, 1))
}

type contractTeamsHandler struct {
	teamsStubHandler
}

func (contractTeamsHandler) ListTeams(c *gin.Context) {
	httpx.OK(c, gin.H{
		"teams": []any{
			gin.H{"id": "team-1", "name": "Default Team"},
		},
	})
}

type contractBillingHandler struct{}

func (contractBillingHandler) Summary(c *gin.Context)              { httpx.OK(c, gin.H{"summary": gin.H{"credits": 1000}}) }
func (contractBillingHandler) Transactions(c *gin.Context)         { httpx.OK(c, gin.H{"transactions": []any{}}) }
func (contractBillingHandler) CreatePaymentIntent(c *gin.Context)  { httpx.OK(c, gin.H{"paymentIntent": gin.H{"id": "pi_1"}}) }
func (contractBillingHandler) ConfirmPaymentIntent(c *gin.Context) { httpx.OK(c, gin.H{"confirmed": true}) }
func (contractBillingHandler) Webhook(c *gin.Context)              { httpx.OK(c, gin.H{"received": true}) }
func (contractBillingHandler) Catalog(c *gin.Context)              { httpx.OK(c, gin.H{"items": []any{}}) }
func (contractBillingHandler) Purchase(c *gin.Context)             { httpx.OK(c, gin.H{"purchase": gin.H{"id": "order_1"}}) }

type contractIdentityService struct{}

func (contractIdentityService) GetCurrentUser(_ context.Context, _ string) (map[string]any, error) {
	return map[string]any{
		"id":        "user-1",
		"email":     "admin@example.com",
		"role":      "admin",
		"tenant_id": "default",
	}, nil
}

func (contractIdentityService) GetCurrentUserPermissions(_ context.Context, _ string) ([]string, error) {
	return []string{
		"admin.dashboard.read",
		"admin.users.read",
		"admin.users.write",
		"admin.files.read",
		"admin.files.write",
		"admin.roles.read",
		"admin.roles.write",
		"admin.jobs.read",
		"admin.jobs.write",
		"admin.audit.read",
		"admin.settings.read",
		"admin.settings.write",
		"admin.blog.read",
		"admin.blog.write",
	}, nil
}

type contractEnvelope struct {
	Data       map[string]any `json:"data"`
	Error      *struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
	Pagination *struct {
		Page     float64 `json:"page"`
		PageSize float64 `json:"page_size"`
		Total    float64 `json:"total"`
	} `json:"pagination"`
	RequestID string `json:"request_id"`
}

func TestAPIContractV1EnvelopeShape(t *testing.T) {
	t.Parallel()

	engine := newContractEngine(t)

	t.Run("auth_me_success", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
		rec := httptest.NewRecorder()
		engine.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
		}
		env := decodeContractEnvelope(t, rec)
		if env.Error != nil {
			t.Fatalf("expected no error envelope, got %+v", env.Error)
		}
		if env.Data == nil {
			t.Fatalf("expected data envelope")
		}
		if _, ok := env.Data["user"]; !ok {
			t.Fatalf("expected data.user, got %v", env.Data)
		}
		assertRequestID(t, rec, env.RequestID)
	})

	t.Run("auth_login_error", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", strings.NewReader(`{"email":"a@b.com","password":"x"}`))
		req.Header.Set("Content-Type", "application/json")
		rec := httptest.NewRecorder()
		engine.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("expected 401, got %d body=%s", rec.Code, rec.Body.String())
		}
		env := decodeContractEnvelope(t, rec)
		if env.Error == nil {
			t.Fatalf("expected error envelope")
		}
		if env.Error.Code != "unauthorized" {
			t.Fatalf("expected error.code=unauthorized, got %s", env.Error.Code)
		}
		if env.Error.Message != "invalid credentials" {
			t.Fatalf("expected error.message=invalid credentials, got %s", env.Error.Message)
		}
		assertRequestID(t, rec, env.RequestID)
	})

	t.Run("admin_users_paginated", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/users?page=1&page_size=20", nil)
		rec := httptest.NewRecorder()
		engine.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
		}
		env := decodeContractEnvelope(t, rec)
		if env.Error != nil {
			t.Fatalf("expected no error envelope, got %+v", env.Error)
		}
		if env.Pagination == nil {
			t.Fatalf("expected pagination envelope")
		}
		if env.Pagination.Page != 1 || env.Pagination.PageSize != 20 || env.Pagination.Total != 1 {
			t.Fatalf("unexpected pagination %+v", env.Pagination)
		}
		if _, ok := env.Data["users"]; !ok {
			t.Fatalf("expected data.users, got %v", env.Data)
		}
		assertRequestID(t, rec, env.RequestID)
	})
}

func TestAPIContractCompatibilityEnvelopeShape(t *testing.T) {
	t.Parallel()

	engine := newContractEngine(t)

	cases := []struct {
		name       string
		method     string
		path       string
		body       string
		statusCode int
		cookie     bool
		wantData   string
	}{
		{
			name:       "csrf",
			method:     http.MethodGet,
			path:       "/api/auth/csrf",
			statusCode: http.StatusOK,
			wantData:   "token",
		},
		{
			name:       "session",
			method:     http.MethodGet,
			path:       "/api/session",
			statusCode: http.StatusOK,
			wantData:   "user",
		},
		{
			name:       "teams_list",
			method:     http.MethodGet,
			path:       "/api/teams",
			statusCode: http.StatusOK,
			wantData:   "teams",
		},
		{
			name:       "settings_sessions",
			method:     http.MethodGet,
			path:       "/api/settings/sessions",
			statusCode: http.StatusOK,
			wantData:   "sessions",
		},
		{
			name:       "admin_stats",
			method:     http.MethodGet,
			path:       "/api/admin/stats",
			statusCode: http.StatusOK,
			cookie:     true,
			wantData:   "totalUsers",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, strings.NewReader(tc.body))
			if tc.body != "" {
				req.Header.Set("Content-Type", "application/json")
			}
			if tc.cookie {
				req.AddCookie(&http.Cookie{Name: "go_astro_session", Value: "session-token"})
			}
			rec := httptest.NewRecorder()
			engine.ServeHTTP(rec, req)

			if rec.Code != tc.statusCode {
				t.Fatalf("expected %d, got %d body=%s", tc.statusCode, rec.Code, rec.Body.String())
			}
			env := decodeContractEnvelope(t, rec)
			if env.Error != nil {
				t.Fatalf("expected no error envelope, got %+v", env.Error)
			}
			if _, ok := env.Data[tc.wantData]; !ok {
				t.Fatalf("expected data.%s, got %v", tc.wantData, env.Data)
			}
			assertRequestID(t, rec, env.RequestID)
		})
	}
}

func newContractEngine(t *testing.T) *gin.Engine {
	t.Helper()
	gin.SetMode(gin.TestMode)

	cfg := &config.Config{}
	cfg.Session.CookieName = "go_astro_session"
	cfg.Security.LoginRateLimitMax = 0
	cfg.Security.ResetRateLimitMax = 0
	cfg.Security.AdminRateLimitMax = 0

	authHandler := contractAuthHandler{}
	adminHandler := contractAdminHandler{}
	teamsHandler := contractTeamsHandler{}
	billingHandler := contractBillingHandler{}

	engine := gin.New()
	engine.Use(middleware.RequestID())

	apiV1 := engine.Group("/api/v1")
	RegisterAuthRoutes(apiV1, authHandler, cfg, nil, nil)
	RegisterSettingsRoutes(apiV1, authHandler)
	RegisterTeamsRoutes(apiV1, teamsHandler, cfg, nil, nil)
	RegisterBillingRoutes(apiV1, billingHandler)

	adminGroup := apiV1.Group("")
	adminGroup.Use(func(c *gin.Context) {
		c.Set("current_permissions", []string{
			"admin.dashboard.read",
			"admin.users.read",
			"admin.users.write",
			"admin.files.read",
			"admin.files.write",
			"admin.roles.read",
			"admin.roles.write",
			"admin.jobs.read",
			"admin.jobs.write",
			"admin.audit.read",
			"admin.settings.read",
			"admin.settings.write",
			"admin.blog.read",
			"admin.blog.write",
		})
		c.Next()
	})
	RegisterAdminRoutes(adminGroup, adminHandler)

	RegisterReferenceAPICompatRoutes(
		engine,
		cfg,
		authHandler,
		teamsHandler,
		billingHandler,
		adminHandler,
		contractIdentityService{},
		nil,
		nil,
	)

	return engine
}

func decodeContractEnvelope(t *testing.T, rec *httptest.ResponseRecorder) contractEnvelope {
	t.Helper()
	var env contractEnvelope
	if err := json.Unmarshal(rec.Body.Bytes(), &env); err != nil {
		t.Fatalf("failed to decode envelope: %v body=%s", err, rec.Body.String())
	}
	return env
}

func assertRequestID(t *testing.T, rec *httptest.ResponseRecorder, requestID string) {
	t.Helper()
	if requestID == "" {
		t.Fatalf("expected request_id in envelope")
	}
	headerRequestID := rec.Header().Get("X-Request-ID")
	if headerRequestID == "" {
		t.Fatalf("expected X-Request-ID response header")
	}
	if headerRequestID != requestID {
		t.Fatalf("expected request_id=%s to match X-Request-ID=%s", requestID, headerRequestID)
	}
}
