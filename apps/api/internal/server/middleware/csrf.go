package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/csrf"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

type CSRFConfig struct {
	Header            string
	CookieName        string
	Secret            string
	BindSession       bool
	SessionCookieName string
}

func CSRFMiddleware(cfg CSRFConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodGet || c.Request.Method == http.MethodHead || c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}

		header := strings.TrimSpace(c.GetHeader(cfg.Header))
		if header == "" {
			httpx.Fail(c, apperrors.Forbidden("missing csrf token"))
			c.Abort()
			return
		}

		tenantID := tenant.TenantID(c.Request.Context())
		var sessionToken string
		if cfg.BindSession && cfg.SessionCookieName != "" {
			if token, err := c.Cookie(cfg.SessionCookieName); err == nil {
				sessionToken = token
			}
		}

		if _, err := csrf.Verify(header, cfg.Secret, tenantID, sessionToken); err != nil {
			httpx.Fail(c, apperrors.Forbidden(err.Error()))
			c.Abort()
			return
		}

		c.Next()
	}
}
