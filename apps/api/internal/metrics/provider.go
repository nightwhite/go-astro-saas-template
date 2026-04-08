package metrics

import (
	"context"

	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
)

type Provider struct {
	jobQueue *redisrepo.JobQueueStore
}

func NewProvider(jobQueue *redisrepo.JobQueueStore) *Provider {
	return &Provider{jobQueue: jobQueue}
}

func (p *Provider) Snapshot(ctx context.Context, prefix, defaultQueue, criticalQueue string) map[string]any {
	defaultBacklog := int64(0)
	criticalBacklog := int64(0)
	if p != nil && p.jobQueue != nil {
		defaultBacklog, _ = p.jobQueue.QueueLength(ctx, prefix, defaultQueue)
		criticalBacklog, _ = p.jobQueue.QueueLength(ctx, prefix, criticalQueue)
	}

	snapshot := map[string]any{
		"http_qps":               0,
		"http_p95_ms":            0,
		"queue_backlog_default":  defaultBacklog,
		"queue_backlog_critical": criticalBacklog,
		"queue_backlog_total":    defaultBacklog + criticalBacklog,
	}

	for key, value := range RuntimeSnapshot() {
		snapshot[key] = value
	}

	return snapshot
}
