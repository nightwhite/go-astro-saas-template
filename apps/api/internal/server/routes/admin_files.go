package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminFileRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/files", middleware.RequirePermissions("admin.files.read"), handler.ListFiles)
	group.GET("/files/object", middleware.RequirePermissions("admin.files.read"), handler.HeadFileObject)
	group.GET("/media", middleware.RequirePermissions("admin.files.read"), handler.ListMedia)
	group.POST("/files/demo", middleware.RequirePermissions("admin.files.write"), handler.CreateDemoFile)
	group.POST("/files/upload/prepare", middleware.RequirePermissions("admin.files.write"), handler.PrepareFileUpload)
	group.POST("/files/delete", middleware.RequirePermissions("admin.files.write"), handler.DeleteFileObject)
	group.POST("/media/upload", middleware.RequirePermissions("admin.files.write"), handler.UploadMedia)
	group.DELETE("/media", middleware.RequirePermissions("admin.files.write"), handler.DeleteMedia)
}
