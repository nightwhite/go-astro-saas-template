package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
)

const idempotencyHeader = "Idempotency-Key"

func Idempotency(store *redisrepo.IdempotencyStore, scope string, ttl ...time.Duration) gin.HandlerFunc {
	lockTTL := 24 * time.Hour
	if len(ttl) > 0 && ttl[0] > 0 {
		lockTTL = ttl[0]
	}
	return func(c *gin.Context) {
		if store == nil {
			c.Next()
			return
		}

		key := strings.TrimSpace(c.GetHeader(idempotencyHeader))
		if key == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "missing idempotency key"})
			return
		}

		locked, err := store.Lock(c.Request.Context(), scope, key, lockTTL)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "idempotency unavailable"})
			return
		}
		if !locked {
			c.AbortWithStatusJSON(http.StatusConflict, gin.H{"error": "duplicate request"})
			return
		}

		c.Next()
	}
}
