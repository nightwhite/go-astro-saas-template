package auth

import (
	"context"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
)

func (s *Service) BuildGoogleSSOStartURL(_ context.Context) (string, error) {
	base := strings.TrimRight(s.cfg.App.BaseURL, "/")
	if base == "" {
		return "", apperrors.BadRequest("app base url is required")
	}
	state := uuid.NewString()
	redirect := fmt.Sprintf("%s/api/v1/auth/sso/google/callback", base)
	// Dev-friendly placeholder URL to keep frontend flow aligned.
	target := fmt.Sprintf("%s?provider=google&state=%s&redirect_uri=%s", base+"/mock/sso/google", url.QueryEscape(state), url.QueryEscape(redirect))
	return target, nil
}

func (s *Service) HandleGoogleSSOCallback(ctx context.Context, code, state string) (*LoginResult, error) {
	if strings.TrimSpace(code) == "" {
		return nil, apperrors.BadRequest("missing sso code")
	}
	if strings.TrimSpace(state) == "" {
		return nil, apperrors.BadRequest("missing sso state")
	}
	tenantID := tenant.TenantID(ctx)
	email := strings.ToLower(strings.TrimSpace(code))
	if !strings.Contains(email, "@") {
		return nil, apperrors.BadRequest("invalid callback code")
	}

	user, err := s.users.FindByEmail(ctx, tenantID, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		passwordHash, hashErr := HashPassword(uuid.NewString())
		if hashErr != nil {
			return nil, hashErr
		}
		user, err = s.users.Create(ctx, tenantID, email, strings.Split(email, "@")[0], passwordHash, "member")
		if err != nil {
			return nil, err
		}
	}

	if err := s.syncUserRoleBinding(ctx, tenantID, user.ID); err != nil {
		return nil, err
	}
	return s.issueSession(ctx, user)
}

func (s *Service) GeneratePasskeyRegistrationOptions(_ context.Context, email string) (map[string]any, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" {
		return nil, apperrors.BadRequest("email is required")
	}
	return map[string]any{
		"challenge":    uuid.NewString(),
		"email":        email,
		"rp_id":        "localhost",
		"rp_name":      s.cfg.App.Name,
		"issued_at":    time.Now().UTC(),
		"expires_in":   int((5 * time.Minute).Seconds()),
		"mock_enabled": true,
	}, nil
}

func (s *Service) VerifyPasskeyRegistration(ctx context.Context, email string, response map[string]any) (*LoginResult, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" {
		return nil, apperrors.BadRequest("email is required")
	}
	tenantID := tenant.TenantID(ctx)
	user, err := s.users.FindByEmail(ctx, tenantID, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		passwordHash, hashErr := HashPassword(uuid.NewString())
		if hashErr != nil {
			return nil, hashErr
		}
		user, err = s.users.Create(ctx, tenantID, email, strings.Split(email, "@")[0], passwordHash, "member")
		if err != nil {
			return nil, err
		}
	}
	if err := s.syncUserRoleBinding(ctx, tenantID, user.ID); err != nil {
		return nil, err
	}

	existingPasskeys, err := s.passkeys.ListByUserID(ctx, tenantID, user.ID)
	if err != nil {
		return nil, err
	}
	if len(existingPasskeys) >= 5 {
		return nil, apperrors.Forbidden("you have reached the maximum limit of 5 passkeys")
	}

	credentialID := strings.TrimSpace(stringValueFromMap(response, "credential_id"))
	if credentialID == "" {
		credentialID = "pk_" + uuid.NewString()
	}
	alreadyExists, err := s.passkeys.FindByCredentialID(ctx, tenantID, credentialID)
	if err != nil {
		return nil, err
	}
	if alreadyExists != nil {
		if alreadyExists.UserID != user.ID {
			return nil, apperrors.Forbidden("credential already belongs to another user")
		}
		return s.issueSession(ctx, user)
	}

	userAgent := strings.TrimSpace(stringValueFromMap(response, "user_agent"))
	aaguid := strings.TrimSpace(stringValueFromMap(response, "aaguid"))
	if aaguid == "" {
		aaguid = "mock-authenticator"
	}
	publicKey := strings.TrimSpace(stringValueFromMap(response, "public_key"))
	if publicKey == "" {
		publicKey = "mock_public_key"
	}

	if _, err := s.passkeys.Create(
		ctx,
		tenantID,
		user.ID,
		credentialID,
		publicKey,
		aaguid,
		userAgent,
	); err != nil {
		return nil, err
	}

	return s.issueSession(ctx, user)
}

func (s *Service) GeneratePasskeyLoginOptions(_ context.Context, email string) (map[string]any, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" {
		return nil, apperrors.BadRequest("email is required")
	}
	return map[string]any{
		"challenge":    uuid.NewString(),
		"email":        email,
		"rp_id":        "localhost",
		"issued_at":    time.Now().UTC(),
		"expires_in":   int((5 * time.Minute).Seconds()),
		"mock_enabled": true,
	}, nil
}

func (s *Service) VerifyPasskeyLogin(ctx context.Context, response map[string]any) (*LoginResult, error) {
	email := strings.TrimSpace(strings.ToLower(stringValueFromMap(response, "email")))
	if email == "" {
		return nil, apperrors.BadRequest("email is required in passkey response")
	}
	tenantID := tenant.TenantID(ctx)
	user, err := s.users.FindByEmail(ctx, tenantID, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, apperrors.NotFound("user not found")
	}
	if err := s.syncUserRoleBinding(ctx, tenantID, user.ID); err != nil {
		return nil, err
	}
	return s.issueSession(ctx, user)
}

func (s *Service) issueSession(ctx context.Context, user *postgres.User) (*LoginResult, error) {
	token := uuid.NewString()
	expiresAt := time.Now().Add(s.cfg.Session.TTL)
	if err := s.sessions.Create(ctx, user.TenantID, user.ID, token, expiresAt); err != nil {
		return nil, err
	}
	if err := s.sessionStore.Set(ctx, token, user.ID, s.cfg.Session.TTL); err != nil {
		return nil, err
	}
	return &LoginResult{
		Token: token,
		User: map[string]any{
			"id":           user.ID,
			"email":        user.Email,
			"display_name": user.DisplayName,
			"role":         user.Role,
			"tenant_id":    user.TenantID,
		},
	}, nil
}

func stringValueFromMap(data map[string]any, key string) string {
	if data == nil {
		return ""
	}
	value, _ := data[key].(string)
	return value
}
