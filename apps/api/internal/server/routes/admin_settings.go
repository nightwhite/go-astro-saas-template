package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminSettingsRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/settings", middleware.RequirePermissions("admin.settings.read"), handler.GetSettings)
	group.GET("/settings/site", middleware.RequirePermissions("admin.settings.read"), handler.GetSiteSettings)
	group.GET("/settings/auth", middleware.RequirePermissions("admin.settings.read"), handler.GetAuthSettings)
	group.GET("/settings/smtp", middleware.RequirePermissions("admin.settings.read"), handler.GetSMTPSettings)
	group.GET("/settings/storage", middleware.RequirePermissions("admin.settings.read"), handler.GetStorageSettings)
	group.GET("/settings/runtime", middleware.RequirePermissions("admin.settings.read"), handler.GetRuntimeSettings)
	group.GET("/seo", middleware.RequirePermissions("admin.settings.read"), handler.GetSEOSettings)
	group.POST("/settings/site", middleware.RequirePermissions("admin.settings.write"), handler.SaveSiteSettings)
	group.POST("/settings/auth", middleware.RequirePermissions("admin.settings.write"), handler.SaveAuthSettings)
	group.POST("/settings/smtp", middleware.RequirePermissions("admin.settings.write"), handler.SaveSMTPSettings)
	group.POST("/settings/storage", middleware.RequirePermissions("admin.settings.write"), handler.SaveStorageSettings)
	group.POST("/settings/runtime", middleware.RequirePermissions("admin.settings.write"), handler.SaveRuntimeSettings)
	group.POST("/seo/init", middleware.RequirePermissions("admin.settings.write"), handler.InitSEOSettings)
	group.PUT("/seo", middleware.RequirePermissions("admin.settings.write"), handler.SaveSEOSettings)
	group.POST("/settings/smtp/test", middleware.RequirePermissions("admin.settings.write"), handler.TestSMTP)
	group.POST("/settings/storage/test", middleware.RequirePermissions("admin.settings.write"), handler.TestStorage)
	group.GET("/settings/mail-templates", middleware.RequirePermissions("admin.settings.read"), handler.ListMailTemplates)
	group.GET("/settings/mail-templates/:templateKey", middleware.RequirePermissions("admin.settings.read"), handler.GetMailTemplate)
	group.POST("/settings/mail-templates/:templateKey", middleware.RequirePermissions("admin.settings.write"), handler.SaveMailTemplate)
	group.POST("/settings/mail-templates/:templateKey/preview", middleware.RequirePermissions("admin.settings.read"), handler.PreviewMailTemplate)
	group.POST("/settings/mail-templates/:templateKey/test", middleware.RequirePermissions("admin.settings.write"), handler.TestMailTemplate)
}
