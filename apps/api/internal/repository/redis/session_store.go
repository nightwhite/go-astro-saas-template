package redis

import (
	"context"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/cache"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	goredis "github.com/redis/go-redis/v9"
)

type SessionStore struct {
	client *goredis.Client
}

func NewSessionStore(client *goredis.Client) *SessionStore {
	return &SessionStore{client: client}
}

func (s *SessionStore) Set(ctx context.Context, token, userID string, ttl time.Duration) error {
	return s.client.Set(ctx, sessionKey(ctx, token), userID, ttl).Err()
}

func (s *SessionStore) Get(ctx context.Context, token string) (string, error) {
	return s.client.Get(ctx, sessionKey(ctx, token)).Result()
}

func (s *SessionStore) Delete(ctx context.Context, token string) error {
	return s.client.Del(ctx, sessionKey(ctx, token)).Err()
}

func sessionKey(ctx context.Context, token string) string {
	return cache.Key("tenant", tenant.TenantID(ctx), "session", token)
}
