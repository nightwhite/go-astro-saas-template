package storage

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/config"
)

type Client struct {
	Endpoint string
	Bucket   string
	Public   string
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		Endpoint: cfg.R2.Endpoint,
		Bucket:   cfg.R2.Bucket,
		Public:   cfg.R2.PublicBaseURL,
	}
}

func (c *Client) PresignUpload(_ context.Context, objectKey string, expiresIn time.Duration) string {
	if err := c.ValidateObjectKey(objectKey); err != nil {
		return ""
	}
	return fmt.Sprintf("%s/%s?upload=1&expires_in=%d", c.Public, objectKey, int(expiresIn.Seconds()))
}

func (c *Client) PresignDownload(_ context.Context, objectKey string, expiresIn time.Duration) string {
	if err := c.ValidateObjectKey(objectKey); err != nil {
		return ""
	}
	return fmt.Sprintf("%s/%s?download=1&expires_in=%d", c.Public, objectKey, int(expiresIn.Seconds()))
}

func (c *Client) DeleteObject(_ context.Context, objectKey string) error {
	if err := c.ValidateObjectKey(objectKey); err != nil {
		return err
	}
	return nil
}

func (c *Client) HeadObject(_ context.Context, objectKey string) (map[string]any, error) {
	if err := c.ValidateObjectKey(objectKey); err != nil {
		return nil, err
	}
	return map[string]any{
		"object_key": objectKey,
		"bucket":     c.Bucket,
		"endpoint":   c.Endpoint,
	}, nil
}

func (c *Client) ValidateObjectKey(objectKey string) error {
	trimmed := strings.TrimSpace(objectKey)
	if trimmed == "" {
		return errors.New("storage invalid object key: empty")
	}
	if strings.Contains(trimmed, "..") || strings.Contains(trimmed, " ") || strings.HasPrefix(trimmed, "/") {
		return errors.New("storage invalid object key: unsafe path")
	}
	return nil
}

func ClassifyError(err error) string {
	if err == nil {
		return ""
	}
	message := strings.ToLower(err.Error())
	switch {
	case strings.Contains(message, "invalid object key"):
		return "invalid_object_key"
	case strings.Contains(message, "timeout"):
		return "timeout"
	case strings.Contains(message, "auth"):
		return "auth"
	default:
		return "unknown"
	}
}
