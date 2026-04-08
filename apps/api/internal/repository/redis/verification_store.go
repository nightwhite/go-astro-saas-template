package redis

import (
	"context"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/cache"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

type VerificationStore struct {
	kv *KVStore
}

func NewVerificationStore(kv *KVStore) *VerificationStore {
	return &VerificationStore{kv: kv}
}

func (s *VerificationStore) Save(ctx context.Context, scope, subject, code string, ttl time.Duration) error {
	return s.kv.SetJSON(ctx, verificationKey(ctx, scope, subject), map[string]any{
		"code": code,
	}, ttl)
}

func (s *VerificationStore) Verify(ctx context.Context, scope, subject, code string) (bool, error) {
	var payload struct {
		Code string `json:"code"`
	}
	if err := s.kv.GetJSON(ctx, verificationKey(ctx, scope, subject), &payload); err != nil {
		return false, err
	}
	if payload.Code != code {
		return false, nil
	}
	if err := s.kv.Delete(ctx, verificationKey(ctx, scope, subject)); err != nil {
		return false, err
	}
	return true, nil
}

func verificationKey(ctx context.Context, scope, subject string) string {
	return cache.Key("tenant", tenant.TenantID(ctx), "verification", scope, subject)
}
