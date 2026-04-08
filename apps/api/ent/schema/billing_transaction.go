package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type BillingTransaction struct {
	ent.Schema
}

func (BillingTransaction) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (BillingTransaction) Fields() []ent.Field {
	return []ent.Field{
		field.String("user_id").NotEmpty(),
		field.String("provider").Default("stripe"),
		field.String("payment_intent_id").Default(""),
		field.Int64("amount").Default(0),
		field.String("status").Default("created"),
	}
}

func (BillingTransaction) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "user_id", "created_at"),
		index.Fields("tenant_id", "provider", "payment_intent_id").Unique(),
	}
}

