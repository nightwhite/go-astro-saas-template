package app

import (
	"context"
	"fmt"
	"net/http"

	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/handler/admin"
	authhandler "github.com/night/go-astro-template/apps/api/internal/handler/auth"
	billinghandler "github.com/night/go-astro-template/apps/api/internal/handler/billing"
	systemhandler "github.com/night/go-astro-template/apps/api/internal/handler/system"
	teamshandler "github.com/night/go-astro-template/apps/api/internal/handler/teams"
	"github.com/night/go-astro-template/apps/api/internal/jobs"
	"github.com/night/go-astro-template/apps/api/internal/logging"
	"github.com/night/go-astro-template/apps/api/internal/metrics"
	mailrepo "github.com/night/go-astro-template/apps/api/internal/repository/mail"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	redisrepo "github.com/night/go-astro-template/apps/api/internal/repository/redis"
	storagerepo "github.com/night/go-astro-template/apps/api/internal/repository/storage"
	"github.com/night/go-astro-template/apps/api/internal/server"
	auditservice "github.com/night/go-astro-template/apps/api/internal/service/audit"
	"github.com/night/go-astro-template/apps/api/internal/service/auth"
	blogservice "github.com/night/go-astro-template/apps/api/internal/service/blog"
	billingservice "github.com/night/go-astro-template/apps/api/internal/service/billing"
	"github.com/night/go-astro-template/apps/api/internal/service/files"
	jobservice "github.com/night/go-astro-template/apps/api/internal/service/jobs"
	mailservice "github.com/night/go-astro-template/apps/api/internal/service/mail"
	roleservice "github.com/night/go-astro-template/apps/api/internal/service/roles"
	"github.com/night/go-astro-template/apps/api/internal/service/settings"
	teamservice "github.com/night/go-astro-template/apps/api/internal/service/teams"
	"github.com/night/go-astro-template/apps/api/internal/service/users"

	"go.uber.org/zap"
)

type HTTPApplication struct {
	Server *http.Server
}

type WorkerApplication struct {
	Runner *jobs.Runner
}

