package admin

import (
	"strings"

	"github.com/gin-gonic/gin"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
)

func (h *Handler) ListMailTemplates(c *gin.Context) {
	items := h.mailTemplateService.ListTemplateMaps(c.Request.Context())
	httpx.OK(c, gin.H{"templates": items})
}

func (h *Handler) GetMailTemplate(c *gin.Context) {
	key := strings.TrimSpace(c.Param("templateKey"))
	item, ok := h.mailTemplateService.GetTemplateMap(c.Request.Context(), key)
	if !ok {
		httpx.Fail(c, apperrors.NotFound("template not found"))
		return
	}
	httpx.OK(c, gin.H{"template": item})
}

func (h *Handler) SaveMailTemplate(c *gin.Context) {
	key := strings.TrimSpace(c.Param("templateKey"))
	var payload struct {
		Subject     string `json:"subject"`
		Body        string `json:"body"`
		Description string `json:"description"`
		Enabled     bool   `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	item, err := h.mailTemplateService.SaveTemplateMap(c.Request.Context(), key, payload.Subject, payload.Body, payload.Description, payload.Enabled)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "settings.mail_template.save", "mail_templates", "保存邮件模板")
	httpx.OK(c, gin.H{"template": item})
}

func (h *Handler) PreviewMailTemplate(c *gin.Context) {
	key := strings.TrimSpace(c.Param("templateKey"))
	var payload struct {
		Payload map[string]any `json:"payload"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.mailTemplateService.RenderTemplatePreview(c.Request.Context(), key, payload.Payload)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"preview": result})
}

func (h *Handler) TestMailTemplate(c *gin.Context) {
	key := strings.TrimSpace(c.Param("templateKey"))
	var payload struct {
		To      string         `json:"to"`
		Payload map[string]any `json:"payload"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.mailTemplateService.SendTemplateTest(c.Request.Context(), key, payload.To, payload.Payload)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	_ = h.auditService.Record(c.Request.Context(), "settings.mail_template.test", "mail_templates", "测试邮件模板发送")
	httpx.OK(c, gin.H{"result": result})
}
