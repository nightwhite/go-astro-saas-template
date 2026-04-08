package admin

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

func (h *Handler) ListBlogPosts(c *gin.Context) {
	query := pagination.FromRequest(c)
	posts, total, err := h.blogService.List(c.Request.Context(), query)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Paginated(c, gin.H{
		"posts":   posts,
		"filters": query.Filters,
		"explain": h.blogService.Explain(query),
	}, pagination.NewMeta(query.Page, query.PageSize, total))
}

func (h *Handler) CreateBlogPost(c *gin.Context) {
	var payload struct {
		Slug            string `json:"slug"`
		DefaultLanguage string `json:"default_language"`
		AuthorName      string `json:"author_name"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	created, err := h.blogService.Create(c.Request.Context(), payload.Slug, payload.DefaultLanguage, payload.AuthorName)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.create", "blog_posts", "创建博客文章")
	httpx.Created(c, gin.H{"post": created})
}

func (h *Handler) GetBlogPost(c *gin.Context) {
	blogID := c.Param("blogID")
	post, err := h.blogService.Get(c.Request.Context(), blogID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"post": post})
}

func (h *Handler) UpdateBlogPost(c *gin.Context) {
	blogID := c.Param("blogID")
	var payload struct {
		Slug            *string `json:"slug"`
		Status          *string `json:"status"`
		DefaultLanguage *string `json:"default_language"`
		AuthorName      *string `json:"author_name"`
		FeaturedImage   *string `json:"featured_image"`
		AdminNote       *string `json:"admin_note"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	post, err := h.blogService.Update(
		c.Request.Context(),
		blogID,
		payload.Slug,
		payload.Status,
		payload.DefaultLanguage,
		payload.AuthorName,
		payload.FeaturedImage,
		payload.AdminNote,
	)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.update", "blog_posts", "更新博客文章")
	httpx.OK(c, gin.H{"post": post})
}

func (h *Handler) DeleteBlogPost(c *gin.Context) {
	blogID := c.Param("blogID")
	if err := h.blogService.Delete(c.Request.Context(), blogID); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.delete", "blog_posts", "删除博客文章")
	httpx.OK(c, gin.H{"deleted": true})
}

func (h *Handler) GetBlogTranslation(c *gin.Context) {
	blogID := c.Param("blogID")
	lang := c.Param("lang")
	translation, err := h.blogService.GetTranslation(c.Request.Context(), blogID, lang)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"translation": translation})
}

func (h *Handler) SaveBlogTranslation(c *gin.Context) {
	blogID := c.Param("blogID")
	lang := c.Param("lang")
	var payload struct {
		Title           string  `json:"title"`
		Excerpt         *string `json:"excerpt"`
		Content         string  `json:"content"`
		MetaTitle       *string `json:"meta_title"`
		MetaDescription *string `json:"meta_description"`
		Keywords        *string `json:"keywords"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	translation, err := h.blogService.SaveTranslation(
		c.Request.Context(),
		blogID,
		lang,
		payload.Title,
		payload.Excerpt,
		payload.Content,
		payload.MetaTitle,
		payload.MetaDescription,
		payload.Keywords,
	)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.translation.save", "blog_translations", "保存博客多语言内容")
	httpx.OK(c, gin.H{"translation": translation})
}

func (h *Handler) DeleteBlogTranslation(c *gin.Context) {
	blogID := c.Param("blogID")
	lang := c.Param("lang")
	if err := h.blogService.DeleteTranslation(c.Request.Context(), blogID, lang); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.translation.delete", "blog_translations", "删除博客多语言内容")
	httpx.OK(c, gin.H{"deleted": true})
}

func (h *Handler) PublishBlogPost(c *gin.Context) {
	blogID := c.Param("blogID")
	post, err := h.blogService.Publish(c.Request.Context(), blogID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.publish", "blog_posts", "发布博客文章")
	httpx.OK(c, gin.H{"post": post})
}

func (h *Handler) UnpublishBlogPost(c *gin.Context) {
	blogID := c.Param("blogID")
	post, err := h.blogService.Unpublish(c.Request.Context(), blogID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.unpublish", "blog_posts", "下线博客文章")
	httpx.OK(c, gin.H{"post": post})
}

func (h *Handler) CreateBlogPreviewLink(c *gin.Context) {
	blogID := c.Param("blogID")
	var payload struct {
		Language string `json:"language"`
		TTL      int64  `json:"ttl_seconds"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil && !strings.Contains(err.Error(), "EOF") {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	ttl := 2 * time.Hour
	if payload.TTL > 0 {
		ttl = time.Duration(payload.TTL) * time.Second
	}
	url, expiresAt, err := h.blogService.CreatePreviewLink(c.Request.Context(), blogID, payload.Language, ttl)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.preview_link.create", "blog_preview_tokens", "创建博客预览链接")
	httpx.OK(c, gin.H{"url": url, "expires_at": expiresAt})
}

func (h *Handler) PublicBlogList(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")
	limit := 24
	posts, err := h.blogService.ListPublished(c.Request.Context(), lang, limit)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"posts": posts})
}

func (h *Handler) PublicBlogDetail(c *gin.Context) {
	slug := c.Param("slug")
	post, err := h.blogService.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	if post.Status != "published" {
		httpx.Fail(c, apperrors.NotFound("blog post not found"))
		return
	}
	httpx.OK(c, gin.H{"post": post})
}

func (h *Handler) PublicBlogPreview(c *gin.Context) {
	token := c.Query("token")
	preview, err := h.blogService.ResolvePreview(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	post, err := h.blogService.Get(c.Request.Context(), preview.BlogPostID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{
		"preview": preview,
		"post":    post,
	})
}

func (h *Handler) ClearBlogCache(c *gin.Context) {
	if err := h.blogService.ClearCache(c.Request.Context()); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "blog.cache.clear", "blog_cache", "清理博客缓存")
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) ServeMedia(c *gin.Context) {
	key := strings.TrimSpace(c.Param("path"))
	if key == "" {
		c.Status(http.StatusNotFound)
		return
	}
	normalized := strings.TrimPrefix(key, "/")
	if !strings.HasPrefix(normalized, "uploads/") {
		c.Status(http.StatusNotFound)
		return
	}
	raw := strings.TrimPrefix(normalized, "uploads/")
	result, err := h.fileService.InspectObject(c.Request.Context(), raw)
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}
	url, _ := result["download_url"].(string)
	if strings.TrimSpace(url) == "" {
		c.Status(http.StatusNotFound)
		return
	}
	c.Redirect(http.StatusTemporaryRedirect, url)
}