func NewHTTPApplication(cfg *config.Config, logger *zap.Logger) (*HTTPApplication, error) {
	pgClient, err := postgres.NewClient(cfg)
	if err != nil {
		return nil, err
	}
	redisClient := redisrepo.NewClient(cfg)
	userRepository := postgres.NewUserRepository(pgClient)
	sessionRepository := postgres.NewSessionRepository(pgClient)
	passkeyRepository := postgres.NewPasskeyRepository(pgClient)
	settingsRepository := postgres.NewSettingsRepository(pgClient)
	fileRepository := postgres.NewFileRepository(pgClient)
	roleRepository := postgres.NewRoleRepository(pgClient)
	accessRepository := postgres.NewAccessRepository(pgClient)
	teamRepository := postgres.NewTeamRepository(pgClient)
	billingRepository := postgres.NewBillingRepository(pgClient)
	jobRecordRepository := postgres.NewJobRecordRepository(pgClient)
	auditRepository := postgres.NewAuditRepository(pgClient)
	mailLogRepository := postgres.NewMailLogRepository(pgClient)
	blogRepository := postgres.NewBlogRepository(pgClient)
	kvStore := redisrepo.NewKVStore(redisClient)
	jobQueueStore := redisrepo.NewJobQueueStore(kvStore)
	sessionStore := redisrepo.NewSessionStore(redisClient)
	verificationStore := redisrepo.NewVerificationStore(kvStore)
	rateLimiter := redisrepo.NewRateLimiter(kvStore)
	idempotencyStore := redisrepo.NewIdempotencyStore(kvStore)
	captchaVerifier := redisrepo.NewCaptchaVerifier(cfg, kvStore)
	resetTokenStore := redisrepo.NewResetTokenStore(kvStore)
	mailClient := mailrepo.NewClient(cfg)
	storageClient := storagerepo.NewClient(cfg)
	mailService := mailservice.NewService(logger, mailClient, mailLogRepository)
	auditService := auditservice.NewService(logger, auditRepository)
	settingsService := settings.NewService(cfg, logger, settingsRepository, userRepository, fileRepository, mailService, storageClient, kvStore)
	userService := users.NewService(logger, userRepository)
	teamsService := teamservice.NewService(logger, teamRepository, sessionRepository, userRepository)
	billingService := billingservice.NewService(logger, billingRepository, sessionRepository, userRepository)
	fileService := files.NewService(cfg, logger, fileRepository, storageClient)
	roleService := roleservice.NewService(logger, roleRepository, accessRepository)
	jobQueue := jobservice.NewQueue(cfg, jobQueueStore, jobRecordRepository)
	jobsService := jobservice.NewService(cfg, logger, jobRecordRepository, jobQueue)
	blogService := blogservice.NewService(logger, blogRepository, "/preview/blog")
	if err := roleService.Bootstrap(context.Background()); err != nil {
		return nil, err
	}
	authService := auth.NewService(cfg, logger, userRepository, sessionRepository, passkeyRepository, roleRepository, accessRepository, sessionStore, verificationStore, rateLimiter, idempotencyStore, captchaVerifier, resetTokenStore, mailClient, auditService)
	if err := authService.Bootstrap(context.Background()); err != nil {
		return nil, err
	}
	if err := jobsService.Bootstrap(context.Background()); err != nil {
		return nil, err
	}
	if err := auditService.Bootstrap(context.Background(), cfg.Auth.DefaultAdminEmail); err != nil {
		return nil, err
	}
	_ = fileService.SeedDemoRecords(context.Background())

	handlers := server.Handlers{
		System:  systemhandler.NewHandler(cfg, metrics.NewProvider(jobQueueStore)),
		Auth:    authhandler.NewHandler(cfg, authService),
		Admin:   admin.NewHandler(settingsService, settingsService, mailService, userService, fileService, roleService, jobsService, auditService, settingsService, blogService),
		Teams:   teamshandler.NewHandler(cfg, teamsService),
		Billing: billinghandler.NewHandler(cfg, billingService),
	}

	engine := server.NewRouter(cfg, logger, handlers, authService, rateLimiter, idempotencyStore, sessionRepository, teamRepository)

	httpServer := &http.Server{
		Addr:              fmt.Sprintf("%s:%d", cfg.App.Host, cfg.App.Port),
		Handler:           engine,
		ReadTimeout:       cfg.App.ReadTimeout,
		WriteTimeout:      cfg.App.WriteTimeout,
		IdleTimeout:       cfg.App.IdleTimeout,
		ReadHeaderTimeout: cfg.App.ReadTimeout,
	}

	logger.Info(
		"http application initialized",
		logging.String("redis_addr", redisClient.Options().Addr),
		logging.Int("postgres_max_open_conns", cfg.Postgres.MaxOpenConns),
	)

	return &HTTPApplication{Server: httpServer}, nil
}

func NewWorkerApplication(cfg *config.Config, logger *zap.Logger) (*WorkerApplication, error) {
	pgClient, err := postgres.NewClient(cfg)
	if err != nil {
		return nil, err
	}
	redisClient := redisrepo.NewClient(cfg)
	kvStore := redisrepo.NewKVStore(redisClient)
	jobQueueStore := redisrepo.NewJobQueueStore(kvStore)
	jobRecordRepository := postgres.NewJobRecordRepository(pgClient)
	fileRepository := postgres.NewFileRepository(pgClient)
	storageClient := storagerepo.NewClient(cfg)
	fileService := files.NewService(cfg, logger, fileRepository, storageClient)
	jobQueue := jobservice.NewQueue(cfg, jobQueueStore, jobRecordRepository)
	jobsService := jobservice.NewService(cfg, logger, jobRecordRepository, jobQueue)

	return &WorkerApplication{
		Runner: jobs.NewRunner(cfg, logger, jobQueueStore, jobRecordRepository, jobsService, fileService),
	}, nil
}

func (w *WorkerApplication) Run(ctx context.Context) error {
	return w.Runner.Run(ctx)
}
