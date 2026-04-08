package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type MarketplaceOrder struct {
	ent.Schema
}

func (MarketplaceOrder) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (MarketplaceOrder) Fields() []ent.Field {
	return []ent.Field{
		field.String("user_id").NotEmpty(),
		field.String("item_id").NotEmpty(),
		field.String("status").Default("created"),
		field.Int64("cost_credits").Default(0),
	}
}

func (MarketplaceOrder) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "user_id", "created_at"),
		index.Fields("tenant_id", "item_id"),
	}
}

