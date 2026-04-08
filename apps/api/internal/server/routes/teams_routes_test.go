package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
)

type teamsStubHandler struct{}

func (teamsStubHandler) ListTeams(c *gin.Context)        { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) GetTeam(c *gin.Context)          { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) CreateTeam(c *gin.Context)       { c.JSON(http.StatusCreated, gin.H{"ok": true}) }
func (teamsStubHandler) UpdateTeam(c *gin.Context)       { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) DeleteTeam(c *gin.Context)       { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) SelectTeam(c *gin.Context)       { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) InviteMember(c *gin.Context)     { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) AcceptInvite(c *gin.Context)     { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) ListPendingInvites(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) ListTeamInvites(c *gin.Context)  { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) CancelInvite(c *gin.Context)     { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) ListTeamMembers(c *gin.Context)  { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) UpdateMemberRole(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) RemoveMember(c *gin.Context)     { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) ListTeamRoles(c *gin.Context)    { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) CreateTeamRole(c *gin.Context)   { c.JSON(http.StatusCreated, gin.H{"ok": true}) }
func (teamsStubHandler) UpdateTeamRole(c *gin.Context)   { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (teamsStubHandler) DeleteTeamRole(c *gin.Context)   { c.JSON(http.StatusOK, gin.H{"ok": true}) }

func TestRegisterTeamsRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	engine := gin.New()
	api := engine.Group("/api/v1")
	cfg := &config.Config{}
	cfg.Session.CookieName = "session"

	RegisterTeamsRoutes(api, teamsStubHandler{}, cfg, nil, nil)

	tests := []struct {
		method string
		path   string
	}{
		{http.MethodGet, "/api/v1/teams"},
		{http.MethodPost, "/api/v1/teams"},
		{http.MethodGet, "/api/v1/teams/invites/pending"},
		{http.MethodPost, "/api/v1/teams/invites/accept"},
		{http.MethodPost, "/api/v1/teams/invitations/accept"},
		{http.MethodGet, "/api/v1/teams/team-1"},
		{http.MethodPatch, "/api/v1/teams/team-1"},
		{http.MethodDelete, "/api/v1/teams/team-1"},
		{http.MethodPost, "/api/v1/teams/team-1/select"},
		{http.MethodPost, "/api/v1/teams/team-1/invites"},
		{http.MethodPost, "/api/v1/teams/team-1/invitations"},
		{http.MethodGet, "/api/v1/teams/team-1/invitations"},
		{http.MethodDelete, "/api/v1/teams/invitations/inv-1"},
		{http.MethodGet, "/api/v1/teams/team-1/members"},
		{http.MethodPatch, "/api/v1/teams/team-1/members/user-1/role"},
		{http.MethodDelete, "/api/v1/teams/team-1/members/user-1"},
		{http.MethodGet, "/api/v1/teams/team-1/roles"},
		{http.MethodPost, "/api/v1/teams/team-1/roles"},
		{http.MethodPatch, "/api/v1/teams/team-1/roles/custom-role"},
		{http.MethodDelete, "/api/v1/teams/team-1/roles/custom-role"},
	}
	for _, tc := range tests {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		rec := httptest.NewRecorder()
		engine.ServeHTTP(rec, req)
		if rec.Code == http.StatusNotFound {
			t.Fatalf("route not registered: %s %s", tc.method, tc.path)
		}
	}
}
