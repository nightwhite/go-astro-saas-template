package redis

import (
	"context"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/cache"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

type IdempotencyStore struct {
	kv *KVStore
}

func NewIdempotencyStore(kv *KVStore) *IdempotencyStore {
	return &IdempotencyStore{kv: kv}
}

func (s *IdempotencyStore) Lock(ctx context.Context, scope, key string, ttl time.Duration) (bool, error) {
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}
	value, err := s.kv.Incr(ctx, idempotencyKey(ctx, scope, key), ttl)
	if err != nil {
		return false, err
	}
	return value == 1, nil
}

func idempotencyKey(ctx context.Context, scope, key string) string {
	return cache.Key("tenant", tenant.TenantID(ctx), "idempotency", scope, key)
}
