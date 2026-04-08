package config

import (
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	App      AppConfig
	Postgres PostgresConfig
	Redis    RedisConfig
	SMTP     SMTPConfig
	R2       R2Config
	Session  SessionConfig
	Auth     AuthConfig
	Storage  StorageRuleConfig
	Security SecurityConfig
	Jobs     JobsConfig
	Settings SettingsConfig
}

type AppConfig struct {
	Name            string
	Env             string
	Host            string
	Port            int
	BaseURL         string
	WebOrigin       string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
	ShutdownTimeout time.Duration
}

type PostgresConfig struct {
	DSN             string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

type SMTPConfig struct {
	Host     string
	Port     int
	Username string
	Password string
	From     string
}

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	Endpoint        string
	PublicBaseURL   string
}

func Load() (*Config, error) {
	v := viper.New()
	v.SetConfigFile(".env")
	v.SetConfigType("env")
	v.AutomaticEnv()
	_ = v.ReadInConfig()

	setDefaults(v)

	cfg := &Config{
		App: AppConfig{
			Name:            v.GetString("APP_NAME"),
			Env:             v.GetString("APP_ENV"),
			Host:            v.GetString("APP_HOST"),
			Port:            v.GetInt("APP_PORT"),
			BaseURL:         v.GetString("APP_BASE_URL"),
			WebOrigin:       v.GetString("APP_WEB_ORIGIN"),
			ReadTimeout:     v.GetDuration("APP_READ_TIMEOUT"),
			WriteTimeout:    v.GetDuration("APP_WRITE_TIMEOUT"),
			IdleTimeout:     v.GetDuration("APP_IDLE_TIMEOUT"),
			ShutdownTimeout: v.GetDuration("APP_SHUTDOWN_TIMEOUT"),
		},
		Postgres: PostgresConfig{
			DSN:             v.GetString("POSTGRES_DSN"),
			MaxOpenConns:    v.GetInt("POSTGRES_MAX_OPEN_CONNS"),
			MaxIdleConns:    v.GetInt("POSTGRES_MAX_IDLE_CONNS"),
			ConnMaxLifetime: v.GetDuration("POSTGRES_CONN_MAX_LIFETIME"),
		},
		Redis: RedisConfig{
			Addr:     v.GetString("REDIS_ADDR"),
			Password: v.GetString("REDIS_PASSWORD"),
			DB:       v.GetInt("REDIS_DB"),
		},
		SMTP: SMTPConfig{
			Host:     v.GetString("SMTP_HOST"),
			Port:     v.GetInt("SMTP_PORT"),
			Username: v.GetString("SMTP_USERNAME"),
			Password: v.GetString("SMTP_PASSWORD"),
			From:     v.GetString("SMTP_FROM"),
		},
		R2: R2Config{
			AccountID:       v.GetString("R2_ACCOUNT_ID"),
			AccessKeyID:     v.GetString("R2_ACCESS_KEY_ID"),
			SecretAccessKey: v.GetString("R2_SECRET_ACCESS_KEY"),
			Bucket:          v.GetString("R2_BUCKET"),
			Endpoint:        v.GetString("R2_ENDPOINT"),
			PublicBaseURL:   v.GetString("R2_PUBLIC_BASE_URL"),
		},
		Session: SessionConfig{
			CookieName: v.GetString("SESSION_COOKIE_NAME"),
			TTL:        v.GetDuration("SESSION_TTL"),
			Secure:     v.GetBool("SESSION_SECURE"),
		},
		Auth: AuthConfig{
			DefaultAdminEmail:    v.GetString("AUTH_DEFAULT_ADMIN_EMAIL"),
			DefaultAdminPassword: v.GetString("AUTH_DEFAULT_ADMIN_PASSWORD"),
		},
		Storage: StorageRuleConfig{
			MaxUploadSizeMB: v.GetInt64("STORAGE_MAX_UPLOAD_SIZE_MB"),
			AllowedMimeTypes: []string{
				"text/plain",
				"application/json",
				"image/png",
				"image/jpeg",
				"application/pdf",
			},
		},
		Security: SecurityConfig{
			CSRFEnabled:          v.GetBool("SECURITY_CSRF_ENABLED"),
			MetricsEnabled:       v.GetBool("SECURITY_METRICS_ENABLED"),
			CSRFHeader:           v.GetString("SECURITY_CSRF_HEADER"),
			CSRFSecret:           v.GetString("SECURITY_CSRF_SECRET"),
			CSRFTTL:              v.GetDuration("SECURITY_CSRF_TTL"),
			CSRFCookieName:       v.GetString("SECURITY_CSRF_COOKIE_NAME"),
			CaptchaEnabled:       v.GetBool("SECURITY_CAPTCHA_ENABLED"),
			CaptchaStrict:        v.GetBool("SECURITY_CAPTCHA_STRICT"),
			MaxBodyBytes:         v.GetInt64("SECURITY_MAX_BODY_BYTES"),
			LoginRateLimitWindow: v.GetDuration("SECURITY_LOGIN_RATE_LIMIT_WINDOW"),
			LoginRateLimitMax:    v.GetInt("SECURITY_LOGIN_RATE_LIMIT_MAX"),
			AdminRateLimitWindow: v.GetDuration("SECURITY_ADMIN_RATE_LIMIT_WINDOW"),
			AdminRateLimitMax:    v.GetInt("SECURITY_ADMIN_RATE_LIMIT_MAX"),
			ResetRateLimitWindow: v.GetDuration("SECURITY_RESET_RATE_LIMIT_WINDOW"),
			ResetRateLimitMax:    v.GetInt("SECURITY_RESET_RATE_LIMIT_MAX"),
			IdempotencyTTL:       v.GetDuration("SECURITY_IDEMPOTENCY_TTL"),
			EnablePprof:          v.GetBool("SECURITY_ENABLE_PPROF"),
			SensitiveFieldsToRedact: []string{
				"password",
				"password_hash",
				"token",
				"secret",
				"secret_access_key",
				"smtp_password",
			},
		},
		Jobs: JobsConfig{
			QueuePrefix:      v.GetString("JOBS_QUEUE_PREFIX"),
			DefaultQueue:     v.GetString("JOBS_DEFAULT_QUEUE"),
			CriticalQueue:    v.GetString("JOBS_CRITICAL_QUEUE"),
			PollInterval:     v.GetDuration("JOBS_POLL_INTERVAL"),
			ScheduleInterval: v.GetDuration("JOBS_SCHEDULE_INTERVAL"),
			MaxRetries:       v.GetInt("JOBS_MAX_RETRIES"),
			BackoffBase:      v.GetDuration("JOBS_BACKOFF_BASE"),
			Retention:        v.GetDuration("JOBS_RETENTION"),
		},
		Settings: SettingsConfig{
			CacheTTLSeconds: v.GetInt("SETTINGS_CACHE_TTL_SECONDS"),
		},
	}

	return cfg, nil
}

