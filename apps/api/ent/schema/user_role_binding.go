package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type UserRoleBinding struct {
	ent.Schema
}

func (UserRoleBinding) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (UserRoleBinding) Fields() []ent.Field {
	return []ent.Field{
		field.String("user_id").NotEmpty(),
		field.String("role_id").NotEmpty(),
	}
}

func (UserRoleBinding) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("role_bindings").
			Field("user_id").
			Unique().
			Required(),
		edge.From("role", Role.Type).
			Ref("user_bindings").
			Field("role_id").
			Unique().
			Required(),
	}
}

func (UserRoleBinding) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "user_id", "role_id").Unique(),
	}
}
