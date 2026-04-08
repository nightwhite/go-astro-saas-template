package routes

import "github.com/gin-gonic/gin"

func RegisterBillingRoutes(group *gin.RouterGroup, handler BillingHandler) {
	billingGroup := group.Group("/billing")
	billingGroup.GET("/summary", handler.Summary)
	billingGroup.GET("/transactions", handler.Transactions)
	billingGroup.POST("/payment-intents", handler.CreatePaymentIntent)
	billingGroup.POST("/payment-intents/confirm", handler.ConfirmPaymentIntent)
	billingGroup.POST("/webhook/stripe", handler.Webhook)

	marketplaceGroup := group.Group("/marketplace")
	marketplaceGroup.GET("/catalog", handler.Catalog)
	marketplaceGroup.POST("/purchase", handler.Purchase)
}
