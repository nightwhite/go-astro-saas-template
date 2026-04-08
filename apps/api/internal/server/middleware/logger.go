package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/logging"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"go.uber.org/zap"
)

func Logger(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		payload := httpx.RequestBodyBytes(c.Request.Body)
		c.Request.Body = httpx.RestoreBody(payload)

		c.Next()
		latency := time.Since(start)
		slowRequest := latency > 800*time.Millisecond
		metrics.RecordSlowRequest(latency)

		fields := []zap.Field{
			zap.String("log_type", "access"),
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("latency", latency),
			zap.String("client_ip", c.ClientIP()),
		}

		if requestID, ok := c.Get(requestIDKey); ok {
			fields = append(fields, zap.String("request_id", requestID.(string)))
		}
		if tenantID, ok := c.Get("tenant_id"); ok {
			fields = append(fields, zap.String("tenant_id", tenantID.(string)))
		}
		if actorID, ok := c.Get("actor_id"); ok {
			fields = append(fields, zap.String("user_id", actorID.(string)))
		}
		if actorEmail, ok := c.Get("actor_email"); ok {
			fields = append(fields, zap.String("actor_email", actorEmail.(string)))
		}
		fields = append(fields, zap.Bool("slow_request", slowRequest))
		if httpx.ContainsSensitiveField(payload, []string{"password", "token", "secret", "smtp_password"}) {
			fields = append(fields, zap.Bool("payload_redacted", true))
		} else if len(payload) > 0 {
			fields = append(fields, logging.StringMasked("payload_preview", string(payload)))
		}

		logger.Info("http_request", append(fields, zap.String("module", "http"), zap.String("action", "request"))...)
	}
}
