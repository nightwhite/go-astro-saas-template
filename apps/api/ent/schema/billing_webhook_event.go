package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type BillingWebhookEvent struct {
	ent.Schema
}

func (BillingWebhookEvent) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (BillingWebhookEvent) Fields() []ent.Field {
	return []ent.Field{
		field.String("provider").Default("stripe"),
		field.String("event_id").NotEmpty(),
		field.JSON("payload", map[string]any{}).Optional(),
		field.Time("processed_at").Default(time.Now),
	}
}

func (BillingWebhookEvent) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "provider", "event_id").Unique(),
		index.Fields("tenant_id", "processed_at"),
	}
}

