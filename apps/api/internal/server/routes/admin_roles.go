package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminRoleRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/roles", middleware.RequirePermissions("admin.roles.read"), handler.ListRoles)
	group.GET("/roles/current", middleware.RequirePermissions("admin.roles.read"), handler.CurrentUserRoles)
	group.POST("/roles/permissions", middleware.RequirePermissions("admin.roles.write"), handler.UpdateRolePermissions)
	group.POST("/roles/bind-user", middleware.RequirePermissions("admin.roles.write"), handler.BindUserRole)
}
