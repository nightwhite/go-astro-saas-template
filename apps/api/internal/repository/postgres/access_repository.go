package postgres

import (
	"context"
	"slices"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entrole "github.com/night/go-astro-template/apps/api/ent/role"
	entrolepermission "github.com/night/go-astro-template/apps/api/ent/rolepermission"
	entuser "github.com/night/go-astro-template/apps/api/ent/user"
	entuserrolebinding "github.com/night/go-astro-template/apps/api/ent/userrolebinding"
)

type AccessRepository struct {
	ent *dbent.Client
}

func NewAccessRepository(client *Client) *AccessRepository {
	return &AccessRepository{ent: client.Ent}
}

func (r *AccessRepository) SeedDefaults(ctx context.Context, tenantID string, roles []Role) error {
	defaultPermissions := map[string][]string{
		"super_admin": {
			"admin.dashboard.read",
			"admin.users.read",
			"admin.users.write",
			"admin.roles.read",
			"admin.roles.write",
			"admin.files.read",
			"admin.files.write",
			"admin.jobs.read",
			"admin.audit.read",
			"admin.settings.read",
			"admin.settings.write",
			"admin.blog.read",
			"admin.blog.write",
		},
		"admin": {
			"admin.dashboard.read",
			"admin.users.read",
			"admin.users.write",
			"admin.roles.read",
			"admin.roles.write",
			"admin.files.read",
			"admin.jobs.read",
			"admin.audit.read",
			"admin.settings.read",
			"admin.settings.write",
			"admin.blog.read",
			"admin.blog.write",
		},
		"operator": {
			"admin.dashboard.read",
			"admin.files.read",
			"admin.jobs.read",
			"admin.audit.read",
			"admin.blog.read",
		},
	}

	for _, role := range roles {
		permissions, ok := defaultPermissions[role.Key]
		if !ok {
			continue
		}
		for _, permissionKey := range permissions {
			existing, err := r.ent.RolePermission.Query().
				Where(
					entrolepermission.TenantID(tenantID),
					entrolepermission.RoleID(role.ID),
					entrolepermission.PermissionKey(permissionKey),
				).
				Only(ctx)
			if err == nil && existing != nil {
				continue
			}
			if err != nil && !dbent.IsNotFound(err) {
				return err
			}

			_, err = r.ent.RolePermission.Create().
				SetTenantID(tenantID).
				SetRoleID(role.ID).
				SetPermissionKey(permissionKey).
				SetDescription(permissionKey).
				Save(ctx)
			if err != nil && !dbent.IsConstraintError(err) {
				return err
			}
		}
	}

	return nil
}

func (r *AccessRepository) UpsertRolePermissions(ctx context.Context, tenantID, roleID string, permissionKeys []string) error {
	existing, err := r.ent.RolePermission.Query().
		Where(
			entrolepermission.TenantID(tenantID),
			entrolepermission.RoleID(roleID),
		).
		All(ctx)
	if err != nil {
		return err
	}

	existingSet := make(map[string]struct{}, len(existing))
	for _, row := range existing {
		existingSet[row.PermissionKey] = struct{}{}
	}

	desiredSet := make(map[string]struct{}, len(permissionKeys))
	for _, key := range permissionKeys {
		if key == "" {
			continue
		}
		desiredSet[key] = struct{}{}
		if _, ok := existingSet[key]; ok {
			continue
		}
		if _, err := r.ent.RolePermission.Create().
			SetTenantID(tenantID).
			SetRoleID(roleID).
			SetPermissionKey(key).
			SetDescription(key).
			Save(ctx); err != nil && !dbent.IsConstraintError(err) {
			return err
		}
	}

	for _, row := range existing {
		if _, ok := desiredSet[row.PermissionKey]; ok {
			continue
		}
		if err := r.ent.RolePermission.DeleteOneID(row.ID).Exec(ctx); err != nil {
			return err
		}
	}

	return nil
}

func (r *AccessRepository) BindUserRoleByEmail(ctx context.Context, tenantID, email, roleID string) error {
	userRecord, err := r.ent.User.Query().
		Where(
			entuser.TenantID(tenantID),
			entuser.Email(email),
		).
		Only(ctx)
	if err != nil {
		if dbent.IsNotFound(err) {
			return nil
		}
		return err
	}
	return r.EnsureUserRoleBinding(ctx, tenantID, userRecord.ID, roleID)
}

func (r *AccessRepository) RolesByUserID(ctx context.Context, tenantID, userID string) ([]Role, error) {
	bindings, err := r.ent.UserRoleBinding.Query().
		Where(
			entuserrolebinding.TenantID(tenantID),
			entuserrolebinding.UserID(userID),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}
	if len(bindings) == 0 {
		return nil, nil
	}

	roleIDs := make([]string, 0, len(bindings))
	for _, binding := range bindings {
		roleIDs = append(roleIDs, binding.RoleID)
	}

	rows, err := r.ent.Role.Query().
		Where(
			entrole.TenantID(tenantID),
			entrole.IDIn(roleIDs...),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	roles := make([]Role, 0, len(rows))
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
	slices.SortFunc(roles, func(a, b Role) int {
		if a.Key < b.Key {
			return -1
		}
		if a.Key > b.Key {
			return 1
		}
		return 0
	})
	return roles, nil
}

func (r *AccessRepository) EnsureUserRoleBinding(ctx context.Context, tenantID, userID, roleID string) error {
	existing, err := r.ent.UserRoleBinding.Query().
		Where(
			entuserrolebinding.TenantID(tenantID),
			entuserrolebinding.UserID(userID),
			entuserrolebinding.RoleID(roleID),
		).
		Only(ctx)
	if err == nil && existing != nil {
		return nil
	}
	if err != nil && !dbent.IsNotFound(err) {
		return err
	}

	_, err = r.ent.UserRoleBinding.Create().
		SetTenantID(tenantID).
		SetUserID(userID).
		SetRoleID(roleID).
		Save(ctx)
	if dbent.IsConstraintError(err) {
		return nil
	}
	return err
}

func (r *AccessRepository) PermissionsByUserID(ctx context.Context, tenantID, userID string) ([]string, error) {
	bindings, err := r.ent.UserRoleBinding.Query().
		Where(
			entuserrolebinding.TenantID(tenantID),
			entuserrolebinding.UserID(userID),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}
	if len(bindings) == 0 {
		return nil, nil
	}

	roleIDs := make([]string, 0, len(bindings))
	for _, binding := range bindings {
		roleIDs = append(roleIDs, binding.RoleID)
	}

	permissions, err := r.ent.RolePermission.Query().
		Where(
			entrolepermission.TenantID(tenantID),
			entrolepermission.RoleIDIn(roleIDs...),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	unique := make(map[string]struct{}, len(permissions))
	result := make([]string, 0, len(permissions))
	for _, permission := range permissions {
		if _, exists := unique[permission.PermissionKey]; exists {
			continue
		}
		unique[permission.PermissionKey] = struct{}{}
		result = append(result, permission.PermissionKey)
	}
	return result, nil
}
