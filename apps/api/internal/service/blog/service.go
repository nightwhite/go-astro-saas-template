package blog

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"go.uber.org/zap"
)

var (
	slugInvalidChars = regexp.MustCompile(`[^a-z0-9\-]+`)
	slugExtraHyphen  = regexp.MustCompile(`\-+`)
)

type Service struct {
	logger          *zap.Logger
	repo            *postgres.BlogRepository
	previewBasePath string
}

func NewService(logger *zap.Logger, repo *postgres.BlogRepository, previewBasePath string) *Service {
	return &Service{
		logger:          logger,
		repo:            repo,
		previewBasePath: strings.TrimSpace(previewBasePath),
	}
}

func (s *Service) List(ctx context.Context, query pagination.Query) ([]postgres.BlogPostSummary, int, error) {
	return s.repo.ListPostsPage(ctx, tenant.TenantID(ctx), query)
}

func (s *Service) Explain(query pagination.Query) []string {
	return s.repo.ExplainListPage(query)
}

func (s *Service) Create(ctx context.Context, slug, defaultLanguage, authorName string) (*postgres.BlogPostDetail, error) {
	normalizedSlug, err := normalizeSlug(slug)
	if err != nil {
		return nil, err
	}
	language, err := normalizeLanguage(defaultLanguage)
	if err != nil {
		return nil, err
	}
	tenantID := tenant.TenantID(ctx)

	exists, err := s.repo.SlugExists(ctx, tenantID, normalizedSlug, "")
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, apperrors.Conflict("blog slug already exists")
	}

	created, err := s.repo.CreatePost(ctx, tenantID, postgres.BlogCreateInput{
		Slug:            normalizedSlug,
		DefaultLanguage: language,
		AuthorName:      sanitizeAuthor(authorName),
	})
	if err != nil {
		return nil, err
	}
	return created, nil
}

func (s *Service) Get(ctx context.Context, blogID string) (*postgres.BlogPostDetail, error) {
	if strings.TrimSpace(blogID) == "" {
		return nil, apperrors.BadRequest("blog_id is required")
	}
	record, err := s.repo.GetPostDetail(ctx, tenant.TenantID(ctx), blogID)
	if err != nil {
		return nil, err
	}
	if record == nil {
		return nil, apperrors.NotFound("blog post not found")
	}
	return record, nil
}

func (s *Service) GetBySlug(ctx context.Context, slug string) (*postgres.BlogPostDetail, error) {
	normalized, err := normalizeSlug(slug)
	if err != nil {
		return nil, err
	}
	record, err := s.repo.GetPostBySlug(ctx, tenant.TenantID(ctx), normalized)
	if err != nil {
		return nil, err
	}
	if record == nil {
		return nil, apperrors.NotFound("blog post not found")
	}
	return record, nil
}

func (s *Service) Update(ctx context.Context, blogID string, slug, status, defaultLanguage, authorName, featuredImage, adminNote *string) (*postgres.BlogPostDetail, error) {
	if strings.TrimSpace(blogID) == "" {
		return nil, apperrors.BadRequest("blog_id is required")
	}
	tenantID := tenant.TenantID(ctx)

	var normalizedSlug *string
	if slug != nil {
		parsedSlug, err := normalizeSlug(*slug)
		if err != nil {
			return nil, err
		}
		exists, err := s.repo.SlugExists(ctx, tenantID, parsedSlug, blogID)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, apperrors.Conflict("blog slug already exists")
		}
		normalizedSlug = &parsedSlug
	}

	var normalizedLanguage *string
	if defaultLanguage != nil {
		lang, err := normalizeLanguage(*defaultLanguage)
		if err != nil {
			return nil, err
		}
		normalizedLanguage = &lang
	}

	var normalizedStatus *string
	var publishedAt *time.Time
	if status != nil {
		parsedStatus, err := normalizeStatus(*status)
		if err != nil {
			return nil, err
		}
		normalizedStatus = &parsedStatus
		if parsedStatus == postgres.BlogStatusPublished {
			now := time.Now().UTC()
			publishedAt = &now
		} else {
			zero := time.Time{}
			publishedAt = &zero
		}
	}

	var normalizedAuthorName *string
	if authorName != nil {
		normalized := sanitizeAuthor(*authorName)
		normalizedAuthorName = &normalized
	}

	row, err := s.repo.UpdatePost(ctx, tenantID, blogID, postgres.BlogUpdateInput{
		Slug:            normalizedSlug,
		Status:          normalizedStatus,
		DefaultLanguage: normalizedLanguage,
		AuthorName:      normalizedAuthorName,
		FeaturedImage:   featuredImage,
		AdminNote:       adminNote,
		PublishedAt:     publishedAt,
	})
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, apperrors.NotFound("blog post not found")
	}
	return row, nil
}

func (s *Service) Delete(ctx context.Context, blogID string) error {
	if strings.TrimSpace(blogID) == "" {
		return apperrors.BadRequest("blog_id is required")
	}
	return s.repo.DeletePost(ctx, tenant.TenantID(ctx), blogID)
}

func (s *Service) GetTranslation(ctx context.Context, blogID, language string) (*postgres.BlogTranslationRow, error) {
	if strings.TrimSpace(blogID) == "" {
		return nil, apperrors.BadRequest("blog_id is required")
	}
	normalizedLanguage, err := normalizeLanguage(language)
	if err != nil {
		return nil, err
	}
	row, err := s.repo.GetTranslation(ctx, tenant.TenantID(ctx), blogID, normalizedLanguage)
	if err != nil {
		return nil, err
	}
	return row, nil
}

