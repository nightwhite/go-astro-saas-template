package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Role struct {
	ent.Schema
}

func (Role) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (Role) Fields() []ent.Field {
	return []ent.Field{
		field.String("key").NotEmpty(),
		field.String("name").NotEmpty(),
		field.String("description").Default(""),
	}
}

func (Role) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("permissions", RolePermission.Type),
		edge.To("user_bindings", UserRoleBinding.Type),
	}
}

func (Role) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "key").Unique(),
	}
}
