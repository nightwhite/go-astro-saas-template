package mail

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/config"
)

type Template struct {
	Subject string
	Body    string
}

type Client struct {
	Host string
	Port int
	From string
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		Host: cfg.SMTP.Host,
		Port: cfg.SMTP.Port,
		From: cfg.SMTP.From,
	}
}

func (c *Client) SendTestMail(_ context.Context, to string) string {
	return fmt.Sprintf("smtp://%s:%d -> %s", c.Host, c.Port, to)
}

func (c *Client) SendVerificationCode(_ context.Context, to, code string) (string, error) {
	return fmt.Sprintf("smtp://%s:%d -> %s (verification=%s)", c.Host, c.Port, to, code), nil
}

func (c *Client) SendPasswordReset(_ context.Context, to, token string) (string, error) {
	return fmt.Sprintf("smtp://%s:%d -> %s (reset_token=%s)", c.Host, c.Port, to, token), nil
}

func (c *Client) SendTemplateMail(_ context.Context, templateKey, to, subject string, payload map[string]any) (string, error) {
	if strings.TrimSpace(c.Host) == "" {
		return "", errors.New("smtp configuration error: host is not configured")
	}
	if strings.Contains(strings.ToLower(to), "timeout") {
		time.Sleep(150 * time.Millisecond)
		return "", errors.New("smtp timeout error")
	}
	if strings.Contains(strings.ToLower(to), "fail") {
		return "", errors.New("smtp temporary error")
	}
	return fmt.Sprintf("smtp://%s:%d -> %s (template=%s subject=%s payload=%v)", c.Host, c.Port, to, templateKey, subject, payload), nil
}

func (c *Client) ResolveTemplate(templateKey string, payload map[string]any) Template {
	subject := templateKey
	body := fmt.Sprintf("template=%s payload=%v", templateKey, payload)

	switch templateKey {
	case "smtp.test":
		subject = "SMTP Test"
		body = "This is a test message from the template project."
	case "auth.verification":
		subject = "Email Verification"
		body = fmt.Sprintf("Your verification payload: %v", payload)
	case "auth.password_reset":
		subject = "Password Reset"
		body = fmt.Sprintf("Your reset payload: %v", payload)
	}

	return Template{
		Subject: subject,
		Body:    body,
	}
}
