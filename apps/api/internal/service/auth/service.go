package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
	"go.uber.org/zap"
)

type Service struct {
	cfg           *config.Config
	logger        *zap.Logger
	users         *postgres.UserRepository
	sessions      *postgres.SessionRepository
	passkeys      *postgres.PasskeyRepository
	roles         *postgres.RoleRepository
	access        *postgres.AccessRepository
	sessionStore  *redisrepo.SessionStore
	verifications *redisrepo.VerificationStore
	rateLimiter   *redisrepo.RateLimiter
	idempotency   *redisrepo.IdempotencyStore
	captcha       CaptchaVerifier
	mail          MailVerifier
	resetTokens   *redisrepo.ResetTokenStore
	audit         AuditRecorder
}

type LoginResult struct {
	Token string
	User  map[string]any
}

type UserSession struct {
	ID         string
	Current    bool
	CreatedAt  time.Time
	UpdatedAt  time.Time
	ExpiresAt  time.Time
	LastSeenAt time.Time
}

type SessionOverview struct {
	ID                 string
	CreatedAt          time.Time
	ExpiresAt          time.Time
	IsCurrentSession   bool
	IP                 string
	UserAgent          string
	AuthenticationType string
}

type PasskeyOverview struct {
	ID           string    `json:"id"`
	CredentialID string    `json:"credential_id"`
	AAGUID       string    `json:"aaguid"`
	UserAgent    string    `json:"user_agent"`
	CreatedAt    time.Time `json:"created_at"`
	IsCurrent    bool      `json:"is_current"`
}

func NewService(
	cfg *config.Config,
	logger *zap.Logger,
	users *postgres.UserRepository,
	sessions *postgres.SessionRepository,
	passkeys *postgres.PasskeyRepository,
	roles *postgres.RoleRepository,
	access *postgres.AccessRepository,
	sessionStore *redisrepo.SessionStore,
	verificationStore *redisrepo.VerificationStore,
	rateLimiter *redisrepo.RateLimiter,
	idempotency *redisrepo.IdempotencyStore,
	captcha CaptchaVerifier,
	resetTokens *redisrepo.ResetTokenStore,
	mail MailVerifier,
	audit AuditRecorder,
) *Service {
	return &Service{
		cfg:           cfg,
		logger:        logger,
		users:         users,
		sessions:      sessions,
		passkeys:      passkeys,
		roles:         roles,
		access:        access,
		sessionStore:  sessionStore,
		verifications: verificationStore,
		rateLimiter:   rateLimiter,
		idempotency:   idempotency,
		captcha:       captcha,
		resetTokens:   resetTokens,
		mail:          mail,
		audit:         audit,
	}
}

func (s *Service) Logout(ctx context.Context, token string) error {
	if err := s.sessions.DeleteByToken(ctx, token); err != nil {
		return err
	}
	return s.sessionStore.Delete(ctx, token)
}

func (s *Service) UpdateCurrentUserProfile(ctx context.Context, token, displayName string) (map[string]any, error) {
	displayName = strings.TrimSpace(displayName)
	if displayName == "" {
		return nil, apperrors.BadRequest("display_name is required")
	}
	if len(displayName) > 80 {
		return nil, apperrors.BadRequest("display_name is too long")
	}

	tenantID := tenant.TenantID(ctx)
	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil || session.TenantID != tenantID || session.ExpiresAt.Before(time.Now()) {
		return nil, apperrors.Unauthorized("session expired")
	}

	if err := s.users.UpdateDisplayNameByID(ctx, session.TenantID, session.UserID, displayName); err != nil {
		return nil, err
	}
	if s.audit != nil {
		_ = s.audit.Record(ctx, "auth.profile.update", "user", "更新当前用户资料")
	}

	return s.GetCurrentUser(ctx, token)
}

