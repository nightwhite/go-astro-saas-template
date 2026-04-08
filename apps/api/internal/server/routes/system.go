package routes

import "github.com/gin-gonic/gin"

func RegisterSystemRoutes(engine *gin.Engine, handler SystemHandler, metricsEnabled bool) {
	engine.GET("/healthz", handler.Health)
	engine.GET("/readyz", handler.Ready)
	if metricsEnabled {
		engine.GET("/metrics", handler.Metrics)
		engine.GET("/api/v1/metrics/frontend-error", handler.FrontendError)
		engine.POST("/api/v1/metrics/frontend-error", handler.FrontendError)
	}
	engine.GET("/version", handler.Version)
}
