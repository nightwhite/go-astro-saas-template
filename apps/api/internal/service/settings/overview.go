package settings

import (
	"context"

	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres/queries"
)

func (s *Service) buildOverviewStats(ctx context.Context) (map[string]any, error) {
	stats, err := queries.LoadOverviewStats(ctx, s.settings.Client(), tenant.TenantID(ctx))
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"user_count":           stats.UserCount,
		"file_count":           stats.FileCount,
		"role_count":           stats.RoleCount,
		"job_count":            stats.JobCount,
		"audit_log_count":      stats.AuditLogCount,
		"system_setting_count": stats.SystemSettingCount,
		"team_count":                 stats.TeamCount,
		"team_invite_count":          stats.TeamInviteCount,
		"team_membership_count":      stats.TeamMembershipCount,
		"credit_account_count":       stats.CreditAccountCount,
		"credit_ledger_count":        stats.CreditLedgerCount,
		"billing_transaction_count":  stats.BillingTransactionCount,
		"billing_webhook_event_count": stats.BillingWebhookEventCount,
		"marketplace_item_count":     stats.MarketplaceItemCount,
		"marketplace_order_count":    stats.MarketplaceOrderCount,
	}, nil
}
