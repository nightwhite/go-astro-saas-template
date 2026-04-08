package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type IdempotencyKey struct {
	ent.Schema
}

func (IdempotencyKey) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (IdempotencyKey) Fields() []ent.Field {
	return []ent.Field{
		field.String("scope").Default("api"),
		field.String("key").NotEmpty(),
		field.String("request_hash").Default(""),
		field.Int("response_status").Default(0),
		field.JSON("response_payload", map[string]any{}).Optional(),
		field.Time("expires_at").Default(func() time.Time {
			return time.Now().Add(24 * time.Hour)
		}),
		field.Bool("consumed").Default(false),
	}
}

func (IdempotencyKey) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "scope", "key").Unique(),
		index.Fields("tenant_id", "expires_at"),
	}
}
