package auth

import (
	"context"
	"testing"

	"github.com/night/go-astro-template/apps/api/internal/config"
)

func TestBuildGoogleSSOStartURLRequiresBaseURL(t *testing.T) {
	service := &Service{
		cfg: &config.Config{
			App: config.AppConfig{BaseURL: ""},
		},
	}
	if _, err := service.BuildGoogleSSOStartURL(context.Background()); err == nil {
		t.Fatal("BuildGoogleSSOStartURL should fail when base url is empty")
	}
}

func TestGeneratePasskeyOptionsRequireEmail(t *testing.T) {
	service := &Service{
		cfg: &config.Config{
			App: config.AppConfig{Name: "test-app"},
		},
	}
	if _, err := service.GeneratePasskeyRegistrationOptions(context.Background(), ""); err == nil {
		t.Fatal("GeneratePasskeyRegistrationOptions should fail without email")
	}
	if _, err := service.GeneratePasskeyLoginOptions(context.Background(), ""); err == nil {
		t.Fatal("GeneratePasskeyLoginOptions should fail without email")
	}
}
