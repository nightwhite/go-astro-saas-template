package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/night/go-astro-template/apps/api/internal/app"
	"github.com/night/go-astro-template/apps/api/internal/config"
	"github.com/night/go-astro-template/apps/api/internal/logging"
)

func main() {
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
		logger.Fatal("failed to initialize http application", logging.Error(err))
	}

	go func() {
		logger.Info("starting http server", logging.String("addr", application.Server.Addr))
		if serveErr := application.Server.ListenAndServe(); serveErr != nil && !errors.Is(serveErr, http.ErrServerClosed) {
			logger.Fatal("http server exited unexpectedly", logging.Error(serveErr))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), cfg.App.ShutdownTimeout)
	defer cancel()

	if err := application.Server.Shutdown(ctx); err != nil {
		logger.Fatal("failed to shutdown http server", logging.Error(err))
	}
}

