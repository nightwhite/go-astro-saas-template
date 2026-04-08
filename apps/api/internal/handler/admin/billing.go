package admin

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

func (h *Handler) BillingOverview(c *gin.Context) {
	overview, err := h.overviewService.GetBillingOverview(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"overview": overview})
}

func (h *Handler) ReconcileBilling(c *gin.Context) {
	result, err := h.billingService.Reconcile(c.Request.Context(), tenant.TenantID(c.Request.Context()))
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "billing.reconcile", "billing", "执行账务补偿")
	httpx.OK(c, gin.H{"result": result})
}