func setDefaults(v *viper.Viper) {
	v.SetDefault("APP_NAME", "go-astro-template")
	v.SetDefault("APP_ENV", "development")
	v.SetDefault("APP_HOST", "0.0.0.0")
	v.SetDefault("APP_PORT", 8080)
	v.SetDefault("APP_BASE_URL", "http://localhost:8080")
	v.SetDefault("APP_WEB_ORIGIN", "http://localhost:4321")
	v.SetDefault("APP_READ_TIMEOUT", "10s")
	v.SetDefault("APP_WRITE_TIMEOUT", "15s")
	v.SetDefault("APP_IDLE_TIMEOUT", "60s")
	v.SetDefault("APP_SHUTDOWN_TIMEOUT", "10s")
	v.SetDefault("POSTGRES_DSN", "")
	v.SetDefault("POSTGRES_MAX_OPEN_CONNS", 30)
	v.SetDefault("POSTGRES_MAX_IDLE_CONNS", 15)
	v.SetDefault("POSTGRES_CONN_MAX_LIFETIME", "30m")
	v.SetDefault("REDIS_ADDR", "localhost:6379")
	v.SetDefault("REDIS_PASSWORD", "")
	v.SetDefault("REDIS_DB", 0)
	v.SetDefault("SMTP_HOST", "")
	v.SetDefault("SMTP_PORT", 587)
	v.SetDefault("SMTP_USERNAME", "")
	v.SetDefault("SMTP_PASSWORD", "")
	v.SetDefault("SMTP_FROM", "noreply@example.com")
	v.SetDefault("R2_ACCOUNT_ID", "")
	v.SetDefault("R2_ACCESS_KEY_ID", "")
	v.SetDefault("R2_SECRET_ACCESS_KEY", "")
	v.SetDefault("R2_BUCKET", "")
	v.SetDefault("R2_ENDPOINT", "")
	v.SetDefault("R2_PUBLIC_BASE_URL", "")
	v.SetDefault("SESSION_COOKIE_NAME", "go_astro_session")
	v.SetDefault("SESSION_TTL", "24h")
	v.SetDefault("SESSION_SECURE", false)
	v.SetDefault("AUTH_DEFAULT_ADMIN_EMAIL", "admin@example.com")
	v.SetDefault("AUTH_DEFAULT_ADMIN_PASSWORD", "admin123456")
	v.SetDefault("STORAGE_MAX_UPLOAD_SIZE_MB", 32)
	v.SetDefault("SECURITY_CSRF_ENABLED", true)
	v.SetDefault("SECURITY_METRICS_ENABLED", true)
	v.SetDefault("SECURITY_CSRF_HEADER", "X-CSRF-Token")
	v.SetDefault("SECURITY_CSRF_COOKIE_NAME", "go_astro_csrf")
	v.SetDefault("SECURITY_CSRF_TTL", "2h")
	v.SetDefault("SECURITY_CSRF_SECRET", "")
	v.SetDefault("SECURITY_CAPTCHA_ENABLED", false)
	v.SetDefault("SECURITY_CAPTCHA_STRICT", false)
	v.SetDefault("SECURITY_MAX_BODY_BYTES", 1048576)
	v.SetDefault("SECURITY_LOGIN_RATE_LIMIT_WINDOW", "1m")
	v.SetDefault("SECURITY_LOGIN_RATE_LIMIT_MAX", 10)
	v.SetDefault("SECURITY_ADMIN_RATE_LIMIT_WINDOW", "1m")
	v.SetDefault("SECURITY_ADMIN_RATE_LIMIT_MAX", 120)
	v.SetDefault("SECURITY_RESET_RATE_LIMIT_WINDOW", "5m")
	v.SetDefault("SECURITY_RESET_RATE_LIMIT_MAX", 5)
	v.SetDefault("SECURITY_IDEMPOTENCY_TTL", "24h")
	v.SetDefault("SECURITY_ENABLE_PPROF", false)
	v.SetDefault("JOBS_QUEUE_PREFIX", "go_astro_template")
	v.SetDefault("JOBS_DEFAULT_QUEUE", "default")
	v.SetDefault("JOBS_CRITICAL_QUEUE", "critical")
	v.SetDefault("JOBS_POLL_INTERVAL", "2s")
	v.SetDefault("JOBS_SCHEDULE_INTERVAL", "5m")
	v.SetDefault("JOBS_MAX_RETRIES", 5)
	v.SetDefault("JOBS_BACKOFF_BASE", "5s")
	v.SetDefault("JOBS_RETENTION", "168h")
	v.SetDefault("SETTINGS_CACHE_TTL_SECONDS", 300)
}
