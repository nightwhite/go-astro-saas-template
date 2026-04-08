package logging

import (
	"context"
	"strings"

	"github.com/night/go-astro-template/apps/api/internal/pkg/identityctx"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"go.uber.org/zap"
)

func New(env string) (*zap.Logger, error) {
	if env == "production" {
		return zap.NewProduction()
	}

	return zap.NewDevelopment()
}

func String(key string, value string) zap.Field {
	return zap.String(key, value)
}

func Error(err error) zap.Field {
	return zap.Error(err)
}

func Int(key string, value int) zap.Field {
	return zap.Int(key, value)
}

func StringMasked(key string, value string) zap.Field {
	return zap.String(key, MaskSensitiveValue(value))
}

func MaskSensitiveValue(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}
	if len(trimmed) <= 4 {
		return "****"
	}
	return trimmed[:2] + "****" + trimmed[len(trimmed)-2:]
}

func ContextFields(module, action string, requestID string, ctx context.Context) []zap.Field {
	fields := []zap.Field{
		zap.String("module", module),
		zap.String("action", action),
	}
	if requestID != "" {
		fields = append(fields, zap.String("request_id", requestID))
	}
	if tenantID, ok := ctx.Value(tenant.ContextKey()).(string); ok && tenantID != "" {
		fields = append(fields, zap.String("tenant_id", tenantID))
	}
	if actorID, ok := ctx.Value(identityctx.ActorIDKey()).(string); ok && actorID != "" {
		fields = append(fields, zap.String("user_id", actorID))
	}
	return fields
}