func (s *Service) Bootstrap(ctx context.Context) error {
	passwordHash, err := HashPassword(s.cfg.Auth.DefaultAdminPassword)
	if err != nil {
		return err
	}

	if err := s.users.EnsureDefaultAdmin(ctx, tenant.DefaultTenantID, s.cfg.Auth.DefaultAdminEmail, passwordHash); err != nil {
		return err
	}

	adminUser, err := s.users.FindByEmail(ctx, tenant.DefaultTenantID, s.cfg.Auth.DefaultAdminEmail)
	if err != nil {
		return err
	}
	if adminUser == nil {
		return nil
	}

	return s.syncUserRoleBinding(ctx, tenant.DefaultTenantID, adminUser.ID)
}

func (s *Service) syncUserRoleBinding(ctx context.Context, tenantID, userID string) error {
	user, err := s.users.FindByID(ctx, tenantID, userID)
	if err != nil {
		return err
	}
	if user == nil || user.Role == "" {
		return nil
	}

	roles, err := s.accessRoles(ctx, tenantID)
	if err != nil {
		return err
	}
	if len(roles) == 0 {
		if err := s.roles.EnsureDefaults(ctx, tenantID); err != nil {
			return err
		}
		roles, err = s.accessRoles(ctx, tenantID)
		if err != nil {
			return err
		}
	}

	if err := s.access.SeedDefaults(ctx, tenantID, roles); err != nil {
		return err
	}

	role, err := s.accessRole(ctx, tenantID, user.Role)
	if err != nil {
		return err
	}
	if role == nil {
		return nil
	}

	return s.access.EnsureUserRoleBinding(ctx, tenantID, user.ID, role.ID)
}

func (s *Service) Login(ctx context.Context, email, password string) (*LoginResult, error) {
	tenantID := tenant.TenantID(ctx)
	email = strings.TrimSpace(strings.ToLower(email))
	password = strings.TrimSpace(password)
	if email == "" || password == "" {
		return nil, apperrors.BadRequest("email and password are required")
	}

	if s.rateLimiter != nil {
		allowed, _, err := s.rateLimiter.Allow(ctx, "auth.login", email, s.cfg.Security.LoginRateLimitMax, s.cfg.Security.LoginRateLimitWindow)
		if err != nil {
			return nil, err
		}
		if !allowed {
			return nil, apperrors.TooManyRequests("too many login attempts, try again later")
		}
	}

	user, err := s.users.FindByEmail(ctx, tenantID, email)
	if err != nil {
		return nil, err
	}
	if user == nil || !VerifyPassword(user.PasswordHash, password) {
		return nil, apperrors.Unauthorized("invalid email or password")
	}

	if err := s.syncUserRoleBinding(ctx, tenantID, user.ID); err != nil {
		return nil, err
	}

	token := uuid.NewString()
	expiresAt := time.Now().Add(s.cfg.Session.TTL)
	if err := s.sessions.Create(ctx, tenantID, user.ID, token, expiresAt); err != nil {
		return nil, err
	}
	if err := s.sessionStore.Set(ctx, token, user.ID, s.cfg.Session.TTL); err != nil {
		return nil, err
	}
	if s.audit != nil {
		_ = s.audit.Record(ctx, "auth.login", "session", "用户登录后台")
	}
	metrics.RecordAuthLogin()

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

func (s *Service) GetCurrentUser(ctx context.Context, token string) (map[string]any, error) {
	tenantID := tenant.TenantID(ctx)

	if s.sessionStore != nil {
		if cachedUserID, cacheErr := s.sessionStore.Get(ctx, token); cacheErr == nil && cachedUserID != "" {
			session, err := s.sessions.FindByToken(ctx, token)
			if err == nil && session != nil && session.TenantID == tenantID {
				user, userErr := s.users.FindByID(ctx, session.TenantID, cachedUserID)
				if userErr == nil && user != nil {
					if syncErr := s.syncUserRoleBinding(ctx, session.TenantID, user.ID); syncErr != nil {
						return nil, syncErr
					}
					permissions, permissionErr := s.access.PermissionsByUserID(ctx, session.TenantID, session.UserID)
					if permissionErr == nil {
						return map[string]any{
							"id":           user.ID,
							"email":        user.Email,
							"display_name": user.DisplayName,
							"role":         user.Role,
							"tenant_id":    user.TenantID,
							"permissions":  permissions,
						}, nil
					}
				}
			}
		}
	}

	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil || session.TenantID != tenantID || session.ExpiresAt.Before(time.Now()) {
		return nil, apperrors.Unauthorized("session expired")
	}

	user, err := s.users.FindByID(ctx, session.TenantID, session.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, apperrors.Unauthorized("user not found")
	}

	if err := s.syncUserRoleBinding(ctx, session.TenantID, user.ID); err != nil {
		return nil, err
	}

	permissions, err := s.access.PermissionsByUserID(ctx, session.TenantID, session.UserID)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"id":           user.ID,
		"email":        user.Email,
		"display_name": user.DisplayName,
		"role":         user.Role,
		"tenant_id":    user.TenantID,
		"permissions":  permissions,
	}, nil
}

