package settings

import (
	"context"
	"errors"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
	"github.com/night/go-astro-template/apps/api/internal/repository/storage"
	mailservice "github.com/night/go-astro-template/apps/api/internal/service/mail"
	"go.uber.org/zap"
)

type Service struct {
	cfg      *config.Config
	logger   *zap.Logger
	settings *postgres.SettingsRepository
	users    *postgres.UserRepository
	files    *postgres.FileRepository
	mail     *mailservice.Service
	storage  *storage.Client
	cache    *settingsCache
}

func NewService(
	cfg *config.Config,
	logger *zap.Logger,
	settings *postgres.SettingsRepository,
	users *postgres.UserRepository,
	files *postgres.FileRepository,
	mail *mailservice.Service,
	storage *storage.Client,
	kvStore *redisrepo.KVStore,
) *Service {
	return &Service{
		cfg:      cfg,
		logger:   logger,
		settings: settings,
		users:    users,
		files:    files,
		mail:     mail,
		storage:  storage,
		cache:    newSettingsCache(kvStore, time.Duration(cfg.Settings.CacheTTLSeconds)*time.Second),
	}
}

func (s *Service) GetOverview(ctx context.Context) (map[string]any, error) {
	tenantID := tenant.TenantID(ctx)

	stats, err := s.buildOverviewStats(ctx)
	if err != nil {
		return nil, err
	}

	users, err := s.users.ListUsers(ctx, tenantID, 8)
	if err != nil {
		return nil, err
	}
	files, err := s.files.List(ctx, tenantID, 8)
	if err != nil {
		return nil, err
	}
	settings, err := s.settings.GetAll(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"app_name": s.cfg.App.Name,
		"env":      s.cfg.App.Env,
		"modules": []string{
			"auth",
			"users",
			"roles",
			"settings",
			"files",
			"jobs",
			"audit",
		},
		"viewer": map[string]any{
			"tenant_id": tenantID,
			"role":      "super_admin",
		},
		"permissions": []string{
			"admin.dashboard.read",
			"admin.users.read",
			"admin.users.write",
			"admin.roles.read",
			"admin.files.read",
			"admin.files.write",
			"admin.jobs.read",
			"admin.audit.read",
			"admin.settings.read",
			"admin.settings.write",
			"admin.blog.read",
			"admin.blog.write",
		},
		"stats":    stats,
		"users":    users,
		"files":    files,
		"settings": settings,
	}, nil
}

func (s *Service) GetAllSettings(ctx context.Context) (map[string]any, error) {
	return s.settings.GetAll(ctx, tenant.TenantID(ctx))
}

func (s *Service) GetSettingsByCategory(ctx context.Context, category string) (map[string]any, error) {
	if category == "" {
		return nil, errors.New("category is required")
	}

	switch category {
	case "site":
		return s.GetSiteSettings(ctx)
	case "auth":
		return s.GetAuthSettings(ctx)
	case "smtp":
		return s.GetSMTPSettings(ctx)
	case "storage":
		return s.GetStorageSettings(ctx)
	case "runtime":
		return s.GetRuntimeSettings(ctx)
	case "seo":
		return s.GetSEOSettings(ctx)
	default:
		if payload, hit, err := s.cache.load(ctx, category); err == nil && hit && payload != nil {
			metrics.RecordCacheHit()
			return payload, nil
		} else if err != nil {
			return nil, err
		}
		metrics.RecordCacheMiss()

		settings, err := s.settings.GetAll(ctx, tenant.TenantID(ctx))
		if err != nil {
			return nil, err
		}

		categorySettings, _ := settings[category].(map[string]any)
		if categorySettings == nil {
			categorySettings = map[string]any{}
		}
		_ = s.cache.save(ctx, category, categorySettings)
		return categorySettings, nil
	}
}

func (s *Service) TestSMTP(ctx context.Context, to string) (map[string]any, error) {
	message, err := s.mail.SendTestMail(ctx, to)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"target":  to,
		"message": message,
	}, nil
}

func (s *Service) TestStorage(_ context.Context, objectKey string) map[string]any {
	return map[string]any{
		"object_key": objectKey,
		"upload_url": s.storage.PresignUpload(context.Background(), objectKey, 15),
	}
}
