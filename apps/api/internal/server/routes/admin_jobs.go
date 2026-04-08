package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminJobRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/jobs", middleware.RequirePermissions("admin.jobs.read"), handler.ListJobs)
	group.POST("/jobs", middleware.RequirePermissions("admin.settings.write"), handler.EnqueueJob)
	group.POST("/jobs/replay", middleware.RequirePermissions("admin.settings.write"), handler.ReplayJob)
}
