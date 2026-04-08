package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"github.com/night/go-astro-template/apps/api/internal/server/middleware"
)

func RegisterTeamsRoutes(group *gin.RouterGroup, handler TeamsHandler, cfg *config.Config, sessions *postgres.SessionRepository, teams *postgres.TeamRepository) {
	teamsGroup := group.Group("/teams")
	teamsGroup.GET("", handler.ListTeams)
	teamsGroup.GET("/invites/pending", handler.ListPendingInvites)
	teamsGroup.POST("", handler.CreateTeam)
	teamsGroup.POST("/invitations/accept", handler.AcceptInvite)
	teamsGroup.POST("/invites/accept", handler.AcceptInvite)
	teamsGroup.DELETE("/invitations/:invitationID", handler.CancelInvite)
	if sessions != nil && teams != nil {
		teamsGroup.GET("/:teamID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.GetTeam)
		teamsGroup.PATCH("/:teamID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.UpdateTeam)
		teamsGroup.DELETE("/:teamID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.DeleteTeam)
		teamsGroup.POST("/:teamID/select", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.SelectTeam)
		teamsGroup.POST("/:teamID/invites", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.InviteMember)
		teamsGroup.POST("/:teamID/invitations", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.InviteMember)
		teamsGroup.GET("/:teamID/invitations", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.ListTeamInvites)
		teamsGroup.GET("/:teamID/members", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.ListTeamMembers)
		teamsGroup.PATCH("/:teamID/members/:userID/role", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.UpdateMemberRole)
		teamsGroup.DELETE("/:teamID/members/:userID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.RemoveMember)
		teamsGroup.GET("/:teamID/roles", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.ListTeamRoles)
		teamsGroup.POST("/:teamID/roles", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.CreateTeamRole)
		teamsGroup.PATCH("/:teamID/roles/:roleID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.UpdateTeamRole)
		teamsGroup.DELETE("/:teamID/roles/:roleID", middleware.RequireTeamMember(cfg.Session.CookieName, sessions, teams), handler.DeleteTeamRole)
	} else {
		teamsGroup.GET("/:teamID", handler.GetTeam)
		teamsGroup.PATCH("/:teamID", handler.UpdateTeam)
		teamsGroup.DELETE("/:teamID", handler.DeleteTeam)
		teamsGroup.POST("/:teamID/select", handler.SelectTeam)
		teamsGroup.POST("/:teamID/invites", handler.InviteMember)
		teamsGroup.POST("/:teamID/invitations", handler.InviteMember)
		teamsGroup.GET("/:teamID/invitations", handler.ListTeamInvites)
		teamsGroup.GET("/:teamID/members", handler.ListTeamMembers)
		teamsGroup.PATCH("/:teamID/members/:userID/role", handler.UpdateMemberRole)
		teamsGroup.DELETE("/:teamID/members/:userID", handler.RemoveMember)
		teamsGroup.GET("/:teamID/roles", handler.ListTeamRoles)
		teamsGroup.POST("/:teamID/roles", handler.CreateTeamRole)
		teamsGroup.PATCH("/:teamID/roles/:roleID", handler.UpdateTeamRole)
		teamsGroup.DELETE("/:teamID/roles/:roleID", handler.DeleteTeamRole)
	}
}
