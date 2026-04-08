package postgres

import (
	"context"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entmaillog "github.com/night/go-astro-template/apps/api/ent/maillog"
)

type MailLog struct {
	ID           string         `json:"id"`
	TenantID     string         `json:"tenant_id"`
	TemplateKey  string         `json:"template_key"`
	Recipient    string         `json:"recipient"`
	Subject      string         `json:"subject"`
	Status       string         `json:"status"`
	ErrorMessage string         `json:"error_message"`
	SentAt       *time.Time     `json:"sent_at,omitempty"`
	Payload      map[string]any `json:"payload,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
}

type MailLogRepository struct {
	ent *dbent.Client
}

func NewMailLogRepository(client *Client) *MailLogRepository {
	return &MailLogRepository{ent: client.Ent}
}

func (r *MailLogRepository) Create(ctx context.Context, item MailLog) (string, error) {
	builder := r.ent.MailLog.Create().
		SetTenantID(item.TenantID).
		SetTemplateKey(item.TemplateKey).
		SetRecipient(item.Recipient).
		SetSubject(item.Subject).
		SetStatus(item.Status).
		SetErrorMessage(item.ErrorMessage)
	if item.Payload != nil {
		builder.SetPayload(item.Payload)
	}
	if item.SentAt != nil {
		builder.SetSentAt(*item.SentAt)
	}

	record, err := builder.Save(ctx)
	if err != nil {
		return "", err
	}
	return record.ID, nil
}

func (r *MailLogRepository) MarkSent(ctx context.Context, tenantID, id string) error {
	_, err := r.ent.MailLog.Update().
		Where(
			entmaillog.TenantID(tenantID),
			entmaillog.ID(id),
		).
		SetStatus("sent").
		SetSentAt(time.Now()).
		SetErrorMessage("").
		Save(ctx)
	return err
}

func (r *MailLogRepository) MarkFailed(ctx context.Context, tenantID, id, message string) error {
	_, err := r.ent.MailLog.Update().
		Where(
			entmaillog.TenantID(tenantID),
			entmaillog.ID(id),
		).
		SetStatus("failed").
		SetErrorMessage(message).
		Save(ctx)
	return err
}
