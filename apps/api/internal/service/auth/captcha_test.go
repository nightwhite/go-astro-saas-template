package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/night/go-astro-template/apps/api/internal/config"
)

type captchaVerifierStub struct {
	ok  bool
	err error
}

func (s captchaVerifierStub) Verify(_ context.Context, _ string) (bool, error) {
	return s.ok, s.err
}

func TestVerifyCaptchaDisabled(t *testing.T) {
	service := &Service{
		cfg: &config.Config{
			Security: config.SecurityConfig{
				CaptchaEnabled: false,
				CaptchaStrict:  false,
			},
		},
	}
	if err := service.verifyCaptcha(context.Background(), ""); err != nil {
		t.Fatalf("verifyCaptcha should ignore captcha when disabled: %v", err)
	}
}

func TestVerifyCaptchaStrictMissingToken(t *testing.T) {
	service := &Service{
		cfg: &config.Config{
			Security: config.SecurityConfig{
				CaptchaEnabled: true,
				CaptchaStrict:  true,
			},
		},
	}
	if err := service.verifyCaptcha(context.Background(), ""); err == nil {
		t.Fatal("verifyCaptcha should fail on missing token when strict enabled")
	}
}

func TestVerifyCaptchaVerifierFailure(t *testing.T) {
	service := &Service{
		cfg: &config.Config{
			Security: config.SecurityConfig{
				CaptchaEnabled: true,
				CaptchaStrict:  true,
			},
		},
		captcha: captchaVerifierStub{ok: false, err: errors.New("upstream unavailable")},
	}
	if err := service.verifyCaptcha(context.Background(), "cap_token"); err == nil {
		t.Fatal("verifyCaptcha should fail when verifier returns error")
	}
}

func TestVerifyCaptchaSuccess(t *testing.T) {
	service := &Service{
		cfg: &config.Config{
			Security: config.SecurityConfig{
				CaptchaEnabled: true,
				CaptchaStrict:  true,
			},
		},
		captcha: captchaVerifierStub{ok: true},
	}
	if err := service.verifyCaptcha(context.Background(), "cap_token"); err != nil {
		t.Fatalf("verifyCaptcha should pass with valid token: %v", err)
	}
}