func (s *Service) SendVerificationCode(ctx context.Context, email string) (map[string]any, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" {
		return nil, apperrors.BadRequest("email is required")
	}

	code := fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
	if s.verifications != nil {
		if err := s.verifications.Save(ctx, "email_verification", email, code, 10*time.Minute); err != nil {
			return nil, err
		}
	}

	// Keep a hook point for real SMTP implementations; for dev we only log on the server.
	if s.mail != nil {
		result, err := s.mail.SendVerificationCode(ctx, email, code)
		if err != nil {
			return nil, err
		}
		_ = result
	}

	// In development we log the verification code on the server side to support local testing,
	// but never expose the code in API responses.
	if s.cfg.App.Env == "development" {
		s.logger.Info("verification_code_issued",
			zap.String("tenant_id", tenant.TenantID(ctx)),
			zap.String("email", email),
			zap.String("code", code),
		)
	}

	return map[string]any{
		"target": email,
		// Do not return verification codes via API response.
		// Return a generic message so clients can show success toast without leaking secrets.
		"message": "verification code sent",
	}, nil
}

func (s *Service) ListUserSessions(ctx context.Context, currentToken string) ([]UserSession, error) {
	current, err := s.sessions.FindByToken(ctx, currentToken)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperrors.Unauthorized("session not found")
	}
	rows, err := s.sessions.ListByUserID(ctx, current.TenantID, current.UserID)
	if err != nil {
		return nil, err
	}

	output := make([]UserSession, 0, len(rows))
	for _, item := range rows {
		output = append(output, UserSession{
			ID:         item.ID,
			Current:    item.Token == currentToken,
			CreatedAt:  item.CreatedAt,
			UpdatedAt:  item.UpdatedAt,
			ExpiresAt:  item.ExpiresAt,
			LastSeenAt: item.UpdatedAt,
		})
	}
	return output, nil
}

func (s *Service) ListUserSessionOverviews(ctx context.Context, currentToken string) ([]SessionOverview, error) {
	current, err := s.sessions.FindByToken(ctx, currentToken)
	if err != nil {
		return nil, err
	}
	if current == nil {
		return nil, apperrors.Unauthorized("session not found")
	}
	rows, err := s.sessions.ListByUserID(ctx, current.TenantID, current.UserID)
	if err != nil {
		return nil, err
	}

	output := make([]SessionOverview, 0, len(rows))
	for _, item := range rows {
		output = append(output, SessionOverview{
			ID:                 item.ID,
			CreatedAt:          item.CreatedAt,
			ExpiresAt:          item.ExpiresAt,
			IsCurrentSession:   item.Token == currentToken,
			IP:                 "",
			UserAgent:          "",
			AuthenticationType: "password",
		})
	}
	return output, nil
}

func (s *Service) LogoutSessionByID(ctx context.Context, currentToken, sessionID string) error {
	tenantID := tenant.TenantID(ctx)
	current, err := s.sessions.FindByToken(ctx, currentToken)
	if err != nil {
		return err
	}
	if current == nil || current.TenantID != tenantID {
		return apperrors.Unauthorized("session not found")
	}

	target, err := s.sessions.FindByID(ctx, tenantID, sessionID)
	if err != nil {
		return err
	}
	if target == nil {
		return apperrors.NotFound("session not found")
	}
	if target.UserID != current.UserID {
		return apperrors.Forbidden("forbidden")
	}

	if err := s.sessions.DeleteByID(ctx, tenantID, sessionID); err != nil {
		return err
	}
	return s.sessionStore.Delete(tenant.WithTenantID(ctx, tenantID), target.Token)
}

