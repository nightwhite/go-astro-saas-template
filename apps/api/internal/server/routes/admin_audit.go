package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminAuditRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/audit", middleware.RequirePermissions("admin.audit.read"), handler.ListAuditLogs)
}
