package postgres

import (
	"context"
	"database/sql"
	"time"

	entdialect "entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
	dbent "github.com/night/go-astro-template/apps/api/ent"
	"github.com/night/go-astro-template/apps/api/internal/config"
)

type Client struct {
	DB  *sql.DB
	Ent *dbent.Client
}

func NewClient(cfg *config.Config) (*Client, error) {
	connConfig, err := pgx.ParseConfig(cfg.Postgres.DSN)
	if err != nil {
		return nil, err
	}

	db := stdlib.OpenDB(*connConfig)
	db.SetMaxOpenConns(cfg.Postgres.MaxOpenConns)
	db.SetMaxIdleConns(cfg.Postgres.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.Postgres.ConnMaxLifetime)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, err
	}

	driver := entsql.OpenDB(entdialect.Postgres, db)
	entClient := dbent.NewClient(dbent.Driver(driver))

	if err := RunBootstrapMigration(ctx, entClient); err != nil {
		return nil, err
	}

	return &Client{
		DB:  db,
		Ent: entClient,
	}, nil
}
