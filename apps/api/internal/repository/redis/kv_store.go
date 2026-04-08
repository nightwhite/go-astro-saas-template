package redis

import (
	"context"
	"encoding/json"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

type KVStore struct {
	client *goredis.Client
}

func NewKVStore(client *goredis.Client) *KVStore {
	return &KVStore{client: client}
}

func (s *KVStore) SetJSON(ctx context.Context, key string, value any, ttl time.Duration) error {
	payload, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return s.client.Set(ctx, key, payload, ttl).Err()
}

func (s *KVStore) GetJSON(ctx context.Context, key string, target any) error {
	payload, err := s.client.Get(ctx, key).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(payload, target)
}

func (s *KVStore) Delete(ctx context.Context, key string) error {
	return s.client.Del(ctx, key).Err()
}

func (s *KVStore) Incr(ctx context.Context, key string, ttl time.Duration) (int64, error) {
	value, err := s.client.Incr(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	if value == 1 && ttl > 0 {
		if expireErr := s.client.Expire(ctx, key, ttl).Err(); expireErr != nil {
			return 0, expireErr
		}
	}
	return value, nil
}
