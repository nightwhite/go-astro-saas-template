package redis

import (
	"github.com/night/go-astro-template/apps/api/internal/config"
	goredis "github.com/redis/go-redis/v9"
)

func NewClient(cfg *config.Config) *goredis.Client {
	return goredis.NewClient(&goredis.Options{
		Addr:     cfg.Redis.Addr,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})
}

