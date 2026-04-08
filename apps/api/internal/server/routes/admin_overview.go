package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminOverviewRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/overview", middleware.RequirePermissions("admin.dashboard.read"), handler.Overview)
}
