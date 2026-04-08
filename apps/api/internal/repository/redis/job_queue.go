package redis

import (
	"context"
	"encoding/json"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/cache"
)

type JobMessage struct {
	ID          string         `json:"id"`
	TenantID    string         `json:"tenant_id"`
	JobType     string         `json:"job_type"`
	Queue       string         `json:"queue"`
	Attempts    int            `json:"attempts"`
	MaxRetries  int            `json:"max_retries"`
	ScheduledAt time.Time      `json:"scheduled_at"`
	Payload     map[string]any `json:"payload"`
}

type JobQueueStore struct {
	client *KVStore
}

func NewJobQueueStore(client *KVStore) *JobQueueStore {
	return &JobQueueStore{client: client}
}

func (s *JobQueueStore) Push(ctx context.Context, prefix, queue string, message JobMessage, ttl time.Duration) error {
	body, err := json.Marshal(message)
	if err != nil {
		return err
	}
	return s.client.client.RPush(ctx, queueKey(prefix, queue), body).Err()
}

func (s *JobQueueStore) Pop(ctx context.Context, prefix string, queues ...string) (*JobMessage, string, error) {
	keys := make([]string, 0, len(queues))
	for _, queue := range queues {
		keys = append(keys, queueKey(prefix, queue))
	}

	result, err := s.client.client.BLPop(ctx, 1*time.Second, keys...).Result()
	if err != nil {
		return nil, "", err
	}
	if len(result) != 2 {
		return nil, "", nil
	}

	var message JobMessage
	if err := json.Unmarshal([]byte(result[1]), &message); err != nil {
		return nil, "", err
	}
	return &message, result[0], nil
}

func (s *JobQueueStore) QueueLength(ctx context.Context, prefix, queue string) (int64, error) {
	return s.client.client.LLen(ctx, queueKey(prefix, queue)).Result()
}

func queueKey(prefix, queue string) string {
	return cache.Key(prefix, "jobs", queue)
}
