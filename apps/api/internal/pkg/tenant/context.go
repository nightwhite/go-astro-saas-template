package tenant

import "context"

const DefaultTenantID = "default"

type contextKey string

const tenantIDKey contextKey = "tenant_id"

func ContextKey() any {
	return tenantIDKey
}

func WithTenantID(ctx context.Context, tenantID string) context.Context {
	if tenantID == "" {
		tenantID = DefaultTenantID
	}
	return context.WithValue(ctx, tenantIDKey, tenantID)
}

func TenantID(ctx context.Context) string {
	if ctx == nil {
		return DefaultTenantID
	}

	if value, ok := ctx.Value(tenantIDKey).(string); ok && value != "" {
		return value
	}

	return DefaultTenantID
}
