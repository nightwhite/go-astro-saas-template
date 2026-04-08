package auth

import (
	"context"
	"strings"

	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
)

func (s *Service) verifyCaptcha(ctx context.Context, token string) error {
	if !s.cfg.Security.CaptchaEnabled {
		return nil
	}

	if strings.TrimSpace(token) == "" {
		if s.cfg.Security.CaptchaStrict {
			return apperrors.Forbidden("captcha token required")
		}
		return nil
	}

	if s.captcha == nil {
		if s.cfg.Security.CaptchaStrict {
			return apperrors.Internal("captcha verifier unavailable")
		}
		return nil
	}

	ok, err := s.captcha.Verify(ctx, token)
	if err != nil {
		return apperrors.Internal("captcha verification failed")
	}
	if !ok {
		return apperrors.Forbidden("invalid captcha token")
	}
	return nil
}

func (s *Service) LoginWithCaptcha(ctx context.Context, email, password, captchaToken string) (*LoginResult, error) {
	if err := s.verifyCaptcha(ctx, captchaToken); err != nil {
		return nil, err
	}
	return s.Login(ctx, email, password)
}

func (s *Service) RegisterWithCaptcha(ctx context.Context, email, password, displayName, verifyCode, captchaToken string) (map[string]any, error) {
	if err := s.verifyCaptcha(ctx, captchaToken); err != nil {
		return nil, err
	}
	return s.Register(ctx, email, password, displayName, verifyCode)
}

func (s *Service) CreateResetTokenWithCaptcha(ctx context.Context, email, captchaToken string) (map[string]any, error) {
	if err := s.verifyCaptcha(ctx, captchaToken); err != nil {
		return nil, err
	}
	return s.CreateResetToken(ctx, email)
}

func (s *Service) SendVerificationCodeWithCaptcha(ctx context.Context, email, captchaToken string) (map[string]any, error) {
	if err := s.verifyCaptcha(ctx, captchaToken); err != nil {
		return nil, err
	}
	return s.SendVerificationCode(ctx, email)
}

func (s *Service) ResetPasswordWithCaptcha(ctx context.Context, token, newPassword, captchaToken string) error {
	if err := s.verifyCaptcha(ctx, captchaToken); err != nil {
		return err
	}
	return s.ResetPassword(ctx, token, newPassword)
}
