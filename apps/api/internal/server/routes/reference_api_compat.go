package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

// RegisterReferenceAPICompatRoutes exposes a compatibility surface aligned with
// the reference template (`/api/*`) while reusing existing handlers/services.
func RegisterReferenceAPICompatRoutes(
	engine *gin.Engine,
	cfg *config.Config,
	authHandler AuthHandler,
	teamsHandler TeamsHandler,
	billingHandler BillingHandler,
	adminHandler AdminHandler,
	identityService middleware.IdentityService,
	sessions *postgres.SessionRepository,
	teams *postgres.TeamRepository,
) {
	api := engine.Group("/api")

	// Auth/session
	api.POST("/auth/register", authHandler.Register)
	api.POST("/auth/login", authHandler.Login)
	api.POST("/auth/logout", authHandler.Logout)
	api.POST("/auth/forgot-password", authHandler.ForgotPassword)
	api.POST("/auth/reset-password", authHandler.ResetPassword)
	api.POST("/auth/resend-verification", authHandler.SendVerificationCode)
	api.GET("/auth/verify-email", authHandler.VerifyEmailToken)
	api.GET("/auth/sso/google", authHandler.GoogleSSOStart)
	api.GET("/auth/sso/google/callback", authHandler.GoogleSSOCallback)
	api.GET("/auth/csrf", authHandler.CSRF)
	api.GET("/me", authHandler.Me)
	api.GET("/session", authHandler.Me)
	api.GET("/get-session", authHandler.Me)

	// Settings
	api.PATCH("/settings/profile", authHandler.SettingsProfile)
	api.GET("/settings/sessions", authHandler.SettingsSessions)
	api.DELETE("/settings/sessions/:sessionID", authHandler.SettingsRevokeSession)
	api.POST("/settings/change-email", authHandler.SettingsChangeEmail)
	api.POST("/settings/change-password", authHandler.SettingsChangePassword)
	api.POST("/settings/delete-account", authHandler.SettingsDeleteAccount)

	// Teams
	api.GET("/teams", teamsHandler.ListTeams)
	api.POST("/teams", teamsHandler.CreateTeam)
	api.GET("/teams/invitations/pending", teamsHandler.ListPendingInvites)
	api.POST("/teams/invitations/accept", teamsHandler.AcceptInvite)
	api.DELETE("/teams/invitations/:invitationID", teamsHandler.CancelInvite)
	if sessions != nil && teams != nil {
		api.GET("/teams/:teamID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.GetTeam)
		api.PATCH("/teams/:teamID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.UpdateTeam)
		api.DELETE("/teams/:teamID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.DeleteTeam)
		api.POST("/teams/:teamID/select", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.SelectTeam)
		api.POST("/teams/:teamID/invitations", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.InviteMember)
		api.GET("/teams/:teamID/invitations", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.ListTeamInvites)
		api.GET("/teams/:teamID/members", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.ListTeamMembers)
		api.PATCH("/teams/:teamID/members/:userID/role", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.UpdateMemberRole)
		api.DELETE("/teams/:teamID/members/:userID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.RemoveMember)
		api.GET("/teams/:teamID/roles", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.ListTeamRoles)
		api.POST("/teams/:teamID/roles", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.CreateTeamRole)
		api.PATCH("/teams/:teamID/roles/:roleID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.UpdateTeamRole)
		api.DELETE("/teams/:teamID/roles/:roleID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), teamsHandler.DeleteTeamRole)
	}

	// Billing + marketplace
	api.POST("/billing/create-intent", billingHandler.CreatePaymentIntent)
	api.POST("/billing/confirm", billingHandler.ConfirmPaymentIntent)
	api.GET("/billing/transactions", billingHandler.Transactions)
	api.POST("/stripe/webhook", billingHandler.Webhook)
	api.GET("/marketplace/items", billingHandler.Catalog)
	api.POST("/marketplace/purchase", billingHandler.Purchase)

	// Public blog
	api.GET("/blog/posts", adminHandler.PublicBlogList)
	api.GET("/blog/posts/:slug", adminHandler.PublicBlogDetail)
	api.GET("/blog/preview", adminHandler.PublicBlogPreview)

	// Admin compatibility group
	adminGroup := api.Group("/admin")
	adminGroup.Use(middleware.AdminIdentity(cfg, identityService))
	adminGroup.GET("/stats", middleware.RequirePermissions("admin.dashboard.read"), adminHandler.Stats)
	adminGroup.GET("/users", middleware.RequirePermissions("admin.users.read"), adminHandler.ListUsers)
	adminGroup.GET("/users/:userID", middleware.RequirePermissions("admin.users.read"), adminHandler.GetUser)
	adminGroup.GET("/blog/posts", middleware.RequirePermissions("admin.blog.read"), adminHandler.ListBlogPosts)
	adminGroup.POST("/blog/posts", middleware.RequirePermissions("admin.blog.write"), adminHandler.CreateBlogPost)
	adminGroup.GET("/blog/posts/:blogID", middleware.RequirePermissions("admin.blog.read"), adminHandler.GetBlogPost)
	adminGroup.PUT("/blog/posts/:blogID", middleware.RequirePermissions("admin.blog.write"), adminHandler.UpdateBlogPost)
	adminGroup.DELETE("/blog/posts/:blogID", middleware.RequirePermissions("admin.blog.write"), adminHandler.DeleteBlogPost)
	adminGroup.POST("/blog/posts/:blogID/publish", middleware.RequirePermissions("admin.blog.write"), adminHandler.PublishBlogPost)
	adminGroup.POST("/blog/posts/:blogID/unpublish", middleware.RequirePermissions("admin.blog.write"), adminHandler.UnpublishBlogPost)
	adminGroup.POST("/blog/posts/:blogID/preview-link", middleware.RequirePermissions("admin.blog.write"), adminHandler.CreateBlogPreviewLink)
	adminGroup.POST("/blog/cache/clear", middleware.RequirePermissions("admin.blog.write"), adminHandler.ClearBlogCache)
	adminGroup.GET("/blog/posts/:blogID/translation/:lang", middleware.RequirePermissions("admin.blog.read"), adminHandler.GetBlogTranslation)
	adminGroup.PUT("/blog/posts/:blogID/translation/:lang", middleware.RequirePermissions("admin.blog.write"), adminHandler.SaveBlogTranslation)
	adminGroup.DELETE("/blog/posts/:blogID/translation/:lang", middleware.RequirePermissions("admin.blog.write"), adminHandler.DeleteBlogTranslation)
	adminGroup.GET("/seo", middleware.RequirePermissions("admin.settings.read"), adminHandler.GetSEOSettings)
	adminGroup.POST("/seo/init", middleware.RequirePermissions("admin.settings.write"), adminHandler.InitSEOSettings)
	adminGroup.PUT("/seo", middleware.RequirePermissions("admin.settings.write"), adminHandler.SaveSEOSettings)
	adminGroup.GET("/email-templates", middleware.RequirePermissions("admin.settings.read"), adminHandler.ListMailTemplates)
	adminGroup.GET("/email-templates/:templateKey", middleware.RequirePermissions("admin.settings.read"), adminHandler.GetMailTemplate)
	adminGroup.PUT("/email-templates/:templateKey", middleware.RequirePermissions("admin.settings.write"), adminHandler.SaveMailTemplate)
	adminGroup.POST("/email-templates/:templateKey/preview", middleware.RequirePermissions("admin.settings.read"), adminHandler.PreviewMailTemplate)
	adminGroup.POST("/email-templates/:templateKey/test-send", middleware.RequirePermissions("admin.settings.write"), adminHandler.TestMailTemplate)
	adminGroup.GET("/media", middleware.RequirePermissions("admin.files.read"), adminHandler.ListMedia)
	adminGroup.POST("/media/upload", middleware.RequirePermissions("admin.files.write"), adminHandler.UploadMedia)
	adminGroup.DELETE("/media", middleware.RequirePermissions("admin.files.write"), adminHandler.DeleteMedia)
	adminGroup.POST("/stripe/reconcile", middleware.RequirePermissions("admin.settings.write"), adminHandler.ReconcileBilling)

	engine.GET("/media/*path", adminHandler.ServeMedia)
}
