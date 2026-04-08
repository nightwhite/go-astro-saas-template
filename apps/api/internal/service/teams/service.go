package teams

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"go.uber.org/zap"
)

type Service struct {
	teams    *postgres.TeamRepository
	sessions *postgres.SessionRepository
	users    *postgres.UserRepository
}

func NewService(_ *zap.Logger, teams *postgres.TeamRepository, sessions *postgres.SessionRepository, users *postgres.UserRepository) *Service {
	return &Service{
		teams:    teams,
		sessions: sessions,
		users:    users,
	}
}

func (s *Service) currentUser(ctx context.Context, token string) (*postgres.User, error) {
	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, errors.New("session not found")
	}
	user, err := s.users.FindByID(ctx, session.TenantID, session.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (s *Service) ListMyTeams(ctx context.Context, token string) ([]postgres.Team, error) {
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	return s.teams.ListByUserID(ctx, user.TenantID, user.ID)
}

func (s *Service) GetTeam(ctx context.Context, token, teamID string) (*postgres.Team, []postgres.TeamMember, error) {
	teamID = strings.TrimSpace(teamID)
	if teamID == "" {
		return nil, nil, errors.New("team id is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, nil, err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return nil, nil, err
	}
	if !isMember {
		return nil, nil, errors.New("forbidden")
	}
	team, err := s.teams.FindTeamByID(ctx, user.TenantID, teamID)
	if err != nil {
		return nil, nil, err
	}
	if team == nil {
		return nil, nil, errors.New("team not found")
	}
	members, err := s.teams.ListMembers(ctx, user.TenantID, teamID)
	if err != nil {
		return nil, nil, err
	}
	return team, members, nil
}

func (s *Service) CreateTeam(ctx context.Context, token, name string) (*postgres.Team, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, errors.New("name is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	team, err := s.teams.CreateWithOwner(ctx, user.TenantID, user.ID, name)
	if err != nil {
		return nil, err
	}
	metrics.RecordTeamsCreate()
	return team, nil
}

func (s *Service) CreateInvite(ctx context.Context, token, teamID, email string) (*postgres.TeamInvite, error) {
	email = strings.TrimSpace(email)
	if email == "" {
		return nil, errors.New("email is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("forbidden")
	}
	invite, err := s.teams.CreateInvite(ctx, user.TenantID, teamID, email, uuid.NewString(), user.Email)
	if err != nil {
		return nil, err
	}
	metrics.RecordTeamsInvite()
	return invite, nil
}

func (s *Service) AcceptInvite(ctx context.Context, token, inviteToken string) (string, error) {
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return "", err
	}
	record, err := s.teams.FindInviteByToken(ctx, user.TenantID, inviteToken)
	if err != nil {
		return "", err
	}
	if record == nil {
		return "", errors.New("invite not found")
	}
	if strings.TrimSpace(record.Status) != "" && strings.ToLower(strings.TrimSpace(record.Status)) != "pending" {
		if strings.ToLower(strings.TrimSpace(record.Status)) == "accepted" {
			return record.TeamID, nil
		}
		return "", errors.New("invite is no longer active")
	}
	if !strings.EqualFold(record.Email, user.Email) {
		return "", errors.New("invite email mismatch")
	}
	if err := s.teams.AcceptInvite(ctx, user.TenantID, record.ID, user.ID); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "constraint") ||
			strings.Contains(strings.ToLower(err.Error()), "duplicate") ||
			strings.Contains(strings.ToLower(err.Error()), "unique") {
			return record.TeamID, nil
		}
		return "", err
	}
	return record.TeamID, nil
}

func (s *Service) ListPendingInvites(ctx context.Context, token string) ([]postgres.TeamInvite, error) {
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	return s.teams.ListPendingInvitesByEmail(ctx, user.TenantID, user.Email)
}

func (s *Service) UpdateTeam(ctx context.Context, token, teamID, name string) (*postgres.Team, error) {
	teamID = strings.TrimSpace(teamID)
	if teamID == "" {
		return nil, errors.New("team id is required")
	}
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, errors.New("name is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("forbidden")
	}
	return s.teams.UpdateTeamName(ctx, user.TenantID, teamID, name)
}

func (s *Service) DeleteTeam(ctx context.Context, token, teamID string) error {
	teamID = strings.TrimSpace(teamID)
	if teamID == "" {
		return errors.New("team id is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return err
	}
	team, err := s.teams.FindTeamByID(ctx, user.TenantID, teamID)
	if err != nil {
		return err
	}
	if team == nil {
		return errors.New("team not found")
	}
	if team.OwnerUserID != user.ID {
		return errors.New("forbidden")
	}
	return s.teams.DeleteTeamByID(ctx, user.TenantID, teamID)
}

func (s *Service) SelectTeam(ctx context.Context, token, teamID string) error {
	teamID = strings.TrimSpace(teamID)
	if teamID == "" {
		return errors.New("team id is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("forbidden")
	}
	return nil
}

func (s *Service) ListTeamInvites(ctx context.Context, token, teamID string) ([]postgres.TeamInvite, error) {
	teamID = strings.TrimSpace(teamID)
	if teamID == "" {
		return nil, errors.New("team id is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("forbidden")
	}
	return s.teams.ListInvitesByTeamID(ctx, user.TenantID, teamID)
}

func (s *Service) CancelInvite(ctx context.Context, token, inviteID string) error {
	inviteID = strings.TrimSpace(inviteID)
	if inviteID == "" {
		return errors.New("invitation id is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return err
	}
	invite, err := s.teams.FindInviteByID(ctx, user.TenantID, inviteID)
	if err != nil {
		return err
	}
	if invite == nil {
		return errors.New("invite not found")
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, invite.TeamID, user.ID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("forbidden")
	}
	return s.teams.DeleteInviteByID(ctx, user.TenantID, inviteID)
}

func (s *Service) UpdateMemberRole(ctx context.Context, token, teamID, userID, role string) error {
	teamID = strings.TrimSpace(teamID)
	userID = strings.TrimSpace(userID)
	role = strings.TrimSpace(role)
	if teamID == "" || userID == "" || role == "" {
		return errors.New("team id, user id and role are required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("forbidden")
	}
	return s.teams.UpdateMemberRole(ctx, user.TenantID, teamID, userID, role)
}

func (s *Service) RemoveMember(ctx context.Context, token, teamID, userID string) error {
	teamID = strings.TrimSpace(teamID)
	userID = strings.TrimSpace(userID)
	if teamID == "" || userID == "" {
		return errors.New("team id and user id are required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("forbidden")
	}
	team, err := s.teams.FindTeamByID(ctx, user.TenantID, teamID)
	if err != nil {
		return err
	}
	if team != nil && team.OwnerUserID == userID {
		return errors.New("cannot remove team owner")
	}
	return s.teams.DeleteMember(ctx, user.TenantID, teamID, userID)
}

func (s *Service) ListTeamRoles(ctx context.Context, token, teamID string) ([]postgres.TeamRole, error) {
	teamID = strings.TrimSpace(teamID)
	if teamID == "" {
		return nil, errors.New("team id is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("forbidden")
	}
	customRoles, err := s.teams.ListTeamRoles(ctx, user.TenantID, teamID)
	if err != nil {
		return nil, err
	}
	roles := []postgres.TeamRole{
		{
			ID:          "owner",
			TeamID:      teamID,
			Name:        "Owner",
			Description: "Full access",
			Permissions: []string{"*"},
			IsEditable:  false,
		},
		{
			ID:          "member",
			TeamID:      teamID,
			Name:        "Member",
			Description: "Standard access",
			Permissions: []string{"dashboard.read"},
			IsEditable:  false,
		},
	}
	return append(roles, customRoles...), nil
}

func (s *Service) CreateTeamRole(ctx context.Context, token, teamID, roleID, name, description string, permissions []string) (*postgres.TeamRole, error) {
	teamID = strings.TrimSpace(teamID)
	roleID = strings.TrimSpace(strings.ToLower(roleID))
	name = strings.TrimSpace(name)
	description = strings.TrimSpace(description)
	if teamID == "" {
		return nil, errors.New("team id is required")
	}
	if roleID == "" || name == "" {
		return nil, errors.New("role id and name are required")
	}
	if roleID == "owner" || roleID == "member" {
		return nil, errors.New("system role id is reserved")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("forbidden")
	}
	normalized := make([]string, 0, len(permissions))
	seen := make(map[string]struct{}, len(permissions))
	for _, permission := range permissions {
		item := strings.TrimSpace(permission)
		if item == "" {
			continue
		}
		if _, ok := seen[item]; ok {
			continue
		}
		seen[item] = struct{}{}
		normalized = append(normalized, item)
	}
	return s.teams.CreateTeamRole(ctx, user.TenantID, teamID, roleID, name, description, normalized)
}

func (s *Service) UpdateTeamRole(ctx context.Context, token, teamID, roleID, name, description string, permissions []string) (*postgres.TeamRole, error) {
	teamID = strings.TrimSpace(teamID)
	roleID = strings.TrimSpace(strings.ToLower(roleID))
	name = strings.TrimSpace(name)
	description = strings.TrimSpace(description)
	if teamID == "" {
		return nil, errors.New("team id is required")
	}
	if roleID == "" || name == "" {
		return nil, errors.New("role id and name are required")
	}
	if roleID == "owner" || roleID == "member" {
		return nil, errors.New("system roles cannot be updated")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return nil, err
	}
	if !isMember {
		return nil, errors.New("forbidden")
	}
	normalized := make([]string, 0, len(permissions))
	seen := make(map[string]struct{}, len(permissions))
	for _, permission := range permissions {
		item := strings.TrimSpace(permission)
		if item == "" {
			continue
		}
		if _, ok := seen[item]; ok {
			continue
		}
		seen[item] = struct{}{}
		normalized = append(normalized, item)
	}
	return s.teams.UpdateTeamRole(ctx, user.TenantID, teamID, roleID, name, description, normalized)
}

func (s *Service) DeleteTeamRole(ctx context.Context, token, teamID, roleID string) error {
	teamID = strings.TrimSpace(teamID)
	roleID = strings.TrimSpace(strings.ToLower(roleID))
	if teamID == "" || roleID == "" {
		return errors.New("team id and role id are required")
	}
	if roleID == "owner" || roleID == "member" {
		return errors.New("system roles cannot be deleted")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return err
	}
	isMember, err := s.teams.IsTeamMember(ctx, user.TenantID, teamID, user.ID)
	if err != nil {
		return err
	}
	if !isMember {
		return errors.New("forbidden")
	}
	return s.teams.DeleteTeamRole(ctx, user.TenantID, teamID, roleID)
}
