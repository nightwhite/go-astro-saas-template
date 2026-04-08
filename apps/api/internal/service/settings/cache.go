package settings

import (
	"context"
	"errors"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/cache"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
	goredis "github.com/redis/go-redis/v9"
)

type settingsCache struct {
	store *redisrepo.KVStore
	ttl   time.Duration
}

func newSettingsCache(store *redisrepo.KVStore, ttl time.Duration) *settingsCache {
	return &settingsCache{store: store, ttl: ttl}
}

func (c *settingsCache) load(ctx context.Context, category string) (map[string]any, bool, error) {
	if c == nil || c.store == nil {
		return nil, false, nil
	}

	var payload map[string]any
	if err := c.store.GetJSON(ctx, settingsCacheKey(ctx, category), &payload); err != nil {
		if errors.Is(err, goredis.Nil) {
			return nil, false, nil
		}
		return nil, false, err
	}
	return payload, true, nil
}

func (c *settingsCache) save(ctx context.Context, category string, payload map[string]any) error {
	if c == nil || c.store == nil {
		return nil
	}
	return c.store.SetJSON(ctx, settingsCacheKey(ctx, category), payload, c.ttl)
}

func (c *settingsCache) delete(ctx context.Context, category string) error {
	if c == nil || c.store == nil {
		return nil
	}
	return c.store.Delete(ctx, settingsCacheKey(ctx, category))
}

func settingsCacheKey(ctx context.Context, category string) string {
	return cache.Key("tenant", tenant.TenantID(ctx), "settings", category)
}
