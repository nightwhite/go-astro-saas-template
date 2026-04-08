package postgres

import (
	"context"
	"fmt"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entauditlog "github.com/night/go-astro-template/apps/api/ent/auditlog"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

type AuditLog struct {
	ID         string    `json:"id"`
	TenantID   string    `json:"tenant_id"`
	ActorEmail string    `json:"actor_email"`
	Action     string    `json:"action"`
	Resource   string    `json:"resource"`
	Detail     string    `json:"detail"`
	CreatedAt  time.Time `json:"created_at"`
}

type AuditRepository struct {
	ent *dbent.Client
}

func NewAuditRepository(client *Client) *AuditRepository {
	return &AuditRepository{ent: client.Ent}
}

func (r *AuditRepository) SeedDefaults(ctx context.Context, tenantID, actorEmail string) error {
	defaults := []AuditLog{
		{TenantID: tenantID, ActorEmail: actorEmail, Action: "auth.login", Resource: "session", Detail: "管理员登录模板后台", CreatedAt: time.Now().Add(-30 * time.Minute)},
		{TenantID: tenantID, ActorEmail: actorEmail, Action: "settings.smtp.save", Resource: "system_settings", Detail: "保存 SMTP 演示配置", CreatedAt: time.Now().Add(-12 * time.Minute)},
		{TenantID: tenantID, ActorEmail: actorEmail, Action: "files.demo.create", Resource: "files", Detail: "创建 demo 文件记录", CreatedAt: time.Now().Add(-3 * time.Minute)},
	}

	for _, item := range defaults {
		existing, err := r.ent.AuditLog.Query().
			Where(
				entauditlog.TenantID(item.TenantID),
				entauditlog.Action(item.Action),
				entauditlog.CreatedAtEQ(item.CreatedAt),
			).
			Only(ctx)
		if err == nil && existing != nil {
			continue
		}
		if err != nil && !dbent.IsNotFound(err) {
			return err
		}

		_, err = r.ent.AuditLog.Create().
			SetTenantID(item.TenantID).
			SetActorEmail(item.ActorEmail).
			SetAction(item.Action).
			SetResource(item.Resource).
			SetDetail(item.Detail).
			SetCreatedAt(item.CreatedAt).
			Save(ctx)
		if err != nil && !dbent.IsConstraintError(err) {
			return err
		}
	}
	return nil
}

func (r *AuditRepository) Create(ctx context.Context, item AuditLog) error {
	_, err := r.ent.AuditLog.Create().
		SetTenantID(item.TenantID).
		SetActorEmail(item.ActorEmail).
		SetAction(item.Action).
		SetResource(item.Resource).
		SetDetail(item.Detail).
		SetCreatedAt(item.CreatedAt).
		Save(ctx)
	return err
}

func (r *AuditRepository) List(ctx context.Context, tenantID string, limit int) ([]AuditLog, error) {
	query := pagination.Query{
		Params:    pagination.Normalize(1, limit),
		SortBy:    "created_at",
		SortOrder: "desc",
	}
	logs, _, err := r.ListPage(ctx, tenantID, query)
	return logs, err
}

func (r *AuditRepository) ListPage(ctx context.Context, tenantID string, query pagination.Query) ([]AuditLog, int, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	builder := r.ent.AuditLog.Query().Where(entauditlog.TenantID(tenantID))
	for field, value := range pagination.ResolveFilter(query, map[string]string{
		"actor_email": "actor_email",
		"action":      "action",
		"resource":    "resource",
	}) {
		switch field {
		case "actor_email":
			builder.Where(entauditlog.ActorEmailContainsFold(value))
		case "action":
			builder.Where(entauditlog.ActionContainsFold(value))
		case "resource":
			builder.Where(entauditlog.ResourceEQ(value))
		}
	}
	total, err := builder.Clone().Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	sortField := pagination.ResolveSort(query.SortBy, map[string]string{
		"created_at":  entauditlog.FieldCreatedAt,
		"actor_email": entauditlog.FieldActorEmail,
		"action":      entauditlog.FieldAction,
		"resource":    entauditlog.FieldResource,
	}, entauditlog.FieldCreatedAt)
	if query.SortOrder == "asc" {
		builder.Order(dbent.Asc(sortField))
	} else {
		builder.Order(dbent.Desc(sortField))
	}

	rows, err := builder.
		Offset(query.Offset()).
		Limit(query.PageSize).
		All(ctx)
	if err != nil {
		return nil, 0, err
	}

	records := make([]AuditLog, 0, query.PageSize)
	for _, row := range rows {
		records = append(records, AuditLog{
			ID:         row.ID,
			TenantID:   row.TenantID,
			ActorEmail: row.ActorEmail,
			Action:     row.Action,
			Resource:   row.Resource,
			Detail:     row.Detail,
			CreatedAt:  row.CreatedAt,
		})
	}
	return records, total, nil
}

func (r *AuditRepository) ExplainListPage(query pagination.Query) []string {
	filters := pagination.ResolveFilter(query, map[string]string{
		"actor_email": "actor_email",
		"action":      "action",
		"resource":    "resource",
	})
	notes := []string{
		"audit_logs 默认按 tenant_id + created_at 范围扫描，action 热点依赖 tenant_id + action + created_at 复合索引。",
		"审计追踪建议优先使用 action/resource 白名单筛选，降低长时间窗口下的扫描量。",
	}
	if len(filters) > 0 {
		notes = append(notes, fmt.Sprintf("启用筛选字段: %v。actor_email/action 为包含匹配，resource 为精确匹配。", filters))
	}
	return notes
}
