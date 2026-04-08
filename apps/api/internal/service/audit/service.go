package audit

import (
	"context"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/pkg/identityctx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/pagination"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"go.uber.org/zap"
)

type Service struct {
	logger *zap.Logger
	audit  *postgres.AuditRepository
}

func NewService(logger *zap.Logger, audit *postgres.AuditRepository) *Service {
	return &Service{
		logger: logger,
		audit:  audit,
	}
}

func (s *Service) Bootstrap(ctx context.Context, actorEmail string) error {
	return s.audit.SeedDefaults(ctx, tenant.DefaultTenantID, actorEmail)
}

func (s *Service) List(ctx context.Context, query pagination.Query) ([]postgres.AuditLog, int, error) {
	return s.audit.ListPage(ctx, tenant.TenantID(ctx), query)
}

func (s *Service) Explain(query pagination.Query) []string {
	return s.audit.ExplainListPage(query)
}

func (s *Service) Record(ctx context.Context, action, resource, detail string) error {
	return s.audit.Create(ctx, postgres.AuditLog{
		TenantID:   tenant.TenantID(ctx),
		ActorEmail: identityctx.ActorEmail(ctx),
		Action:     action,
		Resource:   resource,
		Detail:     detail,
		CreatedAt:  time.Now(),
	})
}
