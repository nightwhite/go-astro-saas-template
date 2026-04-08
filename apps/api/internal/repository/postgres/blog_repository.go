package postgres

import (
	"context"
	"fmt"
	"strings"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entblogpost "github.com/night/go-astro-template/apps/api/ent/blogpost"
	entblogpreviewtoken "github.com/night/go-astro-template/apps/api/ent/blogpreviewtoken"
	entblogtranslation "github.com/night/go-astro-template/apps/api/ent/blogtranslation"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

const (
	BlogStatusDraft     = "draft"
	BlogStatusPublished = "published"
	BlogStatusArchived  = "archived"
)

type BlogPostSummary struct {
	ID                string               `json:"id"`
	TenantID          string               `json:"tenant_id"`
	Slug              string               `json:"slug"`
	Status            string               `json:"status"`
	DefaultLanguage   string               `json:"default_language"`
	AuthorName        string               `json:"author_name"`
	FeaturedImage     *string              `json:"featured_image,omitempty"`
	AdminNote         *string              `json:"admin_note,omitempty"`
	PublishedAt       *time.Time           `json:"published_at,omitempty"`
	CreatedAt         time.Time            `json:"created_at"`
	UpdatedAt         time.Time            `json:"updated_at"`
	AvailableLanguages []string            `json:"available_languages"`
	Translations      []BlogTranslationRow `json:"translations"`
}

type BlogPostDetail = BlogPostSummary

type BlogTranslationRow struct {
	ID              string     `json:"id"`
	BlogPostID      string     `json:"blog_post_id"`
	Language        string     `json:"language"`
	Title           string     `json:"title"`
	Excerpt         *string    `json:"excerpt,omitempty"`
	Content         string     `json:"content"`
	MetaTitle       *string    `json:"meta_title,omitempty"`
	MetaDescription *string    `json:"meta_description,omitempty"`
	Keywords        *string    `json:"keywords,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type BlogPreviewTokenRow struct {
	ID         string    `json:"id"`
	BlogPostID string    `json:"blog_post_id"`
	Token      string    `json:"token"`
	Language   string    `json:"language"`
	ExpiresAt  time.Time `json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
}

type BlogCreateInput struct {
	Slug            string
	DefaultLanguage string
	AuthorName      string
}

type BlogUpdateInput struct {
	Slug            *string
	Status          *string
	DefaultLanguage *string
	AuthorName      *string
	FeaturedImage   *string
	AdminNote       *string
	PublishedAt     *time.Time
}

type BlogTranslationInput struct {
	Title           string
	Excerpt         *string
	Content         string
	MetaTitle       *string
	MetaDescription *string
	Keywords        *string
}

type BlogRepository struct {
	ent *dbent.Client
}

func NewBlogRepository(client *Client) *BlogRepository {
	return &BlogRepository{ent: client.Ent}
}

func (r *BlogRepository) SlugExists(ctx context.Context, tenantID, slug string, excludeBlogID string) (bool, error) {
	builder := r.ent.BlogPost.Query().Where(
		entblogpost.TenantID(tenantID),
		entblogpost.Slug(slug),
	)
	if strings.TrimSpace(excludeBlogID) != "" {
		builder.Where(entblogpost.IDNEQ(excludeBlogID))
	}
	count, err := builder.Count(ctx)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *BlogRepository) CreatePost(ctx context.Context, tenantID string, input BlogCreateInput) (*BlogPostDetail, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	record, err := r.ent.BlogPost.Create().
		SetTenantID(tenantID).
		SetSlug(input.Slug).
		SetStatus(BlogStatusDraft).
		SetDefaultLanguage(defaultString(input.DefaultLanguage, "en")).
		SetAuthorName(defaultString(input.AuthorName, "Admin")).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return r.GetPostDetail(ctx, tenantID, record.ID)
}

func (r *BlogRepository) GetPostDetail(ctx context.Context, tenantID, blogID string) (*BlogPostDetail, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	post, err := r.ent.BlogPost.Query().
		Where(
			entblogpost.TenantID(tenantID),
			entblogpost.ID(blogID),
		).
		WithTranslations(func(query *dbent.BlogTranslationQuery) {
			query.Order(dbent.Asc(entblogtranslation.FieldLanguage))
		}).
		Only(ctx)
	if err != nil {
		if dbent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return mapBlogPostWithTranslations(post), nil
}

func (r *BlogRepository) GetPostBySlug(ctx context.Context, tenantID, slug string) (*BlogPostDetail, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	post, err := r.ent.BlogPost.Query().
		Where(
			entblogpost.TenantID(tenantID),
			entblogpost.Slug(slug),
		).
		WithTranslations(func(query *dbent.BlogTranslationQuery) {
			query.Order(dbent.Asc(entblogtranslation.FieldLanguage))
		}).
		Only(ctx)
	if err != nil {
		if dbent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return mapBlogPostWithTranslations(post), nil
}

func (r *BlogRepository) ListPostsPage(ctx context.Context, tenantID string, query pagination.Query) ([]BlogPostSummary, int, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	builder := r.ent.BlogPost.Query().
		Where(entblogpost.TenantID(tenantID))

	for field, value := range pagination.ResolveFilter(query, map[string]string{
		"slug":   "slug",
		"status": "status",
		"lang":   "lang",
	}) {
		switch field {
		case "slug":
			builder.Where(entblogpost.SlugContainsFold(value))
		case "status":
			builder.Where(entblogpost.StatusEQ(strings.ToLower(strings.TrimSpace(value))))
		case "lang":
			builder.Where(entblogpost.DefaultLanguageEQ(strings.ToLower(strings.TrimSpace(value))))
		}
	}

	total, err := builder.Clone().Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	sortField := pagination.ResolveSort(query.SortBy, map[string]string{
		"created_at":   entblogpost.FieldCreatedAt,
		"updated_at":   entblogpost.FieldUpdatedAt,
		"published_at": entblogpost.FieldPublishedAt,
		"slug":         entblogpost.FieldSlug,
		"status":       entblogpost.FieldStatus,
		"language":     entblogpost.FieldDefaultLanguage,
	}, entblogpost.FieldCreatedAt)
	if query.SortOrder == "asc" {
		builder.Order(dbent.Asc(sortField))
	} else {
		builder.Order(dbent.Desc(sortField))
	}

	rows, err := builder.
		WithTranslations(func(tq *dbent.BlogTranslationQuery) {
			tq.Select(entblogtranslation.FieldID, entblogtranslation.FieldBlogPostID, entblogtranslation.FieldLanguage, entblogtranslation.FieldTitle)
			tq.Order(dbent.Asc(entblogtranslation.FieldLanguage))
		}).
		Offset(query.Offset()).
		Limit(query.PageSize).
		All(ctx)
	if err != nil {
		return nil, 0, err
	}

	result := make([]BlogPostSummary, 0, len(rows))
	for _, row := range rows {
		result = append(result, *mapBlogPostWithTranslations(row))
	}
	return result, total, nil
}

func (r *BlogRepository) UpdatePost(ctx context.Context, tenantID, blogID string, input BlogUpdateInput) (*BlogPostDetail, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	builder := r.ent.BlogPost.Update().
		Where(
			entblogpost.TenantID(tenantID),
			entblogpost.ID(blogID),
		)

	if input.Slug != nil {
		builder.SetSlug(*input.Slug)
	}
	if input.Status != nil {
		builder.SetStatus(*input.Status)
	}
	if input.DefaultLanguage != nil {
		builder.SetDefaultLanguage(*input.DefaultLanguage)
	}
	if input.AuthorName != nil {
		builder.SetAuthorName(*input.AuthorName)
	}
	if input.FeaturedImage != nil {
		if strings.TrimSpace(*input.FeaturedImage) == "" {
			builder.ClearFeaturedImage()
		} else {
			builder.SetFeaturedImage(strings.TrimSpace(*input.FeaturedImage))
		}
	}
	if input.AdminNote != nil {
		if strings.TrimSpace(*input.AdminNote) == "" {
			builder.ClearAdminNote()
		} else {
			builder.SetAdminNote(strings.TrimSpace(*input.AdminNote))
		}
	}
	if input.PublishedAt != nil {
		builder.SetPublishedAt(*input.PublishedAt)
	}

	if _, err := builder.Save(ctx); err != nil {
		if dbent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return r.GetPostDetail(ctx, tenantID, blogID)
}

func (r *BlogRepository) DeletePost(ctx context.Context, tenantID, blogID string) error {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	_, err := r.ent.BlogPreviewToken.Delete().
		Where(
			entblogpreviewtoken.TenantID(tenantID),
			entblogpreviewtoken.BlogPostID(blogID),
		).
		Exec(ctx)
	if err != nil {
		return err
	}

	_, err = r.ent.BlogTranslation.Delete().
		Where(
			entblogtranslation.TenantID(tenantID),
			entblogtranslation.BlogPostID(blogID),
		).
		Exec(ctx)
	if err != nil {
		return err
	}

	_, err = r.ent.BlogPost.Delete().
		Where(
			entblogpost.TenantID(tenantID),
			entblogpost.ID(blogID),
		).
		Exec(ctx)
	return err
}

func (r *BlogRepository) UpsertTranslation(ctx context.Context, tenantID, blogID, language string, input BlogTranslationInput) (*BlogTranslationRow, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	existing, err := r.ent.BlogTranslation.Query().
		Where(
			entblogtranslation.TenantID(tenantID),
			entblogtranslation.BlogPostID(blogID),
			entblogtranslation.Language(language),
		).
		Only(ctx)
	if err != nil && !dbent.IsNotFound(err) {
		return nil, err
	}

	if existing == nil {
		created, createErr := r.ent.BlogTranslation.Create().
			SetTenantID(tenantID).
			SetBlogPostID(blogID).
			SetLanguage(language).
			SetTitle(strings.TrimSpace(input.Title)).
			SetContent(input.Content).
			SetNillableExcerpt(trimSpacePtr(input.Excerpt)).
			SetNillableMetaTitle(trimSpacePtr(input.MetaTitle)).
			SetNillableMetaDescription(trimSpacePtr(input.MetaDescription)).
			SetNillableKeywords(trimSpacePtr(input.Keywords)).
			Save(ctx)
		if createErr != nil {
			return nil, createErr
		}
		return mapBlogTranslation(created), nil
	}

	updated, err := r.ent.BlogTranslation.UpdateOneID(existing.ID).
		SetTitle(strings.TrimSpace(input.Title)).
		SetContent(input.Content).
		SetNillableExcerpt(trimSpacePtr(input.Excerpt)).
		SetNillableMetaTitle(trimSpacePtr(input.MetaTitle)).
		SetNillableMetaDescription(trimSpacePtr(input.MetaDescription)).
		SetNillableKeywords(trimSpacePtr(input.Keywords)).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return mapBlogTranslation(updated), nil
}

func (r *BlogRepository) GetTranslation(ctx context.Context, tenantID, blogID, language string) (*BlogTranslationRow, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	row, err := r.ent.BlogTranslation.Query().
		Where(
			entblogtranslation.TenantID(tenantID),
			entblogtranslation.BlogPostID(blogID),
			entblogtranslation.Language(language),
		).
		Only(ctx)
	if err != nil {
		if dbent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return mapBlogTranslation(row), nil
}

func (r *BlogRepository) DeleteTranslation(ctx context.Context, tenantID, blogID, language string) error {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	_, err := r.ent.BlogTranslation.Delete().
		Where(
			entblogtranslation.TenantID(tenantID),
			entblogtranslation.BlogPostID(blogID),
			entblogtranslation.Language(language),
		).
		Exec(ctx)
	return err
}

func (r *BlogRepository) CreatePreviewToken(ctx context.Context, tenantID, blogID, language, token string, expiresAt time.Time) (*BlogPreviewTokenRow, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	created, err := r.ent.BlogPreviewToken.Create().
		SetTenantID(tenantID).
		SetBlogPostID(blogID).
		SetLanguage(language).
		SetToken(token).
		SetExpiresAt(expiresAt).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return mapBlogPreviewToken(created), nil
}

func (r *BlogRepository) FindPreviewToken(ctx context.Context, tenantID, token string) (*BlogPreviewTokenRow, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	row, err := r.ent.BlogPreviewToken.Query().
		Where(
			entblogpreviewtoken.TenantID(tenantID),
			entblogpreviewtoken.Token(token),
		).
		Only(ctx)
	if err != nil {
		if dbent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return mapBlogPreviewToken(row), nil
}

func (r *BlogRepository) DeleteExpiredPreviewTokens(ctx context.Context, tenantID string, now time.Time) (int, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	count, err := r.ent.BlogPreviewToken.Delete().
		Where(
			entblogpreviewtoken.TenantID(tenantID),
			entblogpreviewtoken.ExpiresAtLT(now),
		).
		Exec(ctx)
	return count, err
}

func (r *BlogRepository) ListPublishedPostsByLanguage(ctx context.Context, tenantID, language string, limit int) ([]BlogPostSummary, error) {
	started := time.Now()
	defer func() {
		metrics.RecordSlowQuery(time.Since(started))
	}()

	if limit <= 0 {
		limit = 12
	}

	rows, err := r.ent.BlogPost.Query().
		Where(
			entblogpost.TenantID(tenantID),
			entblogpost.StatusEQ(BlogStatusPublished),
		).
		Order(dbent.Desc(entblogpost.FieldPublishedAt)).
		Limit(limit).
		WithTranslations(func(query *dbent.BlogTranslationQuery) {
			query.Where(entblogtranslation.LanguageEQ(language))
			query.Order(dbent.Asc(entblogtranslation.FieldLanguage))
		}).
		All(ctx)
	if err != nil {
		return nil, err
	}

	result := make([]BlogPostSummary, 0, len(rows))
	for _, row := range rows {
		mapped := mapBlogPostWithTranslations(row)
		if len(mapped.Translations) == 0 {
			continue
		}
		result = append(result, *mapped)
	}
	return result, nil
}

func (r *BlogRepository) ExplainListPage(query pagination.Query) []string {
	filters := pagination.ResolveFilter(query, map[string]string{
		"slug":   "slug",
		"status": "status",
		"lang":   "lang",
	})
	notes := []string{
		"查询依赖 blog_posts(tenant_id, status, published_at)、blog_posts(tenant_id, created_at) 与 blog_posts(tenant_id, slug) 索引。",
		"分页排序白名单: created_at/updated_at/published_at/slug/status/language。",
		"Translation 使用 tenant_id + blog_post_id + language 唯一键，避免重复语言行。",
	}
	if len(filters) > 0 {
		notes = append(notes, fmt.Sprintf("启用筛选字段: %v。slug 使用 contains fold，status/lang 使用等值匹配。", filters))
	}
	return notes
}

func mapBlogPostWithTranslations(row *dbent.BlogPost) *BlogPostDetail {
	translations := make([]BlogTranslationRow, 0, len(row.Edges.Translations))
	availableLanguages := make([]string, 0, len(row.Edges.Translations))
	for _, tr := range row.Edges.Translations {
		translations = append(translations, BlogTranslationRow{
			ID:              tr.ID,
			BlogPostID:      tr.BlogPostID,
			Language:        tr.Language,
			Title:           tr.Title,
			Excerpt:         tr.Excerpt,
			Content:         tr.Content,
			MetaTitle:       tr.MetaTitle,
			MetaDescription: tr.MetaDescription,
			Keywords:        tr.Keywords,
			CreatedAt:       tr.CreatedAt,
			UpdatedAt:       tr.UpdatedAt,
		})
		availableLanguages = append(availableLanguages, tr.Language)
	}

	if len(availableLanguages) == 0 && strings.TrimSpace(row.DefaultLanguage) != "" {
		availableLanguages = append(availableLanguages, strings.TrimSpace(row.DefaultLanguage))
	}

	return &BlogPostDetail{
		ID:                 row.ID,
		TenantID:           row.TenantID,
		Slug:               row.Slug,
		Status:             row.Status,
		DefaultLanguage:    row.DefaultLanguage,
		AuthorName:         row.AuthorName,
		FeaturedImage:      row.FeaturedImage,
		AdminNote:          row.AdminNote,
		PublishedAt:        row.PublishedAt,
		CreatedAt:          row.CreatedAt,
		UpdatedAt:          row.UpdatedAt,
		AvailableLanguages: availableLanguages,
		Translations:       translations,
	}
}

func mapBlogTranslation(row *dbent.BlogTranslation) *BlogTranslationRow {
	return &BlogTranslationRow{
		ID:              row.ID,
		BlogPostID:      row.BlogPostID,
		Language:        row.Language,
		Title:           row.Title,
		Excerpt:         row.Excerpt,
		Content:         row.Content,
		MetaTitle:       row.MetaTitle,
		MetaDescription: row.MetaDescription,
		Keywords:        row.Keywords,
		CreatedAt:       row.CreatedAt,
		UpdatedAt:       row.UpdatedAt,
	}
}

func mapBlogPreviewToken(row *dbent.BlogPreviewToken) *BlogPreviewTokenRow {
	return &BlogPreviewTokenRow{
		ID:         row.ID,
		BlogPostID: row.BlogPostID,
		Token:      row.Token,
		Language:   row.Language,
		ExpiresAt:  row.ExpiresAt,
		CreatedAt:  row.CreatedAt,
	}
}

func trimSpacePtr(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func defaultString(value, fallback string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return fallback
	}
	return trimmed
}

