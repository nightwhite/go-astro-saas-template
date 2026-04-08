package identityctx

import "context"

type actorContextKey string

const (
	actorIDKey          actorContextKey = "actor_id"
	actorEmailKey       actorContextKey = "actor_email"
	actorRoleKey        actorContextKey = "actor_role"
	actorPermissionsKey actorContextKey = "actor_permissions"
)

func ActorIDKey() any {
	return actorIDKey
}

func WithActor(ctx context.Context, id, email, role string, permissions []string) context.Context {
	ctx = context.WithValue(ctx, actorIDKey, id)
	ctx = context.WithValue(ctx, actorEmailKey, email)
	ctx = context.WithValue(ctx, actorRoleKey, role)
	ctx = context.WithValue(ctx, actorPermissionsKey, permissions)
	return ctx
}

func ActorID(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	value, _ := ctx.Value(actorIDKey).(string)
	return value
}

func ActorEmail(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	value, _ := ctx.Value(actorEmailKey).(string)
	return value
}

func ActorRole(ctx context.Context) string {
	if ctx == nil {
		return ""
	}
	value, _ := ctx.Value(actorRoleKey).(string)
	return value
}

func ActorPermissions(ctx context.Context) []string {
	if ctx == nil {
		return nil
	}
	value, _ := ctx.Value(actorPermissionsKey).([]string)
	return value
}
