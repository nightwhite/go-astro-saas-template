package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
)

// RequireTeamMember checks :teamID resource membership before teams handlers run.
func RequireTeamMember(cfgCookieName string, sessions *postgres.SessionRepository, teams *postgres.TeamRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		teamID := strings.TrimSpace(c.Param("teamID"))
		if teamID == "" {
			httpx.Fail(c, apperrors.BadRequest("missing team id"))
			c.Abort()
			return
		}

		token, err := c.Cookie(cfgCookieName)
		if err != nil || strings.TrimSpace(token) == "" {
			httpx.Fail(c, apperrors.Unauthorized("missing session"))
			c.Abort()
			return
		}

		session, err := sessions.FindByToken(c.Request.Context(), token)
		if err != nil || session == nil {
			httpx.Fail(c, apperrors.Unauthorized("invalid session"))
			c.Abort()
			return
		}

		requestTenantID := tenant.TenantID(c.Request.Context())
		ok, err := teams.IsTeamMember(c.Request.Context(), requestTenantID, teamID, session.UserID)
		if err != nil {
			httpx.Fail(c, apperrors.Internal("failed to check team membership"))
			c.Abort()
			return
		}
		if !ok {
			httpx.Fail(c, apperrors.Forbidden("forbidden"))
			c.Abort()
			return
		}

		c.Next()
	}
}
