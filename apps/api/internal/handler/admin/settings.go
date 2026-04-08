package admin

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/repository/storage"
)

func (h *Handler) GetSettings(c *gin.Context) {
	category := c.Query("category")
	if category != "" {
		settings, err := h.settingsService.GetSettingsByCategory(c.Request.Context(), category)
		if err != nil {
			httpx.Fail(c, err)
			return
		}

		httpx.OK(c, gin.H{"settings": settings, "category": category})
		return
	}

	settings, err := h.settingsService.GetAllSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, gin.H{"settings": settings})
}

func (h *Handler) GetSiteSettings(c *gin.Context) {
	settings, err := h.settingsService.GetSiteSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"settings": settings, "category": "site"})
}

func (h *Handler) GetAuthSettings(c *gin.Context) {
	settings, err := h.settingsService.GetAuthSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"settings": settings, "category": "auth"})
}

func (h *Handler) GetSMTPSettings(c *gin.Context) {
	settings, err := h.settingsService.GetSMTPSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"settings": settings, "category": "smtp"})
}

func (h *Handler) GetStorageSettings(c *gin.Context) {
	settings, err := h.settingsService.GetStorageSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"settings": settings, "category": "storage"})
}

func (h *Handler) GetRuntimeSettings(c *gin.Context) {
	settings, err := h.settingsService.GetRuntimeSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"settings": settings, "category": "runtime"})
}

func (h *Handler) GetSEOSettings(c *gin.Context) {
	settings, err := h.settingsService.GetSEOSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"seo": settings})
}

func (h *Handler) SaveSiteSettings(c *gin.Context) {
	var payload map[string]any
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if err := h.settingsService.SaveSiteSettings(c.Request.Context(), payload); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "settings.site.save", "system_settings", "保存 site 配置")
	metrics.RecordAdminSettingsWrite()
	httpx.OK(c, gin.H{"saved": true})
}

func (h *Handler) SaveAuthSettings(c *gin.Context) {
	var payload map[string]any
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if err := h.settingsService.SaveAuthSettings(c.Request.Context(), payload); err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "settings.auth.save", "system_settings", "保存 auth 配置")
	metrics.RecordAdminSettingsWrite()
	httpx.OK(c, gin.H{"saved": true})
}

func (h *Handler) SaveSMTPSettings(c *gin.Context) {
	var payload map[string]any
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.settingsService.SaveSMTPSettings(c.Request.Context(), payload); err != nil {
		httpx.Fail(c, err)
		return
	}

	_ = h.auditService.Record(c.Request.Context(), "settings.smtp.save", "system_settings", "保存 smtp 配置")
	metrics.RecordAdminSettingsWrite()
	httpx.OK(c, gin.H{"saved": true})
}

func (h *Handler) SaveStorageSettings(c *gin.Context) {
	var payload map[string]any
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.settingsService.SaveStorageSettings(c.Request.Context(), payload); err != nil {
		httpx.Fail(c, err)
		return
	}

	_ = h.auditService.Record(c.Request.Context(), "settings.storage.save", "system_settings", "保存 storage 配置")
	metrics.RecordAdminSettingsWrite()
	httpx.OK(c, gin.H{"saved": true})
}

func (h *Handler) SaveRuntimeSettings(c *gin.Context) {
	var payload map[string]any
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.settingsService.SaveRuntimeSettings(c.Request.Context(), payload); err != nil {
		httpx.Fail(c, err)
		return
	}

	_ = h.auditService.Record(c.Request.Context(), "settings.runtime.save", "system_settings", "保存 runtime 配置")
	metrics.RecordAdminSettingsWrite()
	httpx.OK(c, gin.H{"saved": true})
}

func (h *Handler) SaveSEOSettings(c *gin.Context) {
	var payload map[string]any
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.settingsService.SaveSEOSettings(c.Request.Context(), payload); err != nil {
		httpx.Fail(c, err)
		return
	}

	settings, err := h.settingsService.GetSEOSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "settings.seo.save", "system_settings", "保存 seo 配置")
	metrics.RecordAdminSettingsWrite()
	httpx.OK(c, gin.H{"seo": settings, "saved": true})
}

func (h *Handler) InitSEOSettings(c *gin.Context) {
	settings, alreadyInitialized, err := h.settingsService.InitSEOSettings(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	if !alreadyInitialized {
		_ = h.auditService.Record(c.Request.Context(), "settings.seo.init", "system_settings", "初始化 seo 配置")
		metrics.RecordAdminSettingsWrite()
	}
	httpx.OK(c, gin.H{"seo": settings, "already_initialized": alreadyInitialized})
}

func (h *Handler) TestSMTP(c *gin.Context) {
	var payload struct {
		To string `json:"to"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	result, err := h.settingsService.TestSMTP(c.Request.Context(), payload.To)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, gin.H{"result": result})
}

func (h *Handler) TestStorage(c *gin.Context) {
	var payload struct {
		ObjectKey string `json:"object_key"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	result := h.settingsService.TestStorage(c.Request.Context(), payload.ObjectKey)
	if result["upload_url"] == "" {
		errCode := storage.ClassifyError(apperrors.BadRequest("storage invalid object key"))
		httpx.Fail(c, apperrors.BadRequest("storage test failed: "+errCode))
		return
	}
	httpx.OK(c, gin.H{"result": result})
}
