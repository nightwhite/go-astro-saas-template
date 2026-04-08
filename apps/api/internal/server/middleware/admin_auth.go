package middleware

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
)

func AdminSessionRequired(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(cfg.Session.CookieName)
		if err != nil || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "admin session required"})
			return
		}

		c.Next()
	}
}

type PermissionProvider interface {
	GetCurrentUserPermissions(ctx context.Context, token string) ([]string, error)
}

func AdminPermissionRequired(cfg *config.Config, provider PermissionProvider, required ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if len(required) == 0 {
			c.Next()
			return
		}

		token, err := c.Cookie(cfg.Session.CookieName)
		if err != nil || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "admin session required"})
			return
		}

		permissions, err := provider.GetCurrentUserPermissions(c.Request.Context(), token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid permission context"})
			return
		}

		permissionSet := make(map[string]struct{}, len(permissions))
		for _, permission := range permissions {
			permissionSet[permission] = struct{}{}
		}
		for _, permission := range required {
			if _, ok := permissionSet[permission]; !ok {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "permission denied"})
				return
			}
		}

		c.Next()
	}
}
