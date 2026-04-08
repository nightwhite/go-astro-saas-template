package queries

import (
	"context"

	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
)

type OverviewStats struct {
	UserCount          int `json:"user_count"`
	FileCount          int `json:"file_count"`
	RoleCount          int `json:"role_count"`
	JobCount           int `json:"job_count"`
	AuditLogCount      int `json:"audit_log_count"`
	SystemSettingCount int `json:"system_setting_count"`
	TeamCount                int `json:"team_count"`
	TeamInviteCount          int `json:"team_invite_count"`
	TeamMembershipCount      int `json:"team_membership_count"`
	CreditAccountCount       int `json:"credit_account_count"`
	CreditLedgerCount        int `json:"credit_ledger_count"`
	BillingTransactionCount  int `json:"billing_transaction_count"`
	BillingWebhookEventCount int `json:"billing_webhook_event_count"`
	MarketplaceItemCount     int `json:"marketplace_item_count"`
	MarketplaceOrderCount    int `json:"marketplace_order_count"`
}

func LoadOverviewStats(ctx context.Context, client *postgres.Client, tenantID string) (OverviewStats, error) {
	const query = `
SELECT
  (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS user_count,
  (SELECT COUNT(*) FROM files WHERE tenant_id = $1) AS file_count,
  (SELECT COUNT(*) FROM roles WHERE tenant_id = $1) AS role_count,
  (SELECT COUNT(*) FROM job_records WHERE tenant_id = $1) AS job_count,
  (SELECT COUNT(*) FROM audit_logs WHERE tenant_id = $1) AS audit_log_count,
  (SELECT COUNT(*) FROM system_settings WHERE tenant_id = $1) AS system_setting_count,
  (SELECT COUNT(*) FROM teams WHERE tenant_id = $1) AS team_count,
  (SELECT COUNT(*) FROM team_invites WHERE tenant_id = $1) AS team_invite_count,
  (SELECT COUNT(*) FROM team_memberships WHERE tenant_id = $1) AS team_membership_count,
  (SELECT COUNT(*) FROM credit_accounts WHERE tenant_id = $1) AS credit_account_count,
  (SELECT COUNT(*) FROM credit_ledgers WHERE tenant_id = $1) AS credit_ledger_count,
  (SELECT COUNT(*) FROM billing_transactions WHERE tenant_id = $1) AS billing_transaction_count,
  (SELECT COUNT(*) FROM billing_webhook_events WHERE tenant_id = $1) AS billing_webhook_event_count,
  (SELECT COUNT(*) FROM marketplace_items WHERE tenant_id = $1) AS marketplace_item_count,
  (SELECT COUNT(*) FROM marketplace_orders WHERE tenant_id = $1) AS marketplace_order_count
`

	var stats OverviewStats
	err := client.DB.QueryRowContext(ctx, query, tenantID).Scan(
		&stats.UserCount,
		&stats.FileCount,
		&stats.RoleCount,
		&stats.JobCount,
		&stats.AuditLogCount,
		&stats.SystemSettingCount,
		&stats.TeamCount,
		&stats.TeamInviteCount,
		&stats.TeamMembershipCount,
		&stats.CreditAccountCount,
		&stats.CreditLedgerCount,
		&stats.BillingTransactionCount,
		&stats.BillingWebhookEventCount,
		&stats.MarketplaceItemCount,
		&stats.MarketplaceOrderCount,
	)
	if err != nil {
		return OverviewStats{}, err
	}
	return stats, nil
}
