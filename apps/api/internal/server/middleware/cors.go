package middleware

import "github.com/gin-gonic/gin"

func CORS(origin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Credentials", "true")
		// Keep this list explicit so browsers can complete preflight when we add security headers.
		// - X-CSRF-Token: required when SECURITY_CSRF_ENABLED=true
		// - Idempotency-Key: required for selected write endpoints
		// - X-Tenant-ID: multi-tenant scope header (defaults to "default" when absent)
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID, X-CSRF-Token, Idempotency-Key, X-Tenant-ID")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
