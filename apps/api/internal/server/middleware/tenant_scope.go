package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

const tenantHeader = "X-Tenant-ID"

func TenantScope() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := c.GetHeader(tenantHeader)
		if tenantID == "" {
			tenantID = tenant.DefaultTenantID
		}

		c.Request = c.Request.WithContext(tenant.WithTenantID(c.Request.Context(), tenantID))
		c.Set("tenant_id", tenantID)
		c.Writer.Header().Set(tenantHeader, tenantID)
		c.Next()
	}
}
