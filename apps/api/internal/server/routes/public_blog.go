package routes

import "github.com/gin-gonic/gin"

func RegisterPublicBlogRoutes(group *gin.RouterGroup, handler AdminHandler) {
	group.GET("/blog/posts", handler.PublicBlogList)
	group.GET("/blog/posts/:slug", handler.PublicBlogDetail)
	group.GET("/blog/preview", handler.PublicBlogPreview)
}

