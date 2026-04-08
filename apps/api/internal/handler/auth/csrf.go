package auth

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/pkg/csrf"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

func (h *Handler) CSRF(c *gin.Context) {
	if h.cfg.Security.CSRFSecret == "" {
		httpx.Fail(c, apperrors.Internal("csrf secret not configured"))
		return
	}

	tenantID := tenant.TenantID(c.Request.Context())

	var sessionToken string
	if token, err := c.Cookie(h.cfg.Session.CookieName); err == nil {
		sessionToken = token
	}

	token, err := csrf.Issue(h.cfg.Security.CSRFSecret, tenantID, sessionToken, h.cfg.Security.CSRFTTL)
	if err != nil {
		httpx.Fail(c, apperrors.Internal(err.Error()))
		return
	}

	ttl := h.cfg.Security.CSRFTTL
	if ttl <= 0 {
		ttl = 2 * time.Hour
	}

	// Cookie is not HttpOnly so frontend JS can read it if needed.
	// We still require the header for state-changing requests.
	c.SetCookie(
		h.cfg.Security.CSRFCookieName,
		token,
		int(ttl.Seconds()),
		"/",
		"",
		h.cfg.Session.Secure,
		false,
	)

	httpx.OK(c, gin.H{"token": token})
}

