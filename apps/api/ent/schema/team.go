package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Team struct {
	ent.Schema
}

func (Team) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (Team) Fields() []ent.Field {
	return []ent.Field{
		field.String("name").NotEmpty(),
		field.String("slug").NotEmpty(),
		field.String("owner_user_id").NotEmpty(),
	}
}

func (Team) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("memberships", TeamMembership.Type),
		edge.To("invites", TeamInvite.Type),
		edge.To("roles", TeamRole.Type),
	}
}

func (Team) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "slug").Unique(),
		index.Fields("tenant_id", "owner_user_id"),
	}
}
