package files

import (
	"context"
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/night/go-astro-template/apps/api/internal/config"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/identityctx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"github.com/night/go-astro-template/apps/api/internal/repository/storage"
	"go.uber.org/zap"
)

type Service struct {
	cfg     *config.Config
	logger  *zap.Logger
	files   *postgres.FileRepository
	storage *storage.Client
}

var mediaFolderPattern = regexp.MustCompile(`^[a-zA-Z0-9/_-]{1,60}$`)

func NewService(cfg *config.Config, logger *zap.Logger, files *postgres.FileRepository, storageClient *storage.Client) *Service {
	return &Service{cfg: cfg, logger: logger, files: files, storage: storageClient}
}

func (s *Service) List(ctx context.Context, query pagination.Query) ([]postgres.FileRecord, int, error) {
	return s.files.ListPage(ctx, tenant.TenantID(ctx), query)
}

func (s *Service) Explain(query pagination.Query) []string {
	return s.files.ExplainListPage(query)
}

func (s *Service) CreateDemoRecord(ctx context.Context, fileName, contentType string, sizeBytes int64) error {
	objectKey := s.BuildObjectKey(ctx, fileName)
	return s.files.Create(ctx, tenant.TenantID(ctx), objectKey, fileName, contentType, identityctx.ActorID(ctx), sizeBytes)
}

func (s *Service) SeedDemoRecords(ctx context.Context) error {
	nowName := fmt.Sprintf("welcome-%d.txt", time.Now().Unix())
	return s.CreateDemoRecord(ctx, nowName, "text/plain", 2048)
}

func (s *Service) BuildObjectKey(ctx context.Context, fileName string) string {
	extension := strings.ToLower(filepath.Ext(fileName))
	module := "files"
	userID := strings.TrimSpace(identityctx.ActorID(ctx))
	if userID == "" {
		userID = "anonymous"
	}
	datePath := time.Now().UTC().Format("2006/01/02")
	return fmt.Sprintf("%s/%s/%s/%s/%s%s", tenant.TenantID(ctx), module, userID, datePath, uuid.NewString(), extension)
}

func (s *Service) PrepareUpload(ctx context.Context, fileName, contentType string, sizeBytes int64) (map[string]any, error) {
	if err := s.ValidateUpload(fileName, contentType, sizeBytes); err != nil {
		return nil, err
	}

	objectKey := s.BuildObjectKey(ctx, fileName)
	if err := s.storage.ValidateObjectKey(objectKey); err != nil {
		return nil, err
	}
	if err := s.files.Create(ctx, tenant.TenantID(ctx), objectKey, fileName, contentType, identityctx.ActorID(ctx), sizeBytes); err != nil {
		return nil, err
	}

	headMeta, headErr := s.storage.HeadObject(ctx, objectKey)
	if headErr != nil {
		return nil, headErr
	}

	return map[string]any{
		"object_key":   objectKey,
		"upload_url":   s.storage.PresignUpload(ctx, objectKey, 15*time.Minute),
		"download_url": s.storage.PresignDownload(ctx, objectKey, 15*time.Minute),
		"storage_meta": headMeta,
	}, nil
}

func (s *Service) InspectObject(ctx context.Context, objectKey string) (map[string]any, error) {
	return s.storage.HeadObject(ctx, objectKey)
}

func (s *Service) DeleteObject(ctx context.Context, objectKey string) error {
	if err := s.storage.DeleteObject(ctx, objectKey); err != nil {
		return err
	}
	return s.files.DeleteByObjectKey(ctx, tenant.TenantID(ctx), objectKey)
}

func (s *Service) ValidateUpload(fileName, contentType string, sizeBytes int64) error {
	if strings.TrimSpace(fileName) == "" {
		return apperrors.BadRequest("file_name is required")
	}
	if strings.TrimSpace(contentType) == "" {
		return apperrors.BadRequest("content_type is required")
	}
	if sizeBytes <= 0 {
		return apperrors.BadRequest("size_bytes must be greater than 0")
	}
	if sizeBytes > s.cfg.Storage.MaxUploadSizeMB*1024*1024 {
		return apperrors.BadRequest("file exceeds max upload size")
	}

	for _, mimeType := range s.cfg.Storage.AllowedMimeTypes {
		if contentType == mimeType {
			return nil
		}
	}
	return apperrors.BadRequest("content_type is not allowed")
}

