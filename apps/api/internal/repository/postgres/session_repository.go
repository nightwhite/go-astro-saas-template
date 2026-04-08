package postgres

import (
	"context"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entsession "github.com/night/go-astro-template/apps/api/ent/session"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

type Session struct {
	ID        string
	Token     string
	UserID    string
	TenantID  string
	ExpiresAt time.Time
	CreatedAt time.Time
	UpdatedAt time.Time
}

type SessionRepository struct {
	ent *dbent.Client
}

func NewSessionRepository(client *Client) *SessionRepository {
	return &SessionRepository{ent: client.Ent}
}

func (r *SessionRepository) Create(ctx context.Context, tenantID, userID, token string, expiresAt time.Time) error {
	_, err := r.ent.Session.Create().
		SetTenantID(tenantID).
		SetUserID(userID).
		SetToken(token).
		SetExpiresAt(expiresAt).
		Save(ctx)
	return err
}

func (r *SessionRepository) FindByToken(ctx context.Context, token string) (*Session, error) {
	tenantID := tenant.TenantID(ctx)
	record, err := r.ent.Session.Query().
		Where(
			entsession.TenantID(tenantID),
			entsession.Token(token),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &Session{
		ID:        record.ID,
		Token:     record.Token,
		UserID:    record.UserID,
		TenantID:  record.TenantID,
		ExpiresAt: record.ExpiresAt,
		CreatedAt: record.CreatedAt,
		UpdatedAt: record.UpdatedAt,
	}, nil
}

func (r *SessionRepository) DeleteByToken(ctx context.Context, token string) error {
	tenantID := tenant.TenantID(ctx)
	_, err := r.ent.Session.Delete().
		Where(
			entsession.TenantID(tenantID),
			entsession.Token(token),
		).
		Exec(ctx)
	return err
}

func (r *SessionRepository) DeleteByUserID(ctx context.Context, tenantID, userID string) error {
	_, err := r.ent.Session.Delete().
		Where(
			entsession.TenantID(tenantID),
			entsession.UserID(userID),
		).
		Exec(ctx)
	return err
}

func (r *SessionRepository) ListTokensByUserID(ctx context.Context, tenantID, userID string) ([]string, error) {
	rows, err := r.ent.Session.Query().
		Where(
			entsession.TenantID(tenantID),
			entsession.UserID(userID),
		).
		All(ctx)
	if err != nil {
		return nil, err
	}

	tokens := make([]string, 0, len(rows))
	for _, row := range rows {
		tokens = append(tokens, row.Token)
	}
	return tokens, nil
}

func (r *SessionRepository) ListByUserID(ctx context.Context, tenantID, userID string) ([]Session, error) {
	rows, err := r.ent.Session.Query().
		Where(
			entsession.TenantID(tenantID),
			entsession.UserID(userID),
		).
		Order(dbent.Desc(entsession.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		return nil, err
	}

	sessions := make([]Session, 0, len(rows))
	for _, row := range rows {
		sessions = append(sessions, Session{
			ID:        row.ID,
			Token:     row.Token,
			UserID:    row.UserID,
			TenantID:  row.TenantID,
			ExpiresAt: row.ExpiresAt,
			CreatedAt: row.CreatedAt,
			UpdatedAt: row.UpdatedAt,
		})
	}
	return sessions, nil
}

func (r *SessionRepository) DeleteByUserIDExceptToken(ctx context.Context, tenantID, userID, keepToken string) error {
	builder := r.ent.Session.Delete().
		Where(
			entsession.TenantID(tenantID),
			entsession.UserID(userID),
		)
	if keepToken != "" {
		builder = builder.Where(entsession.TokenNEQ(keepToken))
	}
	_, err := builder.Exec(ctx)
	return err
}

func (r *SessionRepository) DeleteByID(ctx context.Context, tenantID, sessionID string) error {
	_, err := r.ent.Session.Delete().
		Where(
			entsession.TenantID(tenantID),
			entsession.ID(sessionID),
		).
		Exec(ctx)
	return err
}

func (r *SessionRepository) FindByID(ctx context.Context, tenantID, sessionID string) (*Session, error) {
	record, err := r.ent.Session.Query().
		Where(
			entsession.TenantID(tenantID),
			entsession.ID(sessionID),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &Session{
		ID:        record.ID,
		Token:     record.Token,
		UserID:    record.UserID,
		TenantID:  record.TenantID,
		ExpiresAt: record.ExpiresAt,
		CreatedAt: record.CreatedAt,
		UpdatedAt: record.UpdatedAt,
	}, nil
}
