package admin

import (
	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

func (h *Handler) ListFiles(c *gin.Context) {
	query := pagination.FromRequest(c)
	files, total, err := h.fileService.List(c.Request.Context(), query)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.Paginated(c, gin.H{
		"files":   files,
		"filters": query.Filters,
		"explain": h.fileService.Explain(query),
	}, pagination.NewMeta(query.Page, query.PageSize, total))
}

func (h *Handler) CreateDemoFile(c *gin.Context) {
	var payload struct {
		FileName    string `json:"file_name"`
		ContentType string `json:"content_type"`
		SizeBytes   int64  `json:"size_bytes"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.fileService.CreateDemoRecord(c.Request.Context(), payload.FileName, payload.ContentType, payload.SizeBytes); err != nil {
		httpx.Fail(c, err)
		return
	}

	_ = h.auditService.Record(c.Request.Context(), "files.demo.create", "files", "创建 demo 文件记录")
	httpx.OK(c, gin.H{"created": true})
}

func (h *Handler) PrepareFileUpload(c *gin.Context) {
	var payload struct {
		FileName    string `json:"file_name"`
		ContentType string `json:"content_type"`
		SizeBytes   int64  `json:"size_bytes"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	result, err := h.fileService.PrepareUpload(c.Request.Context(), payload.FileName, payload.ContentType, payload.SizeBytes)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	_ = h.auditService.Record(c.Request.Context(), "files.upload.prepare", "files", "准备文件上传")
	httpx.OK(c, gin.H{"result": result})
}

func (h *Handler) HeadFileObject(c *gin.Context) {
	objectKey := c.Query("object_key")
	if objectKey == "" {
		httpx.Fail(c, apperrors.BadRequest("object_key is required"))
		return
	}

	result, err := h.fileService.InspectObject(c.Request.Context(), objectKey)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"result": result})
}

func (h *Handler) DeleteFileObject(c *gin.Context) {
	var payload struct {
		ObjectKey  string `json:"object_key"`
		Reconcile  bool   `json:"reconcile"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if payload.ObjectKey == "" {
		httpx.Fail(c, apperrors.BadRequest("object_key is required"))
		return
	}

	if payload.Reconcile {
		if err := h.fileService.ReconcileDeletion(c.Request.Context(), payload.ObjectKey); err != nil {
			httpx.Fail(c, err)
			return
		}
		_ = h.auditService.Record(c.Request.Context(), "files.object.reconcile_delete", "files", "执行文件删除补偿任务")
		httpx.OK(c, gin.H{"deleted": true, "reconciled": true})
		return
	}

	if err := h.fileService.DeleteObject(c.Request.Context(), payload.ObjectKey); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "files.object.delete", "files", "删除对象存储文件")
	httpx.OK(c, gin.H{"deleted": true})
}
