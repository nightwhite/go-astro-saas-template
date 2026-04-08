package redis

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/night/go-astro-template/apps/api/internal/pkg/cache"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

type ResetTokenPayload struct {
	Token     string    `json:"token"`
	Email     string    `json:"email"`
	TenantID  string    `json:"tenant_id"`
	ExpiresAt time.Time `json:"expires_at"`
}

type ResetTokenStore struct {
	kv *KVStore
}

func NewResetTokenStore(kv *KVStore) *ResetTokenStore {
	return &ResetTokenStore{kv: kv}
}

func (s *ResetTokenStore) Create(ctx context.Context, email string, ttl time.Duration) (*ResetTokenPayload, error) {
	payload := &ResetTokenPayload{
		Token:     uuid.NewString(),
		Email:     email,
		TenantID:  tenant.TenantID(ctx),
		ExpiresAt: time.Now().Add(ttl),
	}

	if err := s.kv.SetJSON(ctx, resetTokenKey(ctx, payload.Token), payload, ttl); err != nil {
		return nil, err
	}

	return payload, nil
}

func (s *ResetTokenStore) Consume(ctx context.Context, token string) (*ResetTokenPayload, error) {
	var payload ResetTokenPayload
	if err := s.kv.GetJSON(ctx, resetTokenKey(ctx, token), &payload); err != nil {
		return nil, err
	}

	if payload.ExpiresAt.Before(time.Now()) {
		_ = s.kv.Delete(ctx, resetTokenKey(ctx, token))
		return nil, errors.New("expired reset token")
	}

	if err := s.kv.Delete(ctx, resetTokenKey(ctx, token)); err != nil {
		return nil, err
	}

	return &payload, nil
}

func resetTokenKey(ctx context.Context, token string) string {
	return cache.Key("tenant", tenant.TenantID(ctx), "auth", "reset_token", token)
}
