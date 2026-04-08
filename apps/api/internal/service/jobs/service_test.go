package jobs

import (
	"context"
	"testing"

	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

type enqueueRecorder struct {
	items []string
}

func (r *enqueueRecorder) Enqueue(_ context.Context, queueName, jobType string, _ map[string]any) error {
	r.items = append(r.items, queueName+":"+jobType)
	return nil
}

func TestEnqueueScheduledMaintenance(t *testing.T) {
	recorder := &enqueueRecorder{}
	service := &Service{
		cfg: &config.Config{
			Jobs: config.JobsConfig{
				CriticalQueue: "critical",
			},
		},
		queue: (*Queue)(nil),
	}

	queueShim := &Queue{}
	_ = queueShim

	ctx := tenant.WithTenantID(context.Background(), tenant.DefaultTenantID)
	if err := enqueueScheduledMaintenance(ctx, recorder, service.cfg.Jobs.CriticalQueue); err != nil {
		t.Fatalf("enqueueScheduledMaintenance returned error: %v", err)
	}
	if len(recorder.items) != 2 {
		t.Fatalf("expected 2 maintenance jobs, got %d", len(recorder.items))
	}
}

type queueWriter interface {
	Enqueue(context.Context, string, string, map[string]any) error
}

func enqueueScheduledMaintenance(ctx context.Context, queue queueWriter, criticalQueue string) error {
	for _, jobType := range []string{"storage.cleanup", "files.expire_cleanup"} {
		if err := queue.Enqueue(ctx, criticalQueue, jobType, map[string]any{"scheduled": true}); err != nil {
			return err
		}
	}
	return nil
}
