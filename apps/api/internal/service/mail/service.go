package mail

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	mailrepo "github.com/night/go-astro-template/apps/api/internal/repository/mail"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"go.uber.org/zap"
)

type Service struct {
	logger    *zap.Logger
	client    *mailrepo.Client
	logs      *postgres.MailLogRepository
	templates map[string]MailTemplate
}

type MailTemplate struct {
	Key         string         `json:"key"`
	Subject     string         `json:"subject"`
	Body        string         `json:"body"`
	Description string         `json:"description"`
	Enabled     bool           `json:"enabled"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Variables   map[string]any `json:"variables,omitempty"`
}

func NewService(logger *zap.Logger, client *mailrepo.Client, logs *postgres.MailLogRepository) *Service {
	return &Service{
		logger: logger,
		client: client,
		logs:   logs,
		templates: map[string]MailTemplate{
			"auth.verification": {
				Key:         "auth.verification",
				Subject:     "Verify your email",
				Body:        "Your verification code is {{code}}",
				Description: "Email verification template",
				Enabled:     true,
				UpdatedAt:   time.Now().UTC(),
			},
			"auth.password_reset": {
				Key:         "auth.password_reset",
				Subject:     "Reset your password",
				Body:        "Use this reset token: {{token}}",
				Description: "Password reset template",
				Enabled:     true,
				UpdatedAt:   time.Now().UTC(),
			},
			"team.invite": {
				Key:         "team.invite",
				Subject:     "You're invited to join a team",
				Body:        "Click invite link or use token: {{token}}",
				Description: "Team invitation template",
				Enabled:     true,
				UpdatedAt:   time.Now().UTC(),
			},
		},
	}
}

func (s *Service) SendTemplateMail(ctx context.Context, templateKey, to, subject string, payload map[string]any) (string, error) {
	if strings.TrimSpace(subject) == "" {
		subject = s.client.ResolveTemplate(templateKey, payload).Subject
	}
	logID, err := s.logs.Create(ctx, postgres.MailLog{
		TenantID:     tenant.TenantID(ctx),
		TemplateKey:  templateKey,
		Recipient:    to,
		Subject:      subject,
		Status:       "queued",
		ErrorMessage: "",
		Payload:      payload,
		CreatedAt:    time.Now(),
	})
	if err != nil {
		return "", err
	}

	result, sendErr := s.sendWithPolicy(ctx, templateKey, to, subject, payload)
	if sendErr != nil {
		_ = s.logs.MarkFailed(ctx, tenant.TenantID(ctx), logID, sendErr.Error())
		return "", sendErr
	}

	if err := s.logs.MarkSent(ctx, tenant.TenantID(ctx), logID); err != nil {
		return "", err
	}
	return result, nil
}

func (s *Service) SendTestMail(ctx context.Context, to string) (string, error) {
	return s.SendTemplateMail(ctx, "smtp.test", to, fmt.Sprintf("Test mail from %s", s.client.From), map[string]any{
		"type": "test",
	})
}

func (s *Service) sendWithPolicy(ctx context.Context, templateKey, to, subject string, payload map[string]any) (string, error) {
	if classifyMailError(nil) == "" {
		// no-op branch to keep classification helper used in a clear path
	}

	sendOnce := func() (string, error) {
		sendCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
		defer cancel()
		return s.client.SendTemplateMail(sendCtx, templateKey, to, subject, payload)
	}

	result, err := sendOnce()
	if err == nil {
		return result, nil
	}

	switch classifyMailError(err) {
	case "temporary", "timeout":
		time.Sleep(150 * time.Millisecond)
		return sendOnce()
	default:
		return "", err
	}
}

func classifyMailError(err error) string {
	if err == nil {
		return ""
	}
	message := strings.ToLower(err.Error())
	switch {
	case strings.Contains(message, "timeout"):
		return "timeout"
	case strings.Contains(message, "temporary"):
		return "temporary"
	case strings.Contains(message, "configuration"):
		return "configuration"
	default:
		return "permanent"
	}
}

func (s *Service) ListTemplates(_ context.Context) []MailTemplate {
	output := make([]MailTemplate, 0, len(s.templates))
	for _, item := range s.templates {
		output = append(output, item)
	}
	return output
}

func (s *Service) GetTemplate(_ context.Context, key string) (MailTemplate, bool) {
	item, ok := s.templates[strings.TrimSpace(key)]
	return item, ok
}

func (s *Service) SaveTemplate(_ context.Context, key, subject, body, description string, enabled bool) (MailTemplate, error) {
	trimmed := strings.TrimSpace(key)
	if trimmed == "" {
		return MailTemplate{}, fmt.Errorf("template key is required")
	}
	template := MailTemplate{
		Key:         trimmed,
		Subject:     strings.TrimSpace(subject),
		Body:        strings.TrimSpace(body),
		Description: strings.TrimSpace(description),
		Enabled:     enabled,
		UpdatedAt:   time.Now().UTC(),
	}
	s.templates[trimmed] = template
	return template, nil
}

func (s *Service) RenderTemplatePreview(_ context.Context, key string, payload map[string]any) (map[string]any, error) {
	template, ok := s.GetTemplate(context.Background(), key)
	if !ok {
		return nil, fmt.Errorf("template not found")
	}
	resolved := s.client.ResolveTemplate(key, payload)
	subject := template.Subject
	if subject == "" {
		subject = resolved.Subject
	}
	body := template.Body
	if body == "" {
		body = resolved.Body
	}
	preview := body
	for field, value := range payload {
		preview = strings.ReplaceAll(preview, "{{"+field+"}}", fmt.Sprintf("%v", value))
	}
	return map[string]any{
		"key":     key,
		"subject": subject,
		"body":    preview,
		"payload": payload,
	}, nil
}

func (s *Service) SendTemplateTest(ctx context.Context, key, to string, payload map[string]any) (string, error) {
	template, ok := s.GetTemplate(ctx, key)
	if !ok {
		return "", fmt.Errorf("template not found")
	}
	if !template.Enabled {
		return "", fmt.Errorf("template disabled")
	}
	return s.SendTemplateMail(ctx, key, to, template.Subject, payload)
}

func (s *Service) ListTemplateMaps(ctx context.Context) []map[string]any {
	items := s.ListTemplates(ctx)
	output := make([]map[string]any, 0, len(items))
	for _, item := range items {
		output = append(output, map[string]any{
			"key":         item.Key,
			"subject":     item.Subject,
			"body":        item.Body,
			"description": item.Description,
			"enabled":     item.Enabled,
			"updated_at":  item.UpdatedAt,
		})
	}
	return output
}

func (s *Service) GetTemplateMap(ctx context.Context, key string) (map[string]any, bool) {
	item, ok := s.GetTemplate(ctx, key)
	if !ok {
		return nil, false
	}
	return map[string]any{
		"key":         item.Key,
		"subject":     item.Subject,
		"body":        item.Body,
		"description": item.Description,
		"enabled":     item.Enabled,
		"updated_at":  item.UpdatedAt,
	}, true
}

func (s *Service) SaveTemplateMap(ctx context.Context, key, subject, body, description string, enabled bool) (map[string]any, error) {
	item, err := s.SaveTemplate(ctx, key, subject, body, description, enabled)
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"key":         item.Key,
		"subject":     item.Subject,
		"body":        item.Body,
		"description": item.Description,
		"enabled":     item.Enabled,
		"updated_at":  item.UpdatedAt,
	}, nil
}
