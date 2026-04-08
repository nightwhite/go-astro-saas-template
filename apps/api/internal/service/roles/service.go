package roles

import (
	"context"
	"errors"
	"strings"

	"github.com/night/go-astro-template/apps/api/internal/pkg/identityctx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"go.uber.org/zap"
)

type Service struct {
	logger *zap.Logger
	roles  *postgres.RoleRepository
	access *postgres.AccessRepository
}

func NewService(logger *zap.Logger, roles *postgres.RoleRepository, access *postgres.AccessRepository) *Service {
	return &Service{
		logger: logger,
		roles:  roles,
		access: access,
	}
}

func (s *Service) Bootstrap(ctx context.Context) error {
	if err := s.roles.EnsureDefaults(ctx, tenant.DefaultTenantID); err != nil {
		return err
	}

	roles, err := s.roles.List(ctx, tenant.DefaultTenantID, 20)
	if err != nil {
		return err
	}

	return s.access.SeedDefaults(ctx, tenant.DefaultTenantID, roles)
}

func (s *Service) List(ctx context.Context, query pagination.Query) ([]postgres.Role, int, error) {
	return s.roles.ListPage(ctx, tenant.TenantID(ctx), query)
}

func (s *Service) AuditPermissionSync(ctx context.Context) {
	s.logger.Info("permissions synchronized", zap.String("log_type", "audit"), zap.String("tenant_id", tenant.TenantID(ctx)), zap.String("action", "roles.permissions.sync"))
}

func (s *Service) UpdateRolePermissions(ctx context.Context, roleID string, permissionKeys []string) error {
	if s.access == nil {
		return errors.New("access repository unavailable")
	}
	if strings.TrimSpace(roleID) == "" {
		return errors.New("role_id is required")
	}
	tenantID := tenant.TenantID(ctx)
	return s.access.UpsertRolePermissions(ctx, tenantID, roleID, permissionKeys)
}

func (s *Service) BindUserRole(ctx context.Context, email, roleID string) error {
	if s.access == nil {
		return errors.New("access repository unavailable")
	}
	if strings.TrimSpace(email) == "" || strings.TrimSpace(roleID) == "" {
		return errors.New("email and role_id are required")
	}
	tenantID := tenant.TenantID(ctx)
	return s.access.BindUserRoleByEmail(ctx, tenantID, email, roleID)
}

func (s *Service) ListCurrentUserRoles(ctx context.Context) ([]postgres.Role, error) {
	if s.access == nil {
		return nil, errors.New("access repository unavailable")
	}
	actorID := identityctx.ActorID(ctx)
	if actorID == "" {
		return nil, nil
	}
	tenantID := tenant.TenantID(ctx)
	return s.access.RolesByUserID(ctx, tenantID, actorID)
}
