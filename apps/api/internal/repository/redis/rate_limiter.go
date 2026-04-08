package redis

import (
	"context"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/cache"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

type RateLimiter struct {
	kv *KVStore
}

func NewRateLimiter(kv *KVStore) *RateLimiter {
	return &RateLimiter{kv: kv}
}

func (r *RateLimiter) Allow(ctx context.Context, scope, subject string, max int, window time.Duration) (bool, int64, error) {
	count, err := r.kv.Incr(ctx, rateLimitKey(ctx, scope, subject), window)
	if err != nil {
		return false, 0, err
	}
	return count <= int64(max), count, nil
}

func rateLimitKey(ctx context.Context, scope, subject string) string {
	return cache.Key("tenant", tenant.TenantID(ctx), "rate_limit", scope, subject)
}
