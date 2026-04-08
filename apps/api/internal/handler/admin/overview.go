package admin

import (
	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
)

func (h *Handler) Overview(c *gin.Context) {
	overview, err := h.overviewService.GetOverview(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, gin.H{"overview": overview})
}

func (h *Handler) Stats(c *gin.Context) {
	overview, err := h.overviewService.GetOverview(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	statsRaw, ok := overview["stats"].(map[string]any)
	if !ok {
		httpx.Fail(c, apperrors.Internal("stats unavailable"))
		return
	}
	totalUsers, _ := statsRaw["user_count"].(int)
	if value, ok := statsRaw["user_count"].(float64); ok {
		totalUsers = int(value)
	} else if totalUsers == 0 {
		if value, ok := statsRaw["user_count"].(int64); ok {
			totalUsers = int(value)
		}
	}

	totalCredits := 0
	if creditAccountCount, ok := statsRaw["credit_account_count"].(int); ok {
		totalCredits = creditAccountCount
	} else if value, ok := statsRaw["credit_account_count"].(float64); ok {
		totalCredits = int(value)
	} else if value, ok := statsRaw["credit_account_count"].(int64); ok {
		totalCredits = int(value)
	}

	totalTransactions, _ := statsRaw["billing_transaction_count"].(int)
	if value, ok := statsRaw["billing_transaction_count"].(float64); ok {
		totalTransactions = int(value)
	} else if totalTransactions == 0 {
		if value, ok := statsRaw["billing_transaction_count"].(int64); ok {
			totalTransactions = int(value)
		}
	}

	httpx.OK(c, gin.H{
		"totalUsers":        totalUsers,
		"totalCredits":      totalCredits,
		"totalTransactions": totalTransactions,
	})
}
