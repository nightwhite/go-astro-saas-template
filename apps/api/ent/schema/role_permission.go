package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type RolePermission struct {
	ent.Schema
}

func (RolePermission) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (RolePermission) Fields() []ent.Field {
	return []ent.Field{
		field.String("role_id").NotEmpty(),
		field.String("permission_key").NotEmpty(),
		field.String("description").Default(""),
	}
}

func (RolePermission) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("role", Role.Type).
			Ref("permissions").
			Field("role_id").
			Unique().
			Required(),
	}
}

func (RolePermission) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "role_id", "permission_key").Unique(),
	}
}
