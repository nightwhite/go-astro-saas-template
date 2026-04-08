package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/repository/redis"
)

func RateLimit(store *redis.RateLimiter, scope string, max int, subjectResolver func(*gin.Context) string, windowSeconds int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if store == nil || max <= 0 {
			c.Next()
			return
		}

		subject := subjectResolver(c)
		allowed, _, err := store.Allow(c.Request.Context(), scope, subject, max, time.Duration(windowSeconds)*time.Second)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "rate limit unavailable"})
			return
		}
		if !allowed {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
			return
		}

		c.Next()
	}
}
