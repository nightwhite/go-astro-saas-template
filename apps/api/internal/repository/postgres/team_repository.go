package postgres

import (
	"context"
	"errors"
	"strings"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entteam "github.com/night/go-astro-template/apps/api/ent/team"
	entteaminvite "github.com/night/go-astro-template/apps/api/ent/teaminvite"
	entteammembership "github.com/night/go-astro-template/apps/api/ent/teammembership"
	entteamrole "github.com/night/go-astro-template/apps/api/ent/teamrole"
	entuser "github.com/night/go-astro-template/apps/api/ent/user"
)

type Team struct {
	ID          string `json:"id"`
	TenantID    string `json:"tenant_id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	OwnerUserID string `json:"owner_user_id"`
}

type TeamInvite struct {
	ID        string `json:"id"`
	TeamID    string `json:"team_id"`
	Email     string `json:"email"`
	Token     string `json:"token"`
	Status    string `json:"status"`
	InvitedBy string `json:"invited_by"`
	ExpiresAt time.Time `json:"expires_at"`
}

type TeamMember struct {
	ID          string    `json:"id"`
	TeamID      string    `json:"team_id"`
	UserID      string    `json:"user_id"`
	Role        string    `json:"role"`
	DisplayName string    `json:"display_name"`
	Email       string    `json:"email"`
	CreatedAt   time.Time `json:"created_at"`
}

type TeamRole struct {
	ID          string   `json:"id"`
	TeamID      string   `json:"team_id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Permissions []string `json:"permissions"`
	IsEditable  bool     `json:"is_editable"`
}

type TeamRepository struct {
	ent *dbent.Client
}

func NewTeamRepository(client *Client) *TeamRepository {
	return &TeamRepository{ent: client.Ent}
}

