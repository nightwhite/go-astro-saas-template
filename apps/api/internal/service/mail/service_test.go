package mail

import (
	"context"
	"testing"

	mailrepo "github.com/night/go-astro-template/apps/api/internal/repository/mail"
)

func TestClassifyMailError(t *testing.T) {
	if got := classifyMailError(nil); got != "" {
		t.Fatalf("expected empty classification for nil error, got %s", got)
	}
	if got := classifyMailError(assertErr("smtp timeout error")); got != "timeout" {
		t.Fatalf("expected timeout, got %s", got)
	}
	if got := classifyMailError(assertErr("smtp temporary error")); got != "temporary" {
		t.Fatalf("expected temporary, got %s", got)
	}
	if got := classifyMailError(assertErr("smtp configuration error")); got != "configuration" {
		t.Fatalf("expected configuration, got %s", got)
	}
	if got := classifyMailError(assertErr("some permanent error")); got != "permanent" {
		t.Fatalf("expected permanent, got %s", got)
	}
}

func TestRenderTemplatePreviewReplacesVariables(t *testing.T) {
	service := NewService(nil, &mailrepo.Client{Host: "localhost", Port: 1025, From: "noreply@example.com"}, nil)
	_, err := service.SaveTemplate(context.Background(), "unit.test", "subject", "hello {{name}}", "unit", true)
	if err != nil {
		t.Fatalf("SaveTemplate failed: %v", err)
	}
	preview, err := service.RenderTemplatePreview(context.Background(), "unit.test", map[string]any{
		"name": "codex",
	})
	if err != nil {
		t.Fatalf("RenderTemplatePreview failed: %v", err)
	}
	body, _ := preview["body"].(string)
	if body != "hello codex" {
		t.Fatalf("expected replaced body, got %q", body)
	}
}

func TestSaveTemplateRequiresKey(t *testing.T) {
	service := NewService(nil, &mailrepo.Client{Host: "localhost", Port: 1025, From: "noreply@example.com"}, nil)
	if _, err := service.SaveTemplate(context.Background(), " ", "subject", "body", "desc", true); err == nil {
		t.Fatal("SaveTemplate should fail when key is empty")
	}
}

type assertErr string

func (e assertErr) Error() string {
	return string(e)
}
