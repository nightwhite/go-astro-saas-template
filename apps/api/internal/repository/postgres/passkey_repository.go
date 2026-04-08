package postgres

import (
	"context"
	"strings"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entpasskeycredential "github.com/night/go-astro-template/apps/api/ent/passkeycredential"
)

type PasskeyCredential struct {
	ID           string
	TenantID     string
	UserID       string
	CredentialID string
	PublicKey    string
	AAGUID       string
	UserAgent    string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type PasskeyRepository struct {
	ent *dbent.Client
}

func NewPasskeyRepository(client *Client) *PasskeyRepository {
	return &PasskeyRepository{ent: client.Ent}
}

func (r *PasskeyRepository) Create(
	ctx context.Context,
	tenantID, userID, credentialID, publicKey, aaguid, userAgent string,
) (*PasskeyCredential, error) {
	builder := r.ent.PasskeyCredential.Create().
		SetTenantID(tenantID).
		SetUserID(userID).
		SetCredentialID(strings.TrimSpace(credentialID)).
		SetPublicKey(strings.TrimSpace(publicKey))

	aaguid = strings.TrimSpace(aaguid)
	if aaguid != "" {
		builder = builder.SetAaguid(aaguid)
	}

	userAgent = strings.TrimSpace(userAgent)
	if userAgent != "" {
		builder = builder.SetUserAgent(userAgent)
	}

	record, err := builder.Save(ctx)
	if err != nil {
		return nil, err
	}
	return toPasskeyCredential(record), nil
}

func (r *PasskeyRepository) ListByUserID(ctx context.Context, tenantID, userID string) ([]PasskeyCredential, error) {
	rows, err := r.ent.PasskeyCredential.Query().
		Where(
			entpasskeycredential.TenantID(tenantID),
			entpasskeycredential.UserID(userID),
		).
		Order(dbent.Desc(entpasskeycredential.FieldCreatedAt)).
		All(ctx)
	if err != nil {
		return nil, err
	}

	output := make([]PasskeyCredential, 0, len(rows))
	for _, row := range rows {
		if row == nil {
			continue
		}
		output = append(output, *toPasskeyCredential(row))
	}
	return output, nil
}

func (r *PasskeyRepository) FindByCredentialID(ctx context.Context, tenantID, credentialID string) (*PasskeyCredential, error) {
	record, err := r.ent.PasskeyCredential.Query().
		Where(
			entpasskeycredential.TenantID(tenantID),
			entpasskeycredential.CredentialID(credentialID),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return toPasskeyCredential(record), nil
}

func (r *PasskeyRepository) DeleteByCredentialID(ctx context.Context, tenantID, credentialID string) error {
	_, err := r.ent.PasskeyCredential.Delete().
		Where(
			entpasskeycredential.TenantID(tenantID),
			entpasskeycredential.CredentialID(credentialID),
		).
		Exec(ctx)
	return err
}

func toPasskeyCredential(record *dbent.PasskeyCredential) *PasskeyCredential {
	if record == nil {
		return nil
	}
	result := &PasskeyCredential{
		ID:           record.ID,
		TenantID:     record.TenantID,
		UserID:       record.UserID,
		CredentialID: record.CredentialID,
		PublicKey:    record.PublicKey,
		CreatedAt:    record.CreatedAt,
		UpdatedAt:    record.UpdatedAt,
	}
	if record.Aaguid != nil {
		result.AAGUID = *record.Aaguid
	}
	if record.UserAgent != nil {
		result.UserAgent = *record.UserAgent
	}
	return result
}
