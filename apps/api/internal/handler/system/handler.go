package system

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
)

type Handler struct {
	cfg      *config.Config
	provider *metrics.Provider
}

func NewHandler(cfg *config.Config, provider *metrics.Provider) *Handler {
	return &Handler{cfg: cfg, provider: provider}
}

func (h *Handler) Health(c *gin.Context) {
	httpx.OK(c, gin.H{
		"status": "ok",
		"app":    h.cfg.App.Name,
		"env":    h.cfg.App.Env,
	})
}

func (h *Handler) Ready(c *gin.Context) {
	httpx.OK(c, gin.H{
		"status": "ready",
		"redis":  h.cfg.Redis.Addr != "",
		"queue":  h.cfg.Jobs.DefaultQueue,
	})
}

func (h *Handler) Metrics(c *gin.Context) {
	httpx.OK(c, gin.H{
		"metrics": h.provider.Snapshot(c.Request.Context(), h.cfg.Jobs.QueuePrefix, h.cfg.Jobs.DefaultQueue, h.cfg.Jobs.CriticalQueue),
		"log_fields": []string{
			"log_type",
			"request_id",
			"tenant_id",
			"user_id",
			"actor_email",
			"status",
			"latency",
			"slow_request",
		},
	})
}

func (h *Handler) Version(c *gin.Context) {
	httpx.OK(c, gin.H{
		"name":    h.cfg.App.Name,
		"env":     h.cfg.App.Env,
		"metrics": h.provider.Snapshot(c.Request.Context(), h.cfg.Jobs.QueuePrefix, h.cfg.Jobs.DefaultQueue, h.cfg.Jobs.CriticalQueue),
	})
}

func (h *Handler) FrontendError(c *gin.Context) {
	if !h.cfg.Security.MetricsEnabled {
		httpx.Fail(c, apperrors.Forbidden("metrics disabled"))
		return
	}
	metrics.RecordFrontendRequestError()
	httpx.OK(c, gin.H{"recorded": true})
}
