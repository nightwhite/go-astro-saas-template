package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type TeamMembership struct {
	ent.Schema
}

func (TeamMembership) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (TeamMembership) Fields() []ent.Field {
	return []ent.Field{
		field.String("team_id").NotEmpty(),
		field.String("user_id").NotEmpty(),
		field.String("role").Default("member"),
	}
}

func (TeamMembership) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("team", Team.Type).
			Ref("memberships").
			Field("team_id").
			Unique().
			Required(),
		edge.From("user", User.Type).
			Ref("team_memberships").
			Field("user_id").
			Unique().
			Required(),
	}
}

func (TeamMembership) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "team_id"),
		index.Fields("tenant_id", "user_id"),
		index.Fields("tenant_id", "team_id", "user_id").Unique(),
	}
}

