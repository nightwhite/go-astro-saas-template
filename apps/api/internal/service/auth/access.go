package auth

import (
	"context"

	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

func (s *Service) GetCurrentUserPermissions(ctx context.Context, token string) ([]string, error) {
	tenantID := tenant.TenantID(ctx)
	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, nil
	}
	if session.TenantID != tenantID {
		return nil, apperrors.Unauthorized("session tenant mismatch")
	}

	if err := s.syncUserRoleBinding(ctx, session.TenantID, session.UserID); err != nil {
		return nil, err
	}

	return s.access.PermissionsByUserID(ctx, session.TenantID, session.UserID)
}
