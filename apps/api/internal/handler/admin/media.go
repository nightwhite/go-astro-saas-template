package admin

import (
	"regexp"

	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
)

var mediaFolderPattern = regexp.MustCompile(`^[a-zA-Z0-9/_-]{1,60}$`)

func (h *Handler) ListMedia(c *gin.Context) {
	cursor := c.Query("cursor")
	result, err := h.fileService.ListMedia(c.Request.Context(), cursor, 50)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, result)
}

func (h *Handler) UploadMedia(c *gin.Context) {
	var payload struct {
		FileName    string `json:"file_name"`
		ContentType string `json:"content_type"`
		SizeBytes   int64  `json:"size_bytes"`
		Folder      string `json:"folder"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if payload.Folder != "" && !mediaFolderPattern.MatchString(payload.Folder) {
		httpx.Fail(c, apperrors.BadRequest("invalid folder"))
		return
	}
	result, err := h.fileService.UploadMedia(c.Request.Context(), payload.FileName, payload.ContentType, payload.SizeBytes, payload.Folder)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "media.upload", "files", "上传媒体文件")
	httpx.OK(c, result)
}

func (h *Handler) DeleteMedia(c *gin.Context) {
	var payload struct {
		Key string `json:"key"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if payload.Key == "" {
		httpx.Fail(c, apperrors.BadRequest("key is required"))
		return
	}

	if err := h.fileService.DeleteMedia(c.Request.Context(), payload.Key); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "media.delete", "files", "删除媒体文件")
	httpx.OK(c, gin.H{"ok": true})
}
