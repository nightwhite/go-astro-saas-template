package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func registerAdminBlogRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/blog/posts", middleware.RequirePermissions("admin.blog.read"), handler.ListBlogPosts)
	group.POST("/blog/posts", middleware.RequirePermissions("admin.blog.write"), handler.CreateBlogPost)
	group.GET("/blog/posts/:blogID", middleware.RequirePermissions("admin.blog.read"), handler.GetBlogPost)
	group.PATCH("/blog/posts/:blogID", middleware.RequirePermissions("admin.blog.write"), handler.UpdateBlogPost)
	group.DELETE("/blog/posts/:blogID", middleware.RequirePermissions("admin.blog.write"), handler.DeleteBlogPost)
	group.GET("/blog/posts/:blogID/translation/:lang", middleware.RequirePermissions("admin.blog.read"), handler.GetBlogTranslation)
	group.PUT("/blog/posts/:blogID/translation/:lang", middleware.RequirePermissions("admin.blog.write"), handler.SaveBlogTranslation)
	group.DELETE("/blog/posts/:blogID/translation/:lang", middleware.RequirePermissions("admin.blog.write"), handler.DeleteBlogTranslation)
	group.POST("/blog/posts/:blogID/publish", middleware.RequirePermissions("admin.blog.write"), handler.PublishBlogPost)
	group.POST("/blog/posts/:blogID/unpublish", middleware.RequirePermissions("admin.blog.write"), handler.UnpublishBlogPost)
	group.POST("/blog/posts/:blogID/preview-link", middleware.RequirePermissions("admin.blog.write"), handler.CreateBlogPreviewLink)
	group.POST("/blog/cache/clear", middleware.RequirePermissions("admin.blog.write"), handler.ClearBlogCache)
}