func (s *Service) SaveTranslation(ctx context.Context, blogID, language, title string, excerpt *string, content string, metaTitle, metaDescription, keywords *string) (*postgres.BlogTranslationRow, error) {
	if strings.TrimSpace(blogID) == "" {
		return nil, apperrors.BadRequest("blog_id is required")
	}
	normalizedLanguage, err := normalizeLanguage(language)
	if err != nil {
		return nil, err
	}
	normalizedTitle := strings.TrimSpace(title)
	if normalizedTitle == "" {
		return nil, apperrors.BadRequest("title is required")
	}

	row, err := s.repo.UpsertTranslation(ctx, tenant.TenantID(ctx), blogID, normalizedLanguage, postgres.BlogTranslationInput{
		Title:           normalizedTitle,
		Excerpt:         trimNullable(excerpt),
		Content:         strings.TrimSpace(content),
		MetaTitle:       trimNullable(metaTitle),
		MetaDescription: trimNullable(metaDescription),
		Keywords:        trimNullable(keywords),
	})
	if err != nil {
		return nil, err
	}
	return row, nil
}

func (s *Service) DeleteTranslation(ctx context.Context, blogID, language string) error {
	if strings.TrimSpace(blogID) == "" {
		return apperrors.BadRequest("blog_id is required")
	}
	normalizedLanguage, err := normalizeLanguage(language)
	if err != nil {
		return err
	}
	return s.repo.DeleteTranslation(ctx, tenant.TenantID(ctx), blogID, normalizedLanguage)
}

func (s *Service) Publish(ctx context.Context, blogID string) (*postgres.BlogPostDetail, error) {
	status := postgres.BlogStatusPublished
	return s.Update(ctx, blogID, nil, &status, nil, nil, nil, nil)
}

func (s *Service) Unpublish(ctx context.Context, blogID string) (*postgres.BlogPostDetail, error) {
	status := postgres.BlogStatusDraft
	return s.Update(ctx, blogID, nil, &status, nil, nil, nil, nil)
}

func (s *Service) CreatePreviewLink(ctx context.Context, blogID, language string, ttl time.Duration) (string, time.Time, error) {
	if strings.TrimSpace(blogID) == "" {
		return "", time.Time{}, apperrors.BadRequest("blog_id is required")
	}
	normalizedLanguage, err := normalizeLanguage(language)
	if err != nil {
		return "", time.Time{}, err
	}
	if ttl <= 0 {
		ttl = 2 * time.Hour
	}
	expiresAt := time.Now().UTC().Add(ttl)
	token := strings.ReplaceAll(uuid.NewString(), "-", "")
	tenantID := tenant.TenantID(ctx)

	if _, err := s.repo.CreatePreviewToken(ctx, tenantID, blogID, normalizedLanguage, token, expiresAt); err != nil {
		return "", time.Time{}, err
	}
	if deleted, deleteErr := s.repo.DeleteExpiredPreviewTokens(ctx, tenantID, time.Now().UTC()); deleteErr == nil && deleted > 0 {
		s.logger.Debug("deleted expired blog preview tokens", zap.Int("count", deleted))
	}

	basePath := s.previewBasePath
	if basePath == "" {
		basePath = "/preview/blog"
	}
	if !strings.HasPrefix(basePath, "/") {
		basePath = "/" + basePath
	}
	return fmt.Sprintf("%s?token=%s&lang=%s", basePath, token, normalizedLanguage), expiresAt, nil
}

func (s *Service) ResolvePreview(ctx context.Context, token string) (*postgres.BlogPreviewTokenRow, error) {
	if strings.TrimSpace(token) == "" {
		return nil, apperrors.BadRequest("token is required")
	}
	row, err := s.repo.FindPreviewToken(ctx, tenant.TenantID(ctx), strings.TrimSpace(token))
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, apperrors.NotFound("preview token not found")
	}
	if row.ExpiresAt.Before(time.Now().UTC()) {
		return nil, apperrors.Forbidden("preview token expired")
	}
	return row, nil
}

func (s *Service) ListPublished(ctx context.Context, language string, limit int) ([]postgres.BlogPostSummary, error) {
	normalizedLanguage, err := normalizeLanguage(language)
	if err != nil {
		return nil, err
	}
	return s.repo.ListPublishedPostsByLanguage(ctx, tenant.TenantID(ctx), normalizedLanguage, limit)
}

func (s *Service) ClearCache(_ context.Context) error {
	// 当前模板的 blog 查询未接外部 KV 版本缓存，这里提供兼容接口。
	return nil
}

func normalizeSlug(raw string) (string, error) {
	slug := strings.TrimSpace(strings.ToLower(raw))
	if slug == "" {
		return "", apperrors.BadRequest("slug is required")
	}
	slug = strings.ReplaceAll(slug, "_", "-")
	slug = slugInvalidChars.ReplaceAllString(slug, "-")
	slug = slugExtraHyphen.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if len(slug) < 2 || len(slug) > 120 {
		return "", apperrors.BadRequest("slug length must be between 2 and 120")
	}
	return slug, nil
}

func normalizeLanguage(raw string) (string, error) {
	language := strings.TrimSpace(strings.ToLower(raw))
	if language == "" {
		language = "en"
	}
	switch language {
	case "en", "zh", "ja":
		return language, nil
	default:
		return "", apperrors.BadRequest("language must be one of: en, zh, ja")
	}
}

func normalizeStatus(raw string) (string, error) {
	status := strings.TrimSpace(strings.ToLower(raw))
	switch status {
	case postgres.BlogStatusDraft, postgres.BlogStatusPublished, postgres.BlogStatusArchived:
		return status, nil
	default:
		return "", apperrors.BadRequest("status must be draft, published, or archived")
	}
}

func sanitizeAuthor(raw string) string {
	value := strings.TrimSpace(raw)
	if value == "" {
		return "Admin"
	}
	return value
}

func trimNullable(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
