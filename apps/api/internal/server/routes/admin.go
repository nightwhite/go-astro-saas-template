package routes

import "github.com/gin-gonic/gin"

func RegisterAdminRoutes(group *gin.RouterGroup, handler AdminHandler) {
	adminGroup := group.Group("/admin")
	registerAdminOverviewRoutes(adminGroup, handler)
	registerAdminUserRoutes(adminGroup, handler)
	registerAdminRoleRoutes(adminGroup, handler)
	registerAdminFileRoutes(adminGroup, handler)
	registerAdminJobRoutes(adminGroup, handler)
	registerAdminAuditRoutes(adminGroup, handler)
	registerAdminBlogRoutes(adminGroup, handler)
	registerAdminSettingsRoutes(adminGroup, handler)
	registerAdminBillingRoutes(adminGroup, handler)
}
