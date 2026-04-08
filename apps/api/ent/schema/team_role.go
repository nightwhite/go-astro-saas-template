package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type TeamRole struct {
	ent.Schema
}

func (TeamRole) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (TeamRole) Fields() []ent.Field {
	return []ent.Field{
		field.String("team_id").NotEmpty(),
		field.String("role_id").NotEmpty(),
		field.String("name").NotEmpty(),
		field.String("description").Default(""),
		field.Strings("permissions").Default([]string{}),
	}
}

func (TeamRole) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("team", Team.Type).
			Ref("roles").
			Field("team_id").
			Unique().
			Required(),
	}
}

func (TeamRole) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "team_id"),
		index.Fields("tenant_id", "team_id", "role_id").Unique(),
	}
}

