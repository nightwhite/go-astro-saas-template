package admin

import (
	"context"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
)

type OverviewService interface {
	GetOverview(ctx context.Context) (map[string]any, error)
	GetBillingOverview(ctx context.Context) (map[string]any, error)
}

type SettingsService interface {
	GetAllSettings(ctx context.Context) (map[string]any, error)
	GetSettingsByCategory(ctx context.Context, category string) (map[string]any, error)
	GetSiteSettings(ctx context.Context) (map[string]any, error)
	GetAuthSettings(ctx context.Context) (map[string]any, error)
	GetSMTPSettings(ctx context.Context) (map[string]any, error)
	GetStorageSettings(ctx context.Context) (map[string]any, error)
	GetRuntimeSettings(ctx context.Context) (map[string]any, error)
	GetSEOSettings(ctx context.Context) (map[string]any, error)
	SaveSiteSettings(ctx context.Context, payload map[string]any) error
	SaveAuthSettings(ctx context.Context, payload map[string]any) error
	SaveSMTPSettings(ctx context.Context, payload map[string]any) error
	SaveStorageSettings(ctx context.Context, payload map[string]any) error
	SaveRuntimeSettings(ctx context.Context, payload map[string]any) error
	SaveSEOSettings(ctx context.Context, payload map[string]any) error
	InitSEOSettings(ctx context.Context) (map[string]any, bool, error)
	TestSMTP(ctx context.Context, to string) (map[string]any, error)
	TestStorage(ctx context.Context, objectKey string) map[string]any
}

type MailTemplateService interface {
	ListTemplateMaps(ctx context.Context) []map[string]any
	GetTemplateMap(ctx context.Context, key string) (map[string]any, bool)
	SaveTemplateMap(ctx context.Context, key, subject, body, description string, enabled bool) (map[string]any, error)
	RenderTemplatePreview(ctx context.Context, key string, payload map[string]any) (map[string]any, error)
	SendTemplateTest(ctx context.Context, key, to string, payload map[string]any) (string, error)
}

type UserService interface {
	List(ctx context.Context, query pagination.Query) ([]postgres.User, int, error)
	Detail(ctx context.Context, userID string) (map[string]any, error)
	Explain(query pagination.Query) []string
	Create(ctx context.Context, email, displayName, password, role string) (*postgres.User, error)
	Update(ctx context.Context, userID, displayName, role, status string) (*postgres.User, error)
	Delete(ctx context.Context, userID string) error
	ResetPassword(ctx context.Context, userID, newPassword string) error
}

type FileService interface {
	List(ctx context.Context, query pagination.Query) ([]postgres.FileRecord, int, error)
	Explain(query pagination.Query) []string
	CreateDemoRecord(ctx context.Context, fileName, contentType string, sizeBytes int64) error
	PrepareUpload(ctx context.Context, fileName, contentType string, sizeBytes int64) (map[string]any, error)
	InspectObject(ctx context.Context, objectKey string) (map[string]any, error)
	DeleteObject(ctx context.Context, objectKey string) error
	ReconcileDeletion(ctx context.Context, objectKey string) error
	ListMedia(ctx context.Context, cursor string, limit int) (map[string]any, error)
	UploadMedia(ctx context.Context, filename, contentType string, sizeBytes int64, folder string) (map[string]any, error)
	DeleteMedia(ctx context.Context, objectKey string) error
}

type RoleService interface {
	List(ctx context.Context, query pagination.Query) ([]postgres.Role, int, error)
	AuditPermissionSync(ctx context.Context)
	UpdateRolePermissions(ctx context.Context, roleID string, permissionKeys []string) error
	BindUserRole(ctx context.Context, email, roleID string) error
	ListCurrentUserRoles(ctx context.Context) ([]postgres.Role, error)
}

type JobService interface {
	List(ctx context.Context, query pagination.Query) ([]postgres.JobRecord, int, error)
	Explain(query pagination.Query) []string
	EnqueueDemo(ctx context.Context, jobType string, payload map[string]any) error
	Replay(ctx context.Context, jobID string, payload map[string]any) error
}

type AuditService interface {
	List(ctx context.Context, query pagination.Query) ([]postgres.AuditLog, int, error)
	Explain(query pagination.Query) []string
	Record(ctx context.Context, action, resource, detail string) error
}

type BillingService interface {
	Reconcile(ctx context.Context, tenantID string) (map[string]any, error)
}

type BlogService interface {
	List(ctx context.Context, query pagination.Query) ([]postgres.BlogPostSummary, int, error)
	Explain(query pagination.Query) []string
	Create(ctx context.Context, slug, defaultLanguage, authorName string) (*postgres.BlogPostDetail, error)
	Get(ctx context.Context, blogID string) (*postgres.BlogPostDetail, error)
	GetBySlug(ctx context.Context, slug string) (*postgres.BlogPostDetail, error)
	Update(ctx context.Context, blogID string, slug, status, defaultLanguage, authorName, featuredImage, adminNote *string) (*postgres.BlogPostDetail, error)
	Delete(ctx context.Context, blogID string) error
	GetTranslation(ctx context.Context, blogID, language string) (*postgres.BlogTranslationRow, error)
	SaveTranslation(ctx context.Context, blogID, language, title string, excerpt *string, content string, metaTitle, metaDescription, keywords *string) (*postgres.BlogTranslationRow, error)
	DeleteTranslation(ctx context.Context, blogID, language string) error
	Publish(ctx context.Context, blogID string) (*postgres.BlogPostDetail, error)
	Unpublish(ctx context.Context, blogID string) (*postgres.BlogPostDetail, error)
	CreatePreviewLink(ctx context.Context, blogID, language string, ttl time.Duration) (string, time.Time, error)
	ResolvePreview(ctx context.Context, token string) (*postgres.BlogPreviewTokenRow, error)
	ListPublished(ctx context.Context, language string, limit int) ([]postgres.BlogPostSummary, error)
	ClearCache(ctx context.Context) error
}
