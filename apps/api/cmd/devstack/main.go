package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"syscall"
	"time"

	embeddedpostgres "github.com/fergusstrange/embedded-postgres"
	"github.com/alicebob/miniredis/v2"
	"github.com/night/go-astro-template/apps/api/internal/app"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/logging"
)

func main() {
	workingDir, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	postgresPort := envOrDefaultInt("DEVSTACK_POSTGRES_PORT", 54329)
	redisPort := envOrDefaultInt("DEVSTACK_REDIS_PORT", 6389)
	apiPort := envOrDefaultInt("DEVSTACK_API_PORT", 18080)
	webPort := envOrDefaultInt("DEVSTACK_WEB_PORT", 4411)
	runtimeDir := envOrDefault("DEVSTACK_RUNTIME_DIR", filepath.Join(workingDir, ".devstack"))
	if err := os.MkdirAll(runtimeDir, 0o755); err != nil {
		panic(err)
	}

	if err := os.Setenv("POSTGRES_DSN", fmt.Sprintf("postgres://postgres:postgres@127.0.0.1:%d/go_astro_template?sslmode=disable", postgresPort)); err != nil {
		panic(err)
	}
	if err := os.Setenv("REDIS_ADDR", fmt.Sprintf("127.0.0.1:%d", redisPort)); err != nil {
		panic(err)
	}
	if err := os.Setenv("APP_PORT", strconv.Itoa(apiPort)); err != nil {
		panic(err)
	}
	if err := os.Setenv("APP_BASE_URL", fmt.Sprintf("http://127.0.0.1:%d", apiPort)); err != nil {
		panic(err)
	}
	if err := os.Setenv("APP_WEB_ORIGIN", fmt.Sprintf("http://127.0.0.1:%d", webPort)); err != nil {
		panic(err)
	}
	if err := os.Setenv("SECURITY_CSRF_ENABLED", "false"); err != nil {
		panic(err)
	}

	postgres := embeddedpostgres.NewDatabase(
		embeddedpostgres.DefaultConfig().
			Port(uint32(postgresPort)).
			Database("go_astro_template").
			Username("postgres").
			Password("postgres").
			RuntimePath(filepath.Join(runtimeDir, "postgres-runtime")).
			DataPath(filepath.Join(runtimeDir, "postgres-data")).
			BinariesPath(filepath.Join(runtimeDir, "postgres-binaries")),
	)

	if err := postgres.Start(); err != nil {
		panic(err)
	}
	defer func() {
		_ = postgres.Stop()
	}()

	redisServer := miniredis.NewMiniRedis()
	if err := redisServer.StartAddr(fmt.Sprintf("127.0.0.1:%d", redisPort)); err != nil {
		panic(err)
	}
	defer redisServer.Close()

	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	logger, err := logging.New(cfg.App.Env)
	if err != nil {
		panic(err)
	}
	defer logger.Sync() //nolint:errcheck

	application, err := app.NewHTTPApplication(cfg, logger)
	if err != nil {
		panic(err)
	}

	go func() {
		logger.Info("starting devstack http server", logging.String("addr", application.Server.Addr))
		if serveErr := application.Server.ListenAndServe(); serveErr != nil && serveErr != http.ErrServerClosed {
			logger.Fatal("devstack http server exited unexpectedly", logging.Error(serveErr))
		}
	}()

	fmt.Println("devstack ready")
	fmt.Printf("api=http://127.0.0.1:%d\n", apiPort)
	fmt.Printf("postgres=127.0.0.1:%d\n", postgresPort)
	fmt.Printf("redis=127.0.0.1:%d\n", redisPort)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_ = application.Server.Shutdown(ctx)
}

func envOrDefault(name, fallback string) string {
	value := os.Getenv(name)
	if value == "" {
		return fallback
	}
	return value
}

func envOrDefaultInt(name string, fallback int) int {
	value := os.Getenv(name)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}
