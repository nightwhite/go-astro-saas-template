package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type CreditAccount struct {
	ent.Schema
}

func (CreditAccount) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (CreditAccount) Fields() []ent.Field {
	return []ent.Field{
		field.String("user_id").NotEmpty(),
		field.Int64("balance").Default(0),
		field.Int("version").Default(0),
	}
}

func (CreditAccount) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "user_id").Unique(),
	}
}

