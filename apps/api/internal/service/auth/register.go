package auth

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

func (s *Service) Register(ctx context.Context, email, password, displayName, verifyCode string) (map[string]any, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)
	displayName = strings.TrimSpace(displayName)
	verifyCode = strings.TrimSpace(verifyCode)
	if email == "" || password == "" {
		return nil, apperrors.BadRequest("email and password are required")
	}
	if len(password) < 8 {
		return nil, apperrors.BadRequest("password must be at least 8 characters")
	}
	if displayName == "" {
		displayName = email
	}

	tenantID := tenant.TenantID(ctx)
	existing, err := s.users.FindByEmail(ctx, tenantID, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, apperrors.Conflict("email already exists")
	}

	if s.verifications != nil {
		ok, err := s.verifications.Verify(ctx, "email_verification", email, verifyCode)
		if err != nil {
			return nil, err
		}
		if !ok {
			return nil, apperrors.BadRequest("invalid verification code")
		}
	}

	passwordHash, err := HashPassword(password)
	if err != nil {
		return nil, err
	}

	user, err := s.users.Create(ctx, tenantID, email, displayName, passwordHash, "member")
	if err != nil {
		return nil, err
	}
	metrics.RecordAuthRegister()

	return map[string]any{
		"user_id":    user.ID,
		"email":      user.Email,
		"created_at": time.Now(),
	}, nil
}

func (s *Service) RefreshSession(ctx context.Context, token string) (*LoginResult, error) {
	tenantID := tenant.TenantID(ctx)
	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, apperrors.Unauthorized("session not found")
	}
	if session.TenantID != tenantID {
		return nil, apperrors.Unauthorized("session not found")
	}

	user, err := s.users.FindByID(ctx, session.TenantID, session.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, apperrors.NotFound("user not found")
	}

	newToken := uuid.NewString()
	expiresAt := time.Now().Add(s.cfg.Session.TTL)
	if err := s.sessions.DeleteByToken(ctx, token); err != nil {
		return nil, err
	}
	if err := s.sessions.Create(ctx, session.TenantID, session.UserID, newToken, expiresAt); err != nil {
		return nil, err
	}
	if err := s.sessionStore.Delete(ctx, token); err != nil {
		return nil, err
	}
	if err := s.sessionStore.Set(ctx, newToken, session.UserID, s.cfg.Session.TTL); err != nil {
		return nil, err
	}

	return &LoginResult{
		Token: newToken,
		User: map[string]any{
			"id":           user.ID,
			"email":        user.Email,
			"display_name": user.DisplayName,
			"role":         user.Role,
			"tenant_id":    user.TenantID,
		},
	}, nil
}

func (s *Service) ConfirmEmail(ctx context.Context, email, code string) error {
	if s.verifications == nil {
		return nil
	}
	email = strings.TrimSpace(strings.ToLower(email))
	code = strings.TrimSpace(code)
	if email == "" || code == "" {
		return apperrors.BadRequest("email and code are required")
	}
	ok, err := s.verifications.Verify(ctx, "email_verification", email, code)
	if err != nil {
		return err
	}
	if !ok {
		return apperrors.BadRequest("invalid verification code")
	}
	return s.users.MarkEmailVerified(ctx, tenant.TenantID(ctx), email)
}

func (s *Service) VerifyEmailToken(ctx context.Context, token string) error {
	token = strings.TrimSpace(token)
	if token == "" {
		return apperrors.BadRequest("token is required")
	}
	if s.resetTokens == nil {
		return apperrors.Internal("verification token store unavailable")
	}
	payload, err := s.resetTokens.Consume(ctx, token)
	if err != nil {
		return apperrors.BadRequest("invalid or expired verification token")
	}
	return s.users.MarkEmailVerified(ctx, payload.TenantID, payload.Email)
}

func (s *Service) LogoutAll(ctx context.Context, token string) error {
	tenantID := tenant.TenantID(ctx)
	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return err
	}
	if session == nil {
		return nil
	}
	if session.TenantID != tenantID {
		return nil
	}
	tokens, err := s.sessions.ListTokensByUserID(ctx, session.TenantID, session.UserID)
	if err != nil {
		return err
	}
	if err := s.sessions.DeleteByUserID(ctx, session.TenantID, session.UserID); err != nil {
		return err
	}
	for _, sessionToken := range tokens {
		if deleteErr := s.sessionStore.Delete(tenant.WithTenantID(ctx, session.TenantID), sessionToken); deleteErr != nil {
			return deleteErr
		}
	}
	return nil
}
