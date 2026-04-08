package auth

import (
	"context"
	"testing"

	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
)

func TestHashAndVerifyPassword(t *testing.T) {
	hash, err := HashPassword("demo-password")
	if err != nil {
		t.Fatalf("HashPassword returned error: %v", err)
	}

	if !VerifyPassword(hash, "demo-password") {
		t.Fatal("VerifyPassword should accept original password")
	}
}

func TestUpdateCurrentUserNameValidation(t *testing.T) {
	svc := &Service{}
	err := svc.UpdateCurrentUserName(context.Background(), "token", "a", "b")
	if err == nil {
		t.Fatal("expected validation error")
	}
	if appErr, ok := err.(*apperrors.AppError); !ok || appErr.Code != "bad_request" {
		t.Fatalf("expected bad_request error, got: %#v", err)
	}
}

func TestChangeCurrentUserPasswordValidation(t *testing.T) {
	svc := &Service{}
	err := svc.ChangeCurrentUserPassword(context.Background(), "token", "old", "short")
	if err == nil {
		t.Fatal("expected validation error")
	}
	if appErr, ok := err.(*apperrors.AppError); !ok || appErr.Code != "bad_request" {
		t.Fatalf("expected bad_request error, got: %#v", err)
	}
}
