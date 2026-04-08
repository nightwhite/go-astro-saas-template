package routes

import "github.com/gin-gonic/gin"

func RegisterSettingsRoutes(group *gin.RouterGroup, handler AuthHandler) {
	settingsGroup := group.Group("/settings")
	settingsGroup.PATCH("/profile", handler.SettingsProfile)
	settingsGroup.GET("/sessions", handler.SettingsSessions)
	settingsGroup.DELETE("/sessions/:sessionID", handler.SettingsRevokeSession)
	settingsGroup.GET("/passkeys", handler.SettingsPasskeys)
	settingsGroup.DELETE("/passkeys/:credentialID", handler.SettingsDeletePasskey)
	settingsGroup.POST("/change-email", handler.SettingsChangeEmail)
	settingsGroup.POST("/change-password", handler.SettingsChangePassword)
	settingsGroup.POST("/delete-account", handler.SettingsDeleteAccount)
}
