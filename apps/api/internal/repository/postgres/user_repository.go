package postgres

import (
	"context"
	"fmt"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entrolepermission "github.com/night/go-astro-template/apps/api/ent/rolepermission"
	entuser "github.com/night/go-astro-template/apps/api/ent/user"
	entuserrolebinding "github.com/night/go-astro-template/apps/api/ent/userrolebinding"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

type User struct {
	ID           string    `json:"id"`
	TenantID     string    `json:"tenant_id"`
	Email        string    `json:"email"`
	DisplayName  string    `json:"display_name"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	Status       string    `json:"status"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserDetail struct {
	User        User   `json:"user"`
	Roles       []Role `json:"roles"`
	Permissions []string `json:"permissions"`
}

type UserRepository struct {
	client *Client
	ent    *dbent.Client
}

func NewUserRepository(client *Client) *UserRepository {
	return &UserRepository{
		client: client,
		ent:    client.Ent,
	}
}

func (r *UserRepository) Client() *Client {
	return r.client
}

func (r *UserRepository) EnsureDefaultAdmin(ctx context.Context, tenantID, email, passwordHash string) error {
	existing, err := r.ent.User.Query().
		Where(
			entuser.TenantID(tenantID),
			entuser.Email(email),
		).
		Only(ctx)
	if err == nil && existing != nil {
		return nil
	}
	if err != nil && !dbent.IsNotFound(err) {
		return err
	}

	_, err = r.ent.User.Create().
		SetTenantID(tenantID).
		SetEmail(email).
		SetPasswordHash(passwordHash).
		SetDisplayName("System Admin").
		SetRole("super_admin").
		SetStatus("active").
		Save(ctx)
	if dbent.IsConstraintError(err) {
		return nil
	}
	return err
}

func (r *UserRepository) FindByEmail(ctx context.Context, tenantID, email string) (*User, error) {
	record, err := r.ent.User.Query().
		Where(
			entuser.TenantID(tenantID),
			entuser.Email(email),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return toUser(record), nil
}

func (r *UserRepository) FindByID(ctx context.Context, tenantID, userID string) (*User, error) {
	record, err := r.ent.User.Query().
		Where(
			entuser.TenantID(tenantID),
			entuser.ID(userID),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return toUser(record), nil
}

func (r *UserRepository) ListUsers(ctx context.Context, tenantID string, limit int) ([]User, error) {
	query := pagination.Query{
		Params:    pagination.Normalize(1, limit),
		SortBy:    "created_at",
		SortOrder: "desc",
	}
	users, _, err := r.ListUsersPage(ctx, tenantID, query)
	return users, err
}

func (r *UserRepository) ListUsersPage(ctx context.Context, tenantID string, query pagination.Query) ([]User, int, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	builder := r.ent.User.Query().Where(entuser.TenantID(tenantID))
	for field, value := range pagination.ResolveFilter(query, map[string]string{
		"email":  "email",
		"role":   "role",
		"status": "status",
	}) {
		switch field {
		case "email":
			builder.Where(entuser.EmailContainsFold(value))
		case "role":
			builder.Where(entuser.RoleEQ(value))
		case "status":
			builder.Where(entuser.StatusEQ(value))
		}
	}
	total, err := builder.Clone().Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	sortField := pagination.ResolveSort(query.SortBy, map[string]string{
		"created_at": entuser.FieldCreatedAt,
		"email":      entuser.FieldEmail,
		"role":       entuser.FieldRole,
		"status":     entuser.FieldStatus,
	}, entuser.FieldCreatedAt)
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

	users := make([]User, 0, query.PageSize)
	for _, record := range rows {
		users = append(users, *toUser(record))
	}
	return users, total, nil
}

func (r *UserRepository) ExplainListPage(query pagination.Query) []string {
	filters := pagination.ResolveFilter(query, map[string]string{
		"email":  "email",
		"role":   "role",
		"status": "status",
	})
	notes := []string{
		"先按 tenant_id 命中用户主范围索引，再叠加排序字段读取分页窗口。",
		"推荐排序字段: created_at、email、role、status，避免非白名单排序导致计划回退。",
	}
	if len(filters) > 0 {
		notes = append(notes, fmt.Sprintf("启用筛选字段: %v。email 使用包含匹配，role/status 使用精确匹配。", filters))
	}
	return notes
}

func (r *UserRepository) UpdatePasswordByEmail(ctx context.Context, tenantID, email, passwordHash string) error {
	_, err := r.ent.User.Update().
		Where(
			entuser.TenantID(tenantID),
			entuser.Email(email),
		).
		SetPasswordHash(passwordHash).
		Save(ctx)
	return err
}

func (r *UserRepository) Create(ctx context.Context, tenantID, email, displayName, passwordHash, role string) (*User, error) {
	record, err := r.ent.User.Create().
		SetTenantID(tenantID).
		SetEmail(email).
		SetDisplayName(displayName).
		SetPasswordHash(passwordHash).
		SetRole(role).
		SetStatus("active").
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return toUser(record), nil
}

func (r *UserRepository) UpdateByID(ctx context.Context, tenantID, userID, displayName, role, status string) (*User, error) {
	builder := r.ent.User.Update().
		Where(
			entuser.TenantID(tenantID),
			entuser.ID(userID),
		)
	if displayName != "" {
		builder.SetDisplayName(displayName)
	}
	if role != "" {
		builder.SetRole(role)
	}
	if status != "" {
		builder.SetStatus(status)
	}
	if _, err := builder.Save(ctx); err != nil {
		return nil, err
	}
	return r.FindByID(ctx, tenantID, userID)
}

func (r *UserRepository) DeleteByID(ctx context.Context, tenantID, userID string) error {
	_, err := r.ent.User.Delete().
		Where(
			entuser.TenantID(tenantID),
			entuser.ID(userID),
		).
		Exec(ctx)
	return err
}

func (r *UserRepository) MarkEmailVerified(ctx context.Context, tenantID, email string) error {
	_, err := r.ent.User.Update().
		Where(
			entuser.TenantID(tenantID),
			entuser.Email(email),
		).
		SetStatus("active").
		Save(ctx)
	return err
}

func (r *UserRepository) UpdateDisplayNameByID(ctx context.Context, tenantID, userID, displayName string) error {
	_, err := r.ent.User.Update().
		Where(
			entuser.TenantID(tenantID),
			entuser.ID(userID),
		).
		SetDisplayName(displayName).
		Save(ctx)
	return err
}

func (r *UserRepository) UpdateEmailByID(ctx context.Context, tenantID, userID, email string) error {
	_, err := r.ent.User.Update().
		Where(
			entuser.TenantID(tenantID),
			entuser.ID(userID),
		).
		SetEmail(email).
		Save(ctx)
	return err
}

func (r *UserRepository) UpdatePasswordByID(ctx context.Context, tenantID, userID, passwordHash string) error {
	_, err := r.ent.User.Update().
		Where(
			entuser.TenantID(tenantID),
			entuser.ID(userID),
		).
		SetPasswordHash(passwordHash).
		Save(ctx)
	return err
}

func (r *UserRepository) SoftDeleteByID(ctx context.Context, tenantID, userID, deletedEmail, passwordHash string) error {
	_, err := r.ent.User.Update().
		Where(
			entuser.TenantID(tenantID),
			entuser.ID(userID),
		).
		SetEmail(deletedEmail).
		SetPasswordHash(passwordHash).
		SetDisplayName("Deleted User").
		SetStatus("deleted").
		SetRole("member").
		Save(ctx)
	return err
}

func (r *UserRepository) GetUserDetail(ctx context.Context, tenantID, userID string) (*User, []Role, []string, error) {
	user, err := r.FindByID(ctx, tenantID, userID)
	if err != nil {
		return nil, nil, nil, err
	}
	if user == nil {
		return nil, nil, nil, nil
	}

	roles, err := r.ent.UserRoleBinding.Query().
		Where(
			entuserrolebinding.TenantID(tenantID),
			entuserrolebinding.UserID(userID),
		).
		QueryRole().
		All(ctx)
	if err != nil {
		return nil, nil, nil, err
	}

	roleOutput := make([]Role, 0, len(roles))
	roleIDs := make([]string, 0, len(roles))
	for _, item := range roles {
		roleIDs = append(roleIDs, item.ID)
		roleOutput = append(roleOutput, Role{
			ID:          item.ID,
			TenantID:    item.TenantID,
			Key:         item.Key,
			Name:        item.Name,
			Description: item.Description,
			CreatedAt:   item.CreatedAt,
		})
	}

	permissions := []string{}
	if len(roleIDs) > 0 {
		permissionRows, permissionErr := r.ent.RolePermission.Query().
			Where(
				entrolepermission.TenantID(tenantID),
				entrolepermission.RoleIDIn(roleIDs...),
			).
			All(ctx)
		if permissionErr != nil {
			return nil, nil, nil, permissionErr
		}
		unique := map[string]struct{}{}
		for _, item := range permissionRows {
			if _, exists := unique[item.PermissionKey]; exists {
				continue
			}
			unique[item.PermissionKey] = struct{}{}
			permissions = append(permissions, item.PermissionKey)
		}
	}
	return user, roleOutput, permissions, nil
}

func toUser(record *dbent.User) *User {
	return &User{
		ID:           record.ID,
		TenantID:     record.TenantID,
		Email:        record.Email,
		DisplayName:  record.DisplayName,
		PasswordHash: record.PasswordHash,
		Role:         record.Role,
		Status:       record.Status,
		CreatedAt:    record.CreatedAt,
	}
}
