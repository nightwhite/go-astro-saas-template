package teams

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
)

type Service interface {
	ListMyTeams(ctx context.Context, token string) ([]postgres.Team, error)
	GetTeam(ctx context.Context, token, teamID string) (*postgres.Team, []postgres.TeamMember, error)
	CreateTeam(ctx context.Context, token, name string) (*postgres.Team, error)
	CreateInvite(ctx context.Context, token, teamID, email string) (*postgres.TeamInvite, error)
	AcceptInvite(ctx context.Context, token, inviteToken string) (string, error)
	ListPendingInvites(ctx context.Context, token string) ([]postgres.TeamInvite, error)
	UpdateTeam(ctx context.Context, token, teamID, name string) (*postgres.Team, error)
	DeleteTeam(ctx context.Context, token, teamID string) error
	SelectTeam(ctx context.Context, token, teamID string) error
	ListTeamInvites(ctx context.Context, token, teamID string) ([]postgres.TeamInvite, error)
	CancelInvite(ctx context.Context, token, inviteID string) error
	UpdateMemberRole(ctx context.Context, token, teamID, userID, role string) error
	RemoveMember(ctx context.Context, token, teamID, userID string) error
	ListTeamRoles(ctx context.Context, token, teamID string) ([]postgres.TeamRole, error)
	CreateTeamRole(ctx context.Context, token, teamID, roleID, name, description string, permissions []string) (*postgres.TeamRole, error)
	UpdateTeamRole(ctx context.Context, token, teamID, roleID, name, description string, permissions []string) (*postgres.TeamRole, error)
	DeleteTeamRole(ctx context.Context, token, teamID, roleID string) error
}

type Handler struct {
	cfg     *config.Config
	service Service
}

func NewHandler(cfg *config.Config, service Service) *Handler {
	return &Handler{
		cfg:     cfg,
		service: service,
	}
}

func (h *Handler) ListTeams(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teams, err := h.service.ListMyTeams(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"teams": teams})
}

func (h *Handler) CreateTeam(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	team, err := h.service.CreateTeam(c.Request.Context(), token, payload.Name)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.Created(c, gin.H{"team": team})
}

func (h *Handler) GetTeam(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	team, members, err := h.service.GetTeam(c.Request.Context(), token, teamID)
	if err != nil {
		if err.Error() == "forbidden" {
			httpx.Fail(c, apperrors.Forbidden("forbidden"))
			return
		}
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"team": team, "members": members})
}

func (h *Handler) InviteMember(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	var payload struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	invite, err := h.service.CreateInvite(c.Request.Context(), token, teamID, payload.Email)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"invite": invite})
}

func (h *Handler) AcceptInvite(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		Token string `json:"token"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	teamID, err := h.service.AcceptInvite(c.Request.Context(), token, payload.Token)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"accepted": true, "team_id": teamID})
}

func (h *Handler) ListPendingInvites(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	invites, err := h.service.ListPendingInvites(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"invites": invites})
}

func (h *Handler) UpdateTeam(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		Name string `json:"name"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	teamID := c.Param("teamID")
	team, err := h.service.UpdateTeam(c.Request.Context(), token, teamID, payload.Name)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"team": team})
}

func (h *Handler) DeleteTeam(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	if err := h.service.DeleteTeam(c.Request.Context(), token, teamID); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) SelectTeam(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	if err := h.service.SelectTeam(c.Request.Context(), token, teamID); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) ListTeamInvites(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	invites, err := h.service.ListTeamInvites(c.Request.Context(), token, teamID)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"invites": invites})
}

func (h *Handler) CancelInvite(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	inviteID := c.Param("invitationID")
	if err := h.service.CancelInvite(c.Request.Context(), token, inviteID); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) ListTeamMembers(c *gin.Context) {
	// Reuse existing detail endpoint shape for compatibility.
	h.GetTeam(c)
}

func (h *Handler) UpdateMemberRole(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	userID := c.Param("userID")
	var payload struct {
		Role string `json:"role"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if err := h.service.UpdateMemberRole(c.Request.Context(), token, teamID, userID, payload.Role); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) RemoveMember(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	userID := c.Param("userID")
	if err := h.service.RemoveMember(c.Request.Context(), token, teamID, userID); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) ListTeamRoles(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	roles, err := h.service.ListTeamRoles(c.Request.Context(), token, teamID)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"roles": roles})
}

func (h *Handler) CreateTeamRole(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	var payload struct {
		RoleID      string   `json:"role_id"`
		Name        string   `json:"name"`
		Description string   `json:"description"`
		Permissions []string `json:"permissions"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	role, err := h.service.CreateTeamRole(c.Request.Context(), token, teamID, payload.RoleID, payload.Name, payload.Description, payload.Permissions)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.Created(c, gin.H{"role": role})
}

func (h *Handler) UpdateTeamRole(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	roleID := c.Param("roleID")
	var payload struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
		Permissions []string `json:"permissions"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	role, err := h.service.UpdateTeamRole(c.Request.Context(), token, teamID, roleID, payload.Name, payload.Description, payload.Permissions)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"role": role})
}

func (h *Handler) DeleteTeamRole(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	teamID := c.Param("teamID")
	roleID := c.Param("roleID")
	if err := h.service.DeleteTeamRole(c.Request.Context(), token, teamID, roleID); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}