func (r *TeamRepository) ListByUserID(ctx context.Context, tenantID, userID string) ([]Team, error) {
	teamIDs, err := r.ent.TeamMembership.Query().
		Where(
			entteammembership.TenantID(tenantID),
			entteammembership.UserID(userID),
		).
		GroupBy(entteammembership.FieldTeamID).
		Strings(ctx)
	if err != nil {
		return nil, err
	}
	if len(teamIDs) == 0 {
		return []Team{}, nil
	}

	rows, err := r.ent.Team.Query().
		Where(
			entteam.TenantID(tenantID),
			entteam.IDIn(teamIDs...),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	output := make([]Team, 0, len(rows))
	for _, row := range rows {
		output = append(output, Team{
			ID:          row.ID,
			TenantID:    row.TenantID,
			Name:        row.Name,
			Slug:        row.Slug,
			OwnerUserID: row.OwnerUserID,
		})
	}
	return output, nil
}

func (r *TeamRepository) FindTeamByID(ctx context.Context, tenantID, teamID string) (*Team, error) {
	entity, err := r.ent.Team.Query().
		Where(
			entteam.TenantID(tenantID),
			entteam.ID(teamID),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &Team{
		ID:          entity.ID,
		TenantID:    entity.TenantID,
		Name:        entity.Name,
		Slug:        entity.Slug,
		OwnerUserID: entity.OwnerUserID,
	}, nil
}

func (r *TeamRepository) ListMembers(ctx context.Context, tenantID, teamID string) ([]TeamMember, error) {
	rows, err := r.ent.TeamMembership.Query().
		Where(
			entteammembership.TenantID(tenantID),
			entteammembership.TeamID(teamID),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return []TeamMember{}, nil
	}

	userIDs := make([]string, 0, len(rows))
	for _, row := range rows {
		userIDs = append(userIDs, row.UserID)
	}

	users, err := r.ent.User.Query().
		Where(
			entuser.TenantID(tenantID),
			entuser.IDIn(userIDs...),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}
	userByID := make(map[string]*dbent.User, len(users))
	for _, user := range users {
		userByID[user.ID] = user
	}

	output := make([]TeamMember, 0, len(rows))
	for _, row := range rows {
		profile := userByID[row.UserID]
		member := TeamMember{
			ID:        row.ID,
			TeamID:    row.TeamID,
			UserID:    row.UserID,
			Role:      row.Role,
			CreatedAt: row.CreatedAt,
		}
		if profile != nil {
			member.DisplayName = profile.DisplayName
			member.Email = profile.Email
		}
		output = append(output, member)
	}
	return output, nil
}

func (r *TeamRepository) CreateWithOwner(ctx context.Context, tenantID, ownerUserID, name string) (*Team, error) {
	slug := strings.TrimSpace(strings.ToLower(name))
	slug = strings.ReplaceAll(slug, " ", "-")
	if slug == "" {
		slug = ownerUserID
	}

	entity, err := r.ent.Team.Create().
		SetTenantID(tenantID).
		SetName(name).
		SetSlug(slug).
		SetOwnerUserID(ownerUserID).
		Save(ctx)
	if err != nil {
		return nil, err
	}

	_, err = r.ent.TeamMembership.Create().
		SetTenantID(tenantID).
		SetTeamID(entity.ID).
		SetUserID(ownerUserID).
		SetRole("owner").
		Save(ctx)
	if err != nil {
		return nil, err
	}

	return &Team{
		ID:          entity.ID,
		TenantID:    entity.TenantID,
		Name:        entity.Name,
		Slug:        entity.Slug,
		OwnerUserID: entity.OwnerUserID,
	}, nil
}

func (r *TeamRepository) CreateInvite(ctx context.Context, tenantID, teamID, email, token, invitedBy string) (*TeamInvite, error) {
	entity, err := r.ent.TeamInvite.Create().
		SetTenantID(tenantID).
		SetTeamID(teamID).
		SetEmail(email).
		SetToken(token).
		SetStatus("pending").
		SetInvitedBy(invitedBy).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return &TeamInvite{
		ID:        entity.ID,
		TeamID:    entity.TeamID,
		Email:     entity.Email,
		Token:     entity.Token,
		Status:    entity.Status,
		InvitedBy: entity.InvitedBy,
		ExpiresAt: entity.ExpiresAt,
	}, nil
}

func (r *TeamRepository) FindInviteByToken(ctx context.Context, tenantID, token string) (*TeamInvite, error) {
	entity, err := r.ent.TeamInvite.Query().
		Where(
			entteaminvite.TenantID(tenantID),
			entteaminvite.Token(token),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &TeamInvite{
		ID:        entity.ID,
		TeamID:    entity.TeamID,
		Email:     entity.Email,
		Token:     entity.Token,
		Status:    entity.Status,
		InvitedBy: entity.InvitedBy,
		ExpiresAt: entity.ExpiresAt,
	}, nil
}

func (r *TeamRepository) ListPendingInvitesByEmail(ctx context.Context, tenantID, email string) ([]TeamInvite, error) {
	rows, err := r.ent.TeamInvite.Query().
		Where(
			entteaminvite.TenantID(tenantID),
			entteaminvite.EmailEqualFold(email),
			entteaminvite.StatusEQ("pending"),
		).
		Order(dbent.Desc(entteaminvite.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	output := make([]TeamInvite, 0, len(rows))
	for _, item := range rows {
		output = append(output, TeamInvite{
			ID:        item.ID,
			TeamID:    item.TeamID,
			Email:     item.Email,
			Token:     item.Token,
			Status:    item.Status,
			InvitedBy: item.InvitedBy,
			ExpiresAt: item.ExpiresAt,
		})
	}
	return output, nil
}

func (r *TeamRepository) AcceptInvite(ctx context.Context, tenantID, inviteID, userID string) error {
	invite, err := r.ent.TeamInvite.Query().
		Where(
			entteaminvite.TenantID(tenantID),
			entteaminvite.ID(inviteID),
		).
		Only(ctx)
	if err != nil {
		return err
	}

	if _, err := r.ent.TeamMembership.Create().
		SetTenantID(tenantID).
		SetTeamID(invite.TeamID).
		SetUserID(userID).
		SetRole("member").
		Save(ctx); err != nil {
		return err
	}

	_, err = r.ent.TeamInvite.UpdateOneID(invite.ID).SetStatus("accepted").Save(ctx)
	return err
}

func (r *TeamRepository) IsTeamMember(ctx context.Context, tenantID, teamID, userID string) (bool, error) {
	record, err := r.ent.TeamMembership.Query().
		Where(
			entteammembership.TenantID(tenantID),
			entteammembership.TeamID(teamID),
			entteammembership.UserID(userID),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return record != nil, nil
}

func (r *TeamRepository) UpdateTeamName(ctx context.Context, tenantID, teamID, name string) (*Team, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, errors.New("name is required")
	}
	slug := strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	if slug == "" {
		slug = teamID
	}
	_, err := r.ent.Team.Update().
		Where(
			entteam.TenantID(tenantID),
			entteam.ID(teamID),
		).
		SetName(name).
		SetSlug(slug).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return r.FindTeamByID(ctx, tenantID, teamID)
}

func (r *TeamRepository) DeleteTeamByID(ctx context.Context, tenantID, teamID string) error {
	_, err := r.ent.TeamRole.Delete().
		Where(
			entteamrole.TenantID(tenantID),
			entteamrole.TeamID(teamID),
		).
		Exec(ctx)
	if err != nil {
		return err
	}
	_, err = r.ent.TeamInvite.Delete().
		Where(
			entteaminvite.TenantID(tenantID),
			entteaminvite.TeamID(teamID),
		).
		Exec(ctx)
	if err != nil {
		return err
	}
	_, err = r.ent.TeamMembership.Delete().
		Where(
			entteammembership.TenantID(tenantID),
			entteammembership.TeamID(teamID),
		).
		Exec(ctx)
	if err != nil {
		return err
	}
	_, err = r.ent.Team.Delete().
		Where(
			entteam.TenantID(tenantID),
			entteam.ID(teamID),
		).
		Exec(ctx)
	return err
}

func (r *TeamRepository) ListInvitesByTeamID(ctx context.Context, tenantID, teamID string) ([]TeamInvite, error) {
	rows, err := r.ent.TeamInvite.Query().
		Where(
			entteaminvite.TenantID(tenantID),
			entteaminvite.TeamID(teamID),
		).
		Order(dbent.Desc(entteaminvite.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	output := make([]TeamInvite, 0, len(rows))
	for _, item := range rows {
		output = append(output, TeamInvite{
			ID:        item.ID,
			TeamID:    item.TeamID,
			Email:     item.Email,
			Token:     item.Token,
			Status:    item.Status,
			InvitedBy: item.InvitedBy,
			ExpiresAt: item.ExpiresAt,
		})
	}
	return output, nil
}

func (r *TeamRepository) FindInviteByID(ctx context.Context, tenantID, inviteID string) (*TeamInvite, error) {
	entity, err := r.ent.TeamInvite.Query().
		Where(
			entteaminvite.TenantID(tenantID),
			entteaminvite.ID(inviteID),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &TeamInvite{
		ID:        entity.ID,
		TeamID:    entity.TeamID,
		Email:     entity.Email,
		Token:     entity.Token,
		Status:    entity.Status,
		InvitedBy: entity.InvitedBy,
		ExpiresAt: entity.ExpiresAt,
	}, nil
}

func (r *TeamRepository) DeleteInviteByID(ctx context.Context, tenantID, inviteID string) error {
	_, err := r.ent.TeamInvite.Delete().
		Where(
			entteaminvite.TenantID(tenantID),
			entteaminvite.ID(inviteID),
		).
		Exec(ctx)
	return err
}

func (r *TeamRepository) UpdateMemberRole(ctx context.Context, tenantID, teamID, userID, role string) error {
	_, err := r.ent.TeamMembership.Update().
		Where(
			entteammembership.TenantID(tenantID),
			entteammembership.TeamID(teamID),
			entteammembership.UserID(userID),
		).
		SetRole(role).
		Save(ctx)
	return err
}

func (r *TeamRepository) DeleteMember(ctx context.Context, tenantID, teamID, userID string) error {
	_, err := r.ent.TeamMembership.Delete().
		Where(
			entteammembership.TenantID(tenantID),
			entteammembership.TeamID(teamID),
			entteammembership.UserID(userID),
		).
		Exec(ctx)
	return err
}

func (r *TeamRepository) ListTeamRoles(ctx context.Context, tenantID, teamID string) ([]TeamRole, error) {
	rows, err := r.ent.TeamRole.Query().
		Where(
			entteamrole.TenantID(tenantID),
			entteamrole.TeamID(teamID),
		).
		Order(dbent.Asc(entteamrole.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	output := make([]TeamRole, 0, len(rows))
	for _, row := range rows {
		output = append(output, TeamRole{
			ID:          row.RoleID,
			TeamID:      row.TeamID,
			Name:        row.Name,
			Description: row.Description,
			Permissions: append([]string(nil), row.Permissions...),
			IsEditable:  true,
		})
	}
	return output, nil
}

func (r *TeamRepository) CreateTeamRole(ctx context.Context, tenantID, teamID, roleID, name, description string, permissions []string) (*TeamRole, error) {
	entity, err := r.ent.TeamRole.Create().
		SetTenantID(tenantID).
		SetTeamID(teamID).
		SetRoleID(roleID).
		SetName(name).
		SetDescription(description).
		SetPermissions(permissions).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	return &TeamRole{
		ID:          entity.RoleID,
		TeamID:      entity.TeamID,
		Name:        entity.Name,
		Description: entity.Description,
		Permissions: append([]string(nil), entity.Permissions...),
		IsEditable:  true,
	}, nil
}

func (r *TeamRepository) UpdateTeamRole(ctx context.Context, tenantID, teamID, roleID, name, description string, permissions []string) (*TeamRole, error) {
	_, err := r.ent.TeamRole.Update().
		Where(
			entteamrole.TenantID(tenantID),
			entteamrole.TeamID(teamID),
			entteamrole.RoleID(roleID),
		).
		SetName(name).
		SetDescription(description).
		SetPermissions(permissions).
		Save(ctx)
	if err != nil {
		return nil, err
	}
	entity, err := r.ent.TeamRole.Query().
		Where(
			entteamrole.TenantID(tenantID),
			entteamrole.TeamID(teamID),
			entteamrole.RoleID(roleID),
		).
		Only(ctx)
	if err != nil {
		return nil, err
	}
	return &TeamRole{
		ID:          entity.RoleID,
		TeamID:      entity.TeamID,
		Name:        entity.Name,
		Description: entity.Description,
		Permissions: append([]string(nil), entity.Permissions...),
		IsEditable:  true,
	}, nil
}

func (r *TeamRepository) DeleteTeamRole(ctx context.Context, tenantID, teamID, roleID string) error {
	_, err := r.ent.TeamRole.Delete().
		Where(
			entteamrole.TenantID(tenantID),
			entteamrole.TeamID(teamID),
			entteamrole.RoleID(roleID),
		).
		Exec(ctx)
	return err
}