func (s *Service) UpdateCurrentUserName(ctx context.Context, token, firstName, lastName string) error {
	firstName = strings.TrimSpace(firstName)
	lastName = strings.TrimSpace(lastName)
	if len(firstName) < 2 || len(lastName) < 2 {
		return apperrors.BadRequest("first_name and last_name must be at least 2 characters")
	}
	displayName := strings.TrimSpace(firstName + " " + lastName)
	if displayName == "" {
		return apperrors.BadRequest("display_name is required")
	}
	_, err := s.UpdateCurrentUserProfile(ctx, token, displayName)
	return err
}

func (s *Service) ChangeCurrentUserEmail(ctx context.Context, token, newEmail, currentPassword string) error {
	tenantID := tenant.TenantID(ctx)
	newEmail = strings.TrimSpace(strings.ToLower(newEmail))
	currentPassword = strings.TrimSpace(currentPassword)
	if newEmail == "" || currentPassword == "" {
		return apperrors.BadRequest("new_email and current_password are required")
	}

	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return err
	}
	if session == nil || session.TenantID != tenantID {
		return apperrors.Unauthorized("session not found")
	}

	user, err := s.users.FindByID(ctx, tenantID, session.UserID)
	if err != nil {
		return err
	}
	if user == nil {
		return apperrors.NotFound("user not found")
	}
	if !VerifyPassword(user.PasswordHash, currentPassword) {
		return apperrors.Forbidden("invalid password")
	}
	if strings.EqualFold(strings.TrimSpace(user.Email), newEmail) {
		return apperrors.BadRequest("email unchanged")
	}

	existing, err := s.users.FindByEmail(ctx, tenantID, newEmail)
	if err != nil {
		return err
	}
	if existing != nil && existing.ID != user.ID {
		return apperrors.Conflict("email already exists")
	}

	if err := s.users.UpdateEmailByID(ctx, tenantID, user.ID, newEmail); err != nil {
		return err
	}
	if s.audit != nil {
		_ = s.audit.Record(ctx, "auth.email.change", "user", "修改当前用户邮箱")
	}
	return nil
}

func (s *Service) ChangeCurrentUserPassword(ctx context.Context, token, currentPassword, newPassword string) error {
	tenantID := tenant.TenantID(ctx)
	currentPassword = strings.TrimSpace(currentPassword)
	newPassword = strings.TrimSpace(newPassword)
	if currentPassword == "" || newPassword == "" {
		return apperrors.BadRequest("current_password and new_password are required")
	}
	if len(newPassword) < 8 {
		return apperrors.BadRequest("new password must be at least 8 characters")
	}

	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return err
	}
	if session == nil || session.TenantID != tenantID {
		return apperrors.Unauthorized("session not found")
	}
	user, err := s.users.FindByID(ctx, tenantID, session.UserID)
	if err != nil {
		return err
	}
	if user == nil {
		return apperrors.NotFound("user not found")
	}
	if !VerifyPassword(user.PasswordHash, currentPassword) {
		return apperrors.Forbidden("invalid password")
	}

	hash, err := HashPassword(newPassword)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePasswordByID(ctx, tenantID, user.ID, hash); err != nil {
		return err
	}

	if err := s.sessions.DeleteByUserIDExceptToken(ctx, tenantID, user.ID, token); err != nil {
		return err
	}
	if s.audit != nil {
		_ = s.audit.Record(ctx, "auth.password.change", "user", "修改当前用户密码")
	}
	return nil
}

