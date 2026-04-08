package admin

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

func (h *Handler) ListAuditLogs(c *gin.Context) {
	query := pagination.FromRequest(c)
	records, total, err := h.auditService.List(c.Request.Context(), query)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.Paginated(c, gin.H{
		"audit_logs": records,
		"filters":    query.Filters,
		"explain":    h.auditService.Explain(query),
	}, pagination.NewMeta(query.Page, query.PageSize, total))
}
