package auth

import (
	"context"
	"fmt"
	"strings"

	"github.com/night/go-astro-template/apps/api/internal/logging"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"go.uber.org/zap"
)

func (s *Service) CreateResetToken(ctx context.Context, email string) (map[string]any, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" {
		return nil, apperrors.BadRequest("email is required")
	}

	if s.resetTokens == nil {
		return nil, apperrors.Internal("reset token store unavailable")
	}

	payload, err := s.resetTokens.Create(ctx, email, s.cfg.Security.ResetRateLimitWindow)
	if err != nil {
		return nil, err
	}

	// Keep a hook point for real SMTP implementations; for dev we only log on the server.
	if s.mail != nil {
		result, mailErr := s.mail.SendPasswordReset(ctx, email, payload.Token)
		if mailErr != nil {
			return nil, mailErr
		}
		_ = result
	}

	// In development we log the reset token on the server side to support local testing,
	// but never expose the token in API responses.
	if s.cfg.App.Env == "development" {
		s.logger.Info(
			"password_reset_token_issued",
			zap.String("tenant_id", payload.TenantID),
			zap.String("email", payload.Email),
			zap.String("token", payload.Token),
		)
		if s.cfg.App.WebOrigin != "" {
			s.logger.Info(
				"password_reset_link",
				zap.String("url", fmt.Sprintf("%s/reset-password?token=%s", s.cfg.App.WebOrigin, payload.Token)),
			)
		}
	}

	s.logger.Info(
		"password reset token created",
		logging.String("tenant_id", payload.TenantID),
		logging.StringMasked("email", payload.Email),
	)
	metrics.RecordAuthPasswordReset()

	return map[string]any{
		"accepted": true,
		"target":   email,
		"message":  "reset token sent",
		"reset_url": func() string {
			if s.cfg.App.Env == "development" && s.cfg.App.WebOrigin != "" {
				return fmt.Sprintf("%s/reset-password?token=%s", s.cfg.App.WebOrigin, payload.Token)
			}
			return ""
		}(),
	}, nil
}

func (s *Service) ResetPassword(ctx context.Context, token, newPassword string) error {
	if strings.TrimSpace(token) == "" {
		return apperrors.BadRequest("reset token is required")
	}
	if len(strings.TrimSpace(newPassword)) < 8 {
		return apperrors.BadRequest("new password must be at least 8 characters")
	}

	if s.resetTokens == nil {
		return apperrors.Internal("reset token store unavailable")
	}

	entry, err := s.resetTokens.Consume(ctx, token)
	if err != nil {
		return apperrors.BadRequest("invalid or expired reset token")
	}

	passwordHash, err := HashPassword(newPassword)
	if err != nil {
		return err
	}

	if err := s.users.UpdatePasswordByEmail(ctx, entry.TenantID, entry.Email, passwordHash); err != nil {
		return err
	}

	s.logger.Info(
		"password reset completed",
		logging.String("tenant_id", entry.TenantID),
		logging.StringMasked("email", entry.Email),
	)
	metrics.RecordAuthPasswordReset()
	return nil
}
