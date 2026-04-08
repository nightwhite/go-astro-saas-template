package postgres

import (
	"context"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entrole "github.com/night/go-astro-template/apps/api/ent/role"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

type Role struct {
	ID          string    `json:"id"`
	TenantID    string    `json:"tenant_id"`
	Key         string    `json:"key"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type RoleRepository struct {
	ent *dbent.Client
}

func NewRoleRepository(client *Client) *RoleRepository {
	return &RoleRepository{ent: client.Ent}
}

func (r *RoleRepository) EnsureDefaults(ctx context.Context, tenantID string) error {
	defaults := []Role{
		{TenantID: tenantID, Key: "super_admin", Name: "Super Admin", Description: "全量后台权限"},
		{TenantID: tenantID, Key: "admin", Name: "Admin", Description: "标准后台管理员"},
		{TenantID: tenantID, Key: "operator", Name: "Operator", Description: "运营与受限操作"},
	}

	for _, item := range defaults {
		existing, err := r.ent.Role.Query().
			Where(
				entrole.TenantID(item.TenantID),
				entrole.Key(item.Key),
			).
			Only(ctx)
		if err == nil && existing != nil {
			continue
		}
		if err != nil && !dbent.IsNotFound(err) {
			return err
		}

		_, err = r.ent.Role.Create().
			SetTenantID(item.TenantID).
			SetKey(item.Key).
			SetName(item.Name).
			SetDescription(item.Description).
			Save(ctx)
		if err != nil && !dbent.IsConstraintError(err) {
			return err
		}
	}

	return nil
}

func (r *RoleRepository) List(ctx context.Context, tenantID string, limit int) ([]Role, error) {
	query := pagination.Query{
		Params:    pagination.Normalize(1, limit),
		SortBy:    "created_at",
		SortOrder: "asc",
	}
	roles, _, err := r.ListPage(ctx, tenantID, query)
	return roles, err
}

func (r *RoleRepository) ListPage(ctx context.Context, tenantID string, query pagination.Query) ([]Role, int, error) {
	builder := r.ent.Role.Query().Where(entrole.TenantID(tenantID))
	for field, value := range pagination.ResolveFilter(query, map[string]string{
		"key":  "key",
		"name": "name",
	}) {
		switch field {
		case "key":
			builder.Where(entrole.KeyContainsFold(value))
		case "name":
			builder.Where(entrole.NameContainsFold(value))
		}
	}
	total, err := builder.Clone().Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	sortField := pagination.ResolveSort(query.SortBy, map[string]string{
		"created_at": entrole.FieldCreatedAt,
		"key":        entrole.FieldKey,
		"name":       entrole.FieldName,
	}, entrole.FieldCreatedAt)
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

	roles := make([]Role, 0, query.PageSize)
	for _, row := range rows {
		roles = append(roles, Role{
			ID:          row.ID,
			TenantID:    row.TenantID,
			Key:         row.Key,
			Name:        row.Name,
			Description: row.Description,
			CreatedAt:   row.CreatedAt,
		})
	}
	return roles, total, nil
}
