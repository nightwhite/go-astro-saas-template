package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminBillingRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/billing/overview", middleware.RequirePermissions("admin.dashboard.read"), handler.BillingOverview)
	group.POST("/billing/reconcile", middleware.RequirePermissions("admin.settings.write"), handler.ReconcileBilling)
}
