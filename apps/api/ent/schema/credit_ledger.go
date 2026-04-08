package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type CreditLedger struct {
	ent.Schema
}

func (CreditLedger) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (CreditLedger) Fields() []ent.Field {
	return []ent.Field{
		field.String("user_id").NotEmpty(),
		field.Int64("delta").Default(0),
		field.String("reason").Default(""),
		field.String("ref_type").Default(""),
		field.String("ref_id").Default(""),
	}
}

func (CreditLedger) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "user_id", "created_at"),
		index.Fields("tenant_id", "ref_type", "ref_id"),
	}
}

