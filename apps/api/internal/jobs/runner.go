package jobs

import (
	"context"
	"errors"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
	fileservice "github.com/night/go-astro-template/apps/api/internal/service/files"
	jobservice "github.com/night/go-astro-template/apps/api/internal/service/jobs"
	"go.uber.org/zap"
)

type Runner struct {
	cfg       *config.Config
	logger    *zap.Logger
	queue     *redisrepo.JobQueueStore
	jobs      *postgres.JobRecordRepository
	scheduler *jobservice.Service
	files     *fileservice.Service
}

func NewRunner(
	cfg *config.Config,
	logger *zap.Logger,
	queue *redisrepo.JobQueueStore,
	jobs *postgres.JobRecordRepository,
	scheduler *jobservice.Service,
	files *fileservice.Service,
) *Runner {
	return &Runner{cfg: cfg, logger: logger, queue: queue, jobs: jobs, scheduler: scheduler, files: files}
}

func (r *Runner) Run(ctx context.Context) error {
	r.logger.Info("worker started", zap.String("app", r.cfg.App.Name))
	ticker := time.NewTicker(r.cfg.Jobs.PollInterval)
	schedulerTicker := time.NewTicker(r.cfg.Jobs.ScheduleInterval)
	defer ticker.Stop()
	defer schedulerTicker.Stop()

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-schedulerTicker.C:
			if err := r.scheduleOnce(ctx); err != nil {
				r.logger.Warn("worker schedule failed", zap.Error(err))
			}
		case <-ticker.C:
			if err := r.consumeOnce(ctx); err != nil && !errors.Is(err, context.DeadlineExceeded) {
				r.logger.Warn("worker consume failed", zap.Error(err))
			}
		}
	}
}

func (r *Runner) consumeOnce(ctx context.Context) error {
	if r.queue == nil || r.jobs == nil {
		return nil
	}

	message, _, err := r.queue.Pop(ctx, r.cfg.Jobs.QueuePrefix, r.cfg.Jobs.CriticalQueue, r.cfg.Jobs.DefaultQueue)
	if err != nil || message == nil {
		return err
	}

	if err := r.jobs.UpdateStatus(ctx, message.TenantID, message.ID, "running", "", message.Attempts+1); err != nil {
		return err
	}

	if processErr := r.process(ctx, *message); processErr != nil {
		attempts := message.Attempts + 1
		if attempts > message.MaxRetries {
			metrics.RecordJobDeadLetter()
			return r.jobs.UpdateStatus(ctx, message.TenantID, message.ID, "dead_letter", processErr.Error(), attempts)
		}

		backoff := time.Duration(attempts) * r.cfg.Jobs.BackoffBase
		time.Sleep(backoff)
		message.Attempts = attempts
		metrics.RecordJobRetry()
		if err := r.queue.Push(ctx, r.cfg.Jobs.QueuePrefix, message.Queue, *message, r.cfg.Jobs.Retention); err != nil {
			return err
		}
		return r.jobs.UpdateStatus(ctx, message.TenantID, message.ID, "retrying", processErr.Error(), attempts)
	}

	return r.jobs.UpdateStatus(ctx, message.TenantID, message.ID, "success", "", message.Attempts+1)
}

func (r *Runner) scheduleOnce(ctx context.Context) error {
	if r.scheduler == nil {
		return nil
	}
	scheduleCtx := tenant.WithTenantID(ctx, tenant.DefaultTenantID)
	return r.scheduler.EnqueueScheduledMaintenance(scheduleCtx)
}

func (r *Runner) process(ctx context.Context, message redisrepo.JobMessage) error {
	r.logger.Info(
		"worker processed job",
		zap.String("job_id", message.ID),
		zap.String("tenant_id", message.TenantID),
		zap.String("job_type", message.JobType),
		zap.String("queue", message.Queue),
	)

	if message.Payload != nil {
		if shouldFail, _ := message.Payload["should_fail"].(bool); shouldFail {
			return errors.New("job requested failure")
		}
	}

	jobCtx := tenant.WithTenantID(ctx, message.TenantID)
	if message.JobType == "jobs.replay" {
		metrics.RecordJobReplay()
	}
	switch message.JobType {
	case "storage.cleanup", "files.expire_cleanup":
		if r.files != nil {
			return r.files.CleanupExpired(jobCtx)
		}
	case "files.delete_reconcile":
		if r.files != nil && message.Payload != nil {
			if objectKey, _ := message.Payload["object_key"].(string); objectKey != "" {
				return r.files.ReconcileDeletion(jobCtx, objectKey)
			}
		}
	}

	return nil
}