func (s *Service) ReconcileDeletion(ctx context.Context, objectKey string) error {
	if _, err := s.storage.HeadObject(ctx, objectKey); err == nil {
		return s.DeleteObject(ctx, objectKey)
	}
	return s.files.DeleteByObjectKey(ctx, tenant.TenantID(ctx), objectKey)
}

func (s *Service) CleanupExpired(ctx context.Context) error {
	query := pagination.Query{
		Params:    pagination.Normalize(1, 100),
		SortBy:    "created_at",
		SortOrder: "asc",
	}
	records, _, err := s.files.ListPage(ctx, tenant.TenantID(ctx), query)
	if err != nil {
		return err
	}

	expireBefore := time.Now().Add(-30 * 24 * time.Hour)
	for _, record := range records {
		if record.CreatedAt.After(expireBefore) {
			continue
		}
		if err := s.DeleteObject(ctx, record.ObjectKey); err != nil {
			s.logger.Warn("cleanup expired object failed", zap.String("object_key", record.ObjectKey), zap.Error(err))
		}
	}
	return nil
}

func (s *Service) ListMedia(ctx context.Context, cursor string, limit int) (map[string]any, error) {
	query := pagination.Query{
		Params:    pagination.Normalize(1, 50),
		SortBy:    "created_at",
		SortOrder: "desc",
	}
	if strings.TrimSpace(cursor) != "" {
		query.Filters = map[string]string{
			"file_name": strings.TrimSpace(cursor),
		}
	}
	if limit > 0 && limit <= 100 {
		query.PageSize = limit
	}

	rows, total, err := s.files.ListPage(ctx, tenant.TenantID(ctx), query)
	if err != nil {
		return nil, err
	}

	objects := make([]map[string]any, 0, len(rows))
	for _, row := range rows {
		mediaKey := "uploads/" + strings.TrimPrefix(row.ObjectKey, "/")
		objects = append(objects, map[string]any{
			"key":      mediaKey,
			"size":     row.SizeBytes,
			"uploaded": row.CreatedAt,
			"url":      "/media/" + mediaKey,
		})
	}
	nextCursor := ""
	if len(rows) > 0 {
		nextCursor = rows[len(rows)-1].FileName
	}

	return map[string]any{
		"objects":   objects,
		"truncated": len(rows) < total,
		"cursor":    nextCursor,
	}, nil
}

func (s *Service) UploadMedia(ctx context.Context, filename, contentType string, sizeBytes int64, folder string) (map[string]any, error) {
	name := strings.TrimSpace(filename)
	if name == "" {
		return nil, apperrors.BadRequest("file_name is required")
	}
	if sizeBytes <= 0 {
		return nil, apperrors.BadRequest("size_bytes must be greater than 0")
	}

	ext := strings.ToLower(filepath.Ext(name))
	switch ext {
	case ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".avif":
	default:
		return nil, apperrors.BadRequest("unsupported media extension")
	}

	if folder != "" && !mediaFolderPattern.MatchString(folder) {
		return nil, apperrors.BadRequest("invalid folder")
	}

	safeFolder := strings.Trim(strings.TrimSpace(folder), "/")
	virtualName := name
	if safeFolder != "" {
		virtualName = safeFolder + "/" + name
	}
	upload, err := s.PrepareUpload(ctx, virtualName, contentType, sizeBytes)
	if err != nil {
		return nil, err
	}
	rawObjectKey, _ := upload["object_key"].(string)
	mediaKey := "uploads/" + strings.TrimPrefix(rawObjectKey, "/")
	return map[string]any{
		"key": mediaKey,
		"url": "/media/" + mediaKey,
	}, nil
}

func (s *Service) DeleteMedia(ctx context.Context, objectKey string) error {
	normalized := strings.TrimSpace(objectKey)
	if normalized == "" {
		return apperrors.BadRequest("key is required")
	}
	if !strings.HasPrefix(normalized, "uploads/") {
		return apperrors.BadRequest("invalid media key")
	}
	raw := strings.TrimPrefix(normalized, "uploads/")
	return s.DeleteObject(ctx, raw)
}
