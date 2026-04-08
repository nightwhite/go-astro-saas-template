package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type AuditLog struct {
	ent.Schema
}

func (AuditLog) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (AuditLog) Fields() []ent.Field {
	return []ent.Field{
		field.String("actor_email").NotEmpty(),
		field.String("action").NotEmpty(),
		field.String("resource").NotEmpty(),
		field.String("detail").Default(""),
	}
}

func (AuditLog) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "created_at"),
		index.Fields("tenant_id", "action", "created_at"),
	}
}
