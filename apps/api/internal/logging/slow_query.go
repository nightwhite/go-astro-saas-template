package logging

import "go.uber.org/zap"

func SlowQueryFields(queryName, tenantID string, latencyMs int64, explain []string) []zap.Field {
	fields := []zap.Field{
		zap.String("log_type", "slow_query"),
		zap.String("query_name", queryName),
		zap.String("tenant_id", tenantID),
		zap.Int64("latency_ms", latencyMs),
	}
	if len(explain) > 0 {
		fields = append(fields, zap.Strings("explain_notes", explain))
	}
	fields = append(fields, zap.String("query_group", classifySlowQueryGroup(queryName)))
	return fields
}

func classifySlowQueryGroup(queryName string) string {
	switch queryName {
	case "users.list", "roles.list", "audit.list":
		return "admin"
	case "files.list", "files.prepare_upload":
		return "storage"
	case "teams.list", "teams.detail", "teams.invites":
		return "teams"
	case "billing.summary", "billing.transactions", "marketplace.purchase":
		return "billing"
	case "auth.login", "auth.sessions":
		return "auth"
	default:
		return "generic"
	}
}
