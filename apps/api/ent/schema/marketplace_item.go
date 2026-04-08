package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type MarketplaceItem struct {
	ent.Schema
}

func (MarketplaceItem) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (MarketplaceItem) Fields() []ent.Field {
	return []ent.Field{
		field.String("code").NotEmpty(),
		field.String("name").NotEmpty(),
		field.String("item_type").Default("credit_package"),
		field.Int64("price_credits").Default(0),
		field.Bool("enabled").Default(true),
	}
}

func (MarketplaceItem) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "code").Unique(),
		index.Fields("tenant_id", "enabled"),
	}
}

