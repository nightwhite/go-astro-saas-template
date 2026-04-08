package postgres

import (
	"context"
	"fmt"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entfile "github.com/night/go-astro-template/apps/api/ent/file"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

type FileRecord struct {
	ID          string    `json:"id"`
	ObjectKey   string    `json:"object_key"`
	FileName    string    `json:"file_name"`
	ContentType string    `json:"content_type"`
	SizeBytes   int64     `json:"size_bytes"`
	CreatedAt   time.Time `json:"created_at"`
}

type FileRepository struct {
	ent *dbent.Client
}

func NewFileRepository(client *Client) *FileRepository {
	return &FileRepository{ent: client.Ent}
}

func (r *FileRepository) Create(ctx context.Context, tenantID, objectKey, fileName, contentType, uploadedBy string, sizeBytes int64) error {
	builder := r.ent.File.Create().
		SetTenantID(tenantID).
		SetObjectKey(objectKey).
		SetFileName(fileName).
		SetContentType(contentType).
		SetSizeBytes(sizeBytes)
	if uploadedBy != "" {
		builder.SetUploadedBy(uploadedBy)
	}

	_, err := builder.Save(ctx)
	return err
}

func (r *FileRepository) DeleteByObjectKey(ctx context.Context, tenantID, objectKey string) error {
	_, err := r.ent.File.Delete().
		Where(
			entfile.TenantID(tenantID),
			entfile.ObjectKey(objectKey),
		).
		Exec(ctx)
	return err
}

func (r *FileRepository) List(ctx context.Context, tenantID string, limit int) ([]FileRecord, error) {
	query := pagination.Query{
		Params:    pagination.Normalize(1, limit),
		SortBy:    "created_at",
		SortOrder: "desc",
	}
	files, _, err := r.ListPage(ctx, tenantID, query)
	return files, err
}

func (r *FileRepository) ListPage(ctx context.Context, tenantID string, query pagination.Query) ([]FileRecord, int, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	builder := r.ent.File.Query().Where(entfile.TenantID(tenantID))
	for field, value := range pagination.ResolveFilter(query, map[string]string{
		"file_name":    "file_name",
		"content_type": "content_type",
	}) {
		switch field {
		case "file_name":
			builder.Where(entfile.FileNameContainsFold(value))
		case "content_type":
			builder.Where(entfile.ContentTypeEQ(value))
		}
	}
	total, err := builder.Clone().Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	sortField := pagination.ResolveSort(query.SortBy, map[string]string{
		"created_at":   entfile.FieldCreatedAt,
		"file_name":    entfile.FieldFileName,
		"size_bytes":   entfile.FieldSizeBytes,
		"content_type": entfile.FieldContentType,
	}, entfile.FieldCreatedAt)
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

	records := make([]FileRecord, 0, query.PageSize)
	for _, row := range rows {
		records = append(records, FileRecord{
			ID:          row.ID,
			ObjectKey:   row.ObjectKey,
			FileName:    row.FileName,
			ContentType: row.ContentType,
			SizeBytes:   row.SizeBytes,
			CreatedAt:   row.CreatedAt,
		})
	}
	return records, total, nil
}

func (r *FileRepository) ExplainListPage(query pagination.Query) []string {
	filters := pagination.ResolveFilter(query, map[string]string{
		"file_name":    "file_name",
		"content_type": "content_type",
	})
	notes := []string{
		"查询依赖 files(tenant_id, created_at) 和 files(tenant_id, object_key) 索引，分页按 created_at/size_bytes/file_name 白名单执行。",
		"对象主键读取应优先走 tenant_id + object_key 精确定位，避免扫描文件表。",
	}
	if len(filters) > 0 {
		notes = append(notes, fmt.Sprintf("启用筛选字段: %v。file_name 使用 contains fold，content_type 使用精确匹配。", filters))
	}
	return notes
}
