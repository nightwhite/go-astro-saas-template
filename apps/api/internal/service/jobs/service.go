package jobs

import (
	"context"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"go.uber.org/zap"
)

type Service struct {
	logger *zap.Logger
	jobs   *postgres.JobRecordRepository
	queue  *Queue
	cfg    *config.Config
}

func NewService(cfg *config.Config, logger *zap.Logger, jobs *postgres.JobRecordRepository, queue *Queue) *Service {
	return &Service{
		logger: logger,
		jobs:   jobs,
		queue:  queue,
		cfg:    cfg,
	}
}

func (s *Service) Bootstrap(ctx context.Context) error {
	return s.jobs.SeedDefaults(ctx, tenant.DefaultTenantID)
}

func (s *Service) List(ctx context.Context, query pagination.Query) ([]postgres.JobRecord, int, error) {
	return s.jobs.ListPage(ctx, tenant.TenantID(ctx), query)
}

func (s *Service) Explain(query pagination.Query) []string {
	return s.jobs.ExplainListPage(query)
}

func (s *Service) EnqueueDemo(ctx context.Context, jobType string, payload map[string]any) error {
	return s.queue.Enqueue(ctx, s.cfg.Jobs.DefaultQueue, jobType, payload)
}

func (s *Service) Replay(ctx context.Context, jobID string, payload map[string]any) error {
	if jobID == "" {
		return apperrors.BadRequest("job_id is required")
	}
	replayPayload := map[string]any{
		"replay_of_job_id": jobID,
		"replayed_at":      time.Now().UTC().Format(time.RFC3339),
	}
	for key, value := range payload {
		replayPayload[key] = value
	}
	return s.queue.Enqueue(ctx, s.cfg.Jobs.CriticalQueue, "jobs.replay", replayPayload)
}

func (s *Service) EnqueueScheduledMaintenance(ctx context.Context) error {
	maintenanceJobs := []string{
		"storage.cleanup",
		"files.expire_cleanup",
	}
	for _, jobType := range maintenanceJobs {
		payload := map[string]any{
			"scheduled":    true,
			"triggered_at": time.Now().UTC().Format(time.RFC3339),
		}
		if err := s.queue.Enqueue(ctx, s.cfg.Jobs.CriticalQueue, jobType, payload); err != nil {
			return err
		}
	}
	return nil
}
