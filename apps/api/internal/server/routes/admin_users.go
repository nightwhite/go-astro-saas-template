package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminUserRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/users", middleware.RequirePermissions("admin.users.read"), handler.ListUsers)
	group.GET("/users/:userID", middleware.RequirePermissions("admin.users.read"), handler.GetUser)
	group.POST("/users", middleware.RequirePermissions("admin.users.write"), handler.CreateUser)
	group.PUT("/users", middleware.RequirePermissions("admin.users.write"), handler.UpdateUser)
	group.DELETE("/users", middleware.RequirePermissions("admin.users.write"), handler.DeleteUser)
	group.POST("/users/password/reset", middleware.RequirePermissions("admin.users.write"), handler.ResetUserPassword)
}
