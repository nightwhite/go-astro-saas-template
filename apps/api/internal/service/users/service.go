package users

import (
	"context"
	"strings"

	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"github.com/night/go-astro-template/apps/api/internal/service/auth"
	"go.uber.org/zap"
)

type Service struct {
	users *postgres.UserRepository
}

func NewService(_ *zap.Logger, users *postgres.UserRepository) *Service {
	return &Service{users: users}
}

func (s *Service) List(ctx context.Context, query pagination.Query) ([]postgres.User, int, error) {
	return s.users.ListUsersPage(ctx, tenant.TenantID(ctx), query)
}

func (s *Service) Explain(query pagination.Query) []string {
	return s.users.ExplainListPage(query)
}

func (s *Service) Detail(ctx context.Context, userID string) (map[string]any, error) {
	if strings.TrimSpace(userID) == "" {
		return nil, apperrors.BadRequest("user_id is required")
	}
	user, roles, permissions, err := s.users.GetUserDetail(ctx, tenant.TenantID(ctx), userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, apperrors.NotFound("user not found")
	}
	return map[string]any{
		"user":        user,
		"roles":       roles,
		"permissions": permissions,
	}, nil
}

func (s *Service) Create(ctx context.Context, email, displayName, password, role string) (*postgres.User, error) {
	if strings.TrimSpace(email) == "" || strings.TrimSpace(password) == "" {
		return nil, apperrors.BadRequest("email and password are required")
	}
	if strings.TrimSpace(displayName) == "" {
		displayName = email
	}
	if strings.TrimSpace(role) == "" {
		role = "member"
	}

	tenantID := tenant.TenantID(ctx)
	existing, err := s.users.FindByEmail(ctx, tenantID, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, apperrors.BadRequest("email already exists")
	}

	hash, err := auth.HashPassword(password)
	if err != nil {
		return nil, err
	}
	return s.users.Create(ctx, tenantID, email, displayName, hash, role)
}

func (s *Service) Update(ctx context.Context, userID, displayName, role, status string) (*postgres.User, error) {
	if strings.TrimSpace(userID) == "" {
		return nil, apperrors.BadRequest("user_id is required")
	}
	updated, err := s.users.UpdateByID(ctx, tenant.TenantID(ctx), userID, displayName, role, status)
	if err != nil {
		return nil, err
	}
	if updated == nil {
		return nil, apperrors.NotFound("user not found")
	}
	return updated, nil
}

func (s *Service) Delete(ctx context.Context, userID string) error {
	if strings.TrimSpace(userID) == "" {
		return apperrors.BadRequest("user_id is required")
	}
	return s.users.DeleteByID(ctx, tenant.TenantID(ctx), userID)
}

func (s *Service) ResetPassword(ctx context.Context, userID, newPassword string) error {
	if strings.TrimSpace(userID) == "" || strings.TrimSpace(newPassword) == "" {
		return apperrors.BadRequest("user_id and new_password are required")
	}
	tenantID := tenant.TenantID(ctx)
	user, err := s.users.FindByID(ctx, tenantID, userID)
	if err != nil {
		return err
	}
	if user == nil {
		return apperrors.NotFound("user not found")
	}
	hash, err := auth.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.users.UpdatePasswordByEmail(ctx, tenantID, user.Email, hash)
}
