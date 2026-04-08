package middleware

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/pkg/identityctx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

const currentUserKey = "current_user"
const currentPermissionsKey = "current_permissions"

type IdentityService interface {
	GetCurrentUser(ctx context.Context, token string) (map[string]any, error)
	GetCurrentUserPermissions(ctx context.Context, token string) ([]string, error)
}

func AdminIdentity(cfg *config.Config, service IdentityService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(cfg.Session.CookieName)
		if err != nil || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "admin session required"})
			return
		}

		user, err := service.GetCurrentUser(c.Request.Context(), token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid admin session"})
			return
		}
		requestTenantID := tenant.TenantID(c.Request.Context())
		if stringValue(user["tenant_id"]) != requestTenantID {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "tenant session mismatch"})
			return
		}

		permissions, err := service.GetCurrentUserPermissions(c.Request.Context(), token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid permission context"})
			return
		}

		requestContext := identityctx.WithActor(
			c.Request.Context(),
			stringValue(user["id"]),
			stringValue(user["email"]),
			stringValue(user["role"]),
			permissions,
		)
		c.Request = c.Request.WithContext(requestContext)

		c.Set(currentUserKey, user)
		c.Set(currentPermissionsKey, permissions)
		c.Set("actor_id", stringValue(user["id"]))
		c.Set("actor_email", stringValue(user["email"]))
		c.Next()
	}
}

func stringValue(value any) string {
	stringValue, _ := value.(string)
	return stringValue
}

func RequirePermissions(required ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if len(required) == 0 {
			c.Next()
			return
		}

		rawPermissions, exists := c.Get(currentPermissionsKey)
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "permission context missing"})
			return
		}

		permissions, ok := rawPermissions.([]string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "permission context invalid"})
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
