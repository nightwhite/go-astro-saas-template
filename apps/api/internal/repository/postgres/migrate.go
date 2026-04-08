package postgres

import (
	"context"
	"fmt"

	dbent "github.com/night/go-astro-template/apps/api/ent"
)

func RunBootstrapMigration(ctx context.Context, db *dbent.Client) error {
	if err := db.Schema.Create(ctx); err != nil {
		return err
	}

	// Ent schema already declares the required indexes for current modules.
	// Keep a placeholder validation list to document performance baseline constraints.
	indexes := []string{
		"users(tenant_id, created_at)",
		"users(tenant_id, role, status)",
		"sessions(tenant_id, user_id, expires_at)",
		"passkey_credentials(tenant_id, user_id, created_at)",
		"audit_logs(tenant_id, action, created_at)",
		"team_memberships(tenant_id, team_id, user_id)",
		"billing_transactions(tenant_id, status, created_at)",
		"blog_posts(tenant_id, status, published_at)",
		"blog_posts(tenant_id, slug)",
		"blog_translations(tenant_id, blog_post_id, language)",
		"blog_preview_tokens(token)",
	}
	if len(indexes) == 0 {
		return fmt.Errorf("index baseline is empty")
	}
	return nil
}
