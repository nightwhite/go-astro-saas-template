package jobs

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
)

type Queue struct {
	cfg   *config.Config
	store *redisrepo.JobQueueStore
	jobs  *postgres.JobRecordRepository
}

func NewQueue(cfg *config.Config, store *redisrepo.JobQueueStore, jobs *postgres.JobRecordRepository) *Queue {
	return &Queue{cfg: cfg, store: store, jobs: jobs}
}

func (q *Queue) Enqueue(ctx context.Context, queueName, jobType string, payload map[string]any) error {
	if q == nil || q.store == nil || q.jobs == nil {
		return nil
	}
	if queueName == "" {
		queueName = q.cfg.Jobs.DefaultQueue
	}

	record := postgres.JobRecord{
		TenantID:   tenant.TenantID(ctx),
		JobType:    jobType,
		Status:     "queued",
		Queue:      queueName,
		Attempts:   0,
		LastError:  "",
		ExecutedAt: time.Now(),
	}
	jobID, err := q.jobs.Create(ctx, record)
	if err != nil {
		return err
	}

	return q.store.Push(ctx, q.cfg.Jobs.QueuePrefix, queueName, redisrepo.JobMessage{
		ID:          fallbackID(jobID),
		TenantID:    tenant.TenantID(ctx),
		JobType:     jobType,
		Queue:       queueName,
		Attempts:    0,
		MaxRetries:  q.cfg.Jobs.MaxRetries,
		ScheduledAt: time.Now(),
		Payload:     payload,
	}, q.cfg.Jobs.Retention)
}

func fallbackID(value string) string {
	if value != "" {
		return value
	}
	return uuid.NewString()
}
