package admin

import (
	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

func (h *Handler) ListJobs(c *gin.Context) {
	query := pagination.FromRequest(c)
	records, total, err := h.jobService.List(c.Request.Context(), query)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.Paginated(c, gin.H{
		"jobs":    records,
		"filters": query.Filters,
		"explain": h.jobService.Explain(query),
	}, pagination.NewMeta(query.Page, query.PageSize, total))
}

func (h *Handler) EnqueueJob(c *gin.Context) {
	var payload struct {
		JobType string         `json:"job_type"`
		Payload map[string]any `json:"payload"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if payload.JobType == "" {
		httpx.Fail(c, apperrors.BadRequest("job_type is required"))
		return
	}

	if err := h.jobService.EnqueueDemo(c.Request.Context(), payload.JobType, payload.Payload); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "jobs.enqueue", "job_records", "创建后台任务")
	httpx.OK(c, gin.H{"enqueued": true})
}

func (h *Handler) ReplayJob(c *gin.Context) {
	var payload struct {
		JobID   string         `json:"job_id"`
		Payload map[string]any `json:"payload"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if payload.JobID == "" {
		httpx.Fail(c, apperrors.BadRequest("job_id is required"))
		return
	}
	if err := h.jobService.Replay(c.Request.Context(), payload.JobID, payload.Payload); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "jobs.replay", "job_records", "回放后台任务")
	httpx.OK(c, gin.H{"replayed": true})
}
