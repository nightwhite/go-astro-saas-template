package main

import (
	"context"

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

	worker, err := app.NewWorkerApplication(cfg, logger)
	if err != nil {
		logger.Fatal("failed to initialize worker application", logging.Error(err))
	}

	if err := worker.Run(context.Background()); err != nil {
		logger.Fatal("worker stopped with error", logging.Error(err))
	}
}