func (s *Service) DeleteCurrentUserAccount(ctx context.Context, token, currentPassword string) error {
	tenantID := tenant.TenantID(ctx)
	currentPassword = strings.TrimSpace(currentPassword)
	if currentPassword == "" {
		return apperrors.BadRequest("current_password is required")
	}

	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return err
	}
	if session == nil || session.TenantID != tenantID {
		return apperrors.Unauthorized("session not found")
	}
	user, err := s.users.FindByID(ctx, tenantID, session.UserID)
	if err != nil {
		return err
	}
	if user == nil {
		return apperrors.NotFound("user not found")
	}
	if !VerifyPassword(user.PasswordHash, currentPassword) {
		return apperrors.Forbidden("invalid password")
	}

	hash := sha256.Sum256([]byte(user.Email + time.Now().UTC().String() + user.ID))
	deletedEmail := fmt.Sprintf("deleted+%s@local.invalid", hex.EncodeToString(hash[:8]))
	passwordHash, err := HashPassword(uuid.NewString())
	if err != nil {
		return err
	}
	if err := s.users.SoftDeleteByID(ctx, tenantID, user.ID, deletedEmail, passwordHash); err != nil {
		return err
	}

	tokens, err := s.sessions.ListTokensByUserID(ctx, tenantID, user.ID)
	if err != nil {
		return err
	}
	if err := s.sessions.DeleteByUserID(ctx, tenantID, user.ID); err != nil {
		return err
	}
	for _, item := range tokens {
		_ = s.sessionStore.Delete(tenant.WithTenantID(ctx, tenantID), item)
	}
	if s.audit != nil {
		_ = s.audit.Record(ctx, "auth.account.delete", "user", "删除当前用户账号")
	}
	return nil
}

func (s *Service) ListCurrentUserPasskeys(ctx context.Context, token string) ([]PasskeyOverview, error) {
	tenantID := tenant.TenantID(ctx)
	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil || session.TenantID != tenantID || session.ExpiresAt.Before(time.Now()) {
		return nil, apperrors.Unauthorized("session expired")
	}

	records, err := s.passkeys.ListByUserID(ctx, tenantID, session.UserID)
	if err != nil {
		return nil, err
	}

	result := make([]PasskeyOverview, 0, len(records))
	for _, item := range records {
		result = append(result, PasskeyOverview{
			ID:           item.ID,
			CredentialID: item.CredentialID,
			AAGUID:       item.AAGUID,
			UserAgent:    item.UserAgent,
			CreatedAt:    item.CreatedAt,
			IsCurrent:    false,
		})
	}
	return result, nil
}

func (s *Service) DeleteCurrentUserPasskey(ctx context.Context, token, credentialID string) error {
	tenantID := tenant.TenantID(ctx)
	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return err
	}
	if session == nil || session.TenantID != tenantID || session.ExpiresAt.Before(time.Now()) {
		return apperrors.Unauthorized("session expired")
	}

	credentialID = strings.TrimSpace(credentialID)
	if credentialID == "" {
		return apperrors.BadRequest("credential_id is required")
	}

	target, err := s.passkeys.FindByCredentialID(ctx, tenantID, credentialID)
	if err != nil {
		return err
	}
	if target == nil {
		return apperrors.NotFound("passkey not found")
	}
	if target.UserID != session.UserID {
		return apperrors.Forbidden("forbidden")
	}

	if err := s.passkeys.DeleteByCredentialID(ctx, tenantID, credentialID); err != nil {
		return err
	}

	if s.audit != nil {
		_ = s.audit.Record(ctx, "auth.passkey.delete", "passkey_credential", "删除当前用户 passkey 凭证")
	}
	return nil
}

func (s *Service) accessRole(ctx context.Context, tenantID, roleKey string) (*postgres.Role, error) {
	roles, err := s.accessRoles(ctx, tenantID)
	if err != nil {
		return nil, err
	}
	for _, role := range roles {
		if role.Key == roleKey {
			copyRole := role
			return &copyRole, nil
		}
	}
	return nil, nil
}

func (s *Service) accessRoles(ctx context.Context, tenantID string) ([]postgres.Role, error) {
	return s.accessRolesFromRepository(ctx, tenantID)
}

func (s *Service) accessRolesFromRepository(ctx context.Context, tenantID string) ([]postgres.Role, error) {
	return s.roles.List(ctx, tenantID, 20)
}
