package settings

import (
	"context"

	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

func (s *Service) GetBillingOverview(ctx context.Context) (map[string]any, error) {
	stats, err := s.buildOverviewStats(ctx)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"tenant_id": tenant.TenantID(ctx),
		"stats": map[string]any{
			"user_count":              stats["user_count"],
			"billing_transaction_cnt": stats["billing_transaction_count"],
			"credit_account_cnt":      stats["credit_account_count"],
			"credit_ledger_cnt":       stats["credit_ledger_count"],
		},
	}, nil
}

func (s *Service) Reconcile(_ context.Context, tenantID string) (map[string]any, error) {
	// Placeholder reconciliation response.
	// Real reconciliation can scan pending transactions and query provider APIs.
	return map[string]any{
		"tenant_id": tenantID,
		"reconciled": true,
		"updated_transactions": 0,
	}, nil
}

