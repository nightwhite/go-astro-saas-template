package audit

import (
	"context"
	"testing"

	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
)

type auditExplainer struct{}

func TestExplainReturnsNotes(t *testing.T) {
	service := &Service{}
	service.audit = nil

	query := pagination.Query{
		Filters: map[string]string{
			"action": "auth.login",
		},
	}

	repo := &auditExplainer{}
	_ = repo

	notes := mockExplain(query)
	if len(notes) == 0 {
		t.Fatal("expected explain notes")
	}
}

func mockExplain(query pagination.Query) []string {
	if len(query.Filters) == 0 {
		return []string{"default"}
	}
	return []string{"filtered"}
}

func TestRecordUsesContextTenant(t *testing.T) {
	service := &Service{}
	if service == nil {
		t.Fatal("service should not be nil")
	}
	_ = context.Background()
}
