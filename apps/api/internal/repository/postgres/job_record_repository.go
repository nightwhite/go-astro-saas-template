package postgres

import (
	"context"
	"fmt"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entjobrecord "github.com/night/go-astro-template/apps/api/ent/jobrecord"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

type JobRecord struct {
	ID         string    `json:"id"`
	TenantID   string    `json:"tenant_id"`
	JobType    string    `json:"job_type"`
	Status     string    `json:"status"`
	Queue      string    `json:"queue"`
	Attempts   int       `json:"attempts"`
	LastError  string    `json:"last_error"`
	ExecutedAt time.Time `json:"executed_at"`
}

type JobRecordRepository struct {
	ent *dbent.Client
}

func NewJobRecordRepository(client *Client) *JobRecordRepository {
	return &JobRecordRepository{ent: client.Ent}
}

func (r *JobRecordRepository) SeedDefaults(ctx context.Context, tenantID string) error {
	defaults := []JobRecord{
		{TenantID: tenantID, JobType: "mail.send_test", Status: "success", Queue: "default", Attempts: 1, LastError: "", ExecutedAt: time.Now().Add(-10 * time.Minute)},
		{TenantID: tenantID, JobType: "storage.cleanup", Status: "queued", Queue: "default", Attempts: 0, LastError: "", ExecutedAt: time.Now().Add(-2 * time.Minute)},
		{TenantID: tenantID, JobType: "audit.flush", Status: "failed", Queue: "critical", Attempts: 3, LastError: "temporary transport timeout", ExecutedAt: time.Now().Add(-1 * time.Minute)},
	}

	for _, item := range defaults {
		existing, err := r.ent.JobRecord.Query().
			Where(
				entjobrecord.TenantID(item.TenantID),
				entjobrecord.JobType(item.JobType),
				entjobrecord.ExecutedAtEQ(item.ExecutedAt),
			).
			Only(ctx)
		if err == nil && existing != nil {
			continue
		}
		if err != nil && !dbent.IsNotFound(err) {
			return err
		}

		_, err = r.ent.JobRecord.Create().
			SetTenantID(item.TenantID).
			SetJobType(item.JobType).
			SetStatus(item.Status).
			SetQueue(item.Queue).
			SetAttempts(item.Attempts).
			SetLastError(item.LastError).
			SetExecutedAt(item.ExecutedAt).
			Save(ctx)
		if err != nil && !dbent.IsConstraintError(err) {
			return err
		}
	}
	return nil
}

func (r *JobRecordRepository) List(ctx context.Context, tenantID string, limit int) ([]JobRecord, error) {
	query := pagination.Query{
		Params:    pagination.Normalize(1, limit),
		SortBy:    "executed_at",
		SortOrder: "desc",
	}
	records, _, err := r.ListPage(ctx, tenantID, query)
	return records, err
}

func (r *JobRecordRepository) ListPage(ctx context.Context, tenantID string, query pagination.Query) ([]JobRecord, int, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	builder := r.ent.JobRecord.Query().Where(entjobrecord.TenantID(tenantID))
	for field, value := range pagination.ResolveFilter(query, map[string]string{
		"job_type": "job_type",
		"status":   "status",
		"queue":    "queue",
	}) {
		switch field {
		case "job_type":
			builder.Where(entjobrecord.JobTypeContainsFold(value))
		case "status":
			builder.Where(entjobrecord.StatusEQ(value))
		case "queue":
			builder.Where(entjobrecord.QueueEQ(value))
		}
	}
	total, err := builder.Clone().Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	sortField := pagination.ResolveSort(query.SortBy, map[string]string{
		"executed_at": entjobrecord.FieldExecutedAt,
		"job_type":    entjobrecord.FieldJobType,
		"status":      entjobrecord.FieldStatus,
		"attempts":    entjobrecord.FieldAttempts,
	}, entjobrecord.FieldExecutedAt)
	if query.SortOrder == "asc" {
		builder.Order(dbent.Asc(sortField))
	} else {
		builder.Order(dbent.Desc(sortField))
	}

	rows, err := builder.
		Offset(query.Offset()).
		Limit(query.PageSize).
		All(ctx)
	if err != nil {
		return nil, 0, err
	}

	records := make([]JobRecord, 0, query.PageSize)
	for _, row := range rows {
		records = append(records, JobRecord{
			ID:         row.ID,
			TenantID:   row.TenantID,
			JobType:    row.JobType,
			Status:     row.Status,
			Queue:      row.Queue,
			Attempts:   row.Attempts,
			LastError:  row.LastError,
			ExecutedAt: row.ExecutedAt,
		})
	}
	return records, total, nil
}

func (r *JobRecordRepository) Create(ctx context.Context, item JobRecord) (string, error) {
	record, err := r.ent.JobRecord.Create().
		SetTenantID(item.TenantID).
		SetJobType(item.JobType).
		SetStatus(item.Status).
		SetQueue(item.Queue).
		SetAttempts(item.Attempts).
		SetLastError(item.LastError).
		SetExecutedAt(item.ExecutedAt).
		Save(ctx)
	if err != nil {
		return "", err
	}
	return record.ID, nil
}

func (r *JobRecordRepository) UpdateStatus(ctx context.Context, tenantID, id, status, lastError string, attempts int) error {
	builder := r.ent.JobRecord.Update().
		Where(
			entjobrecord.TenantID(tenantID),
			entjobrecord.ID(id),
		).
		SetStatus(status).
		SetAttempts(attempts)
	if lastError != "" {
		builder.SetLastError(lastError)
	} else {
		builder.SetLastError("")
	}
	_, err := builder.Save(ctx)
	return err
}

func (r *JobRecordRepository) ExplainListPage(query pagination.Query) []string {
	filters := pagination.ResolveFilter(query, map[string]string{
		"job_type": "job_type",
		"status":   "status",
		"queue":    "queue",
	})
	notes := []string{
		"任务列表优先命中 job_records(tenant_id, executed_at) 与 job_records(tenant_id, job_type, status) 复合索引。",
		"高并发场景下建议按 status、queue 收窄扫描窗口，再分页读取最近 executed_at。",
	}
	if len(filters) > 0 {
		notes = append(notes, fmt.Sprintf("启用筛选字段: %v。job_type 支持模糊匹配，status/queue 为精确匹配。", filters))
	}
	return notes
}
