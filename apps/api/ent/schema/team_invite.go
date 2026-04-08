package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type TeamInvite struct {
	ent.Schema
}

func (TeamInvite) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (TeamInvite) Fields() []ent.Field {
	return []ent.Field{
		field.String("team_id").NotEmpty(),
		field.String("email").NotEmpty(),
		field.String("token").NotEmpty(),
		field.String("status").Default("pending"),
		field.Time("expires_at").Default(func() time.Time {
			return time.Now().Add(72 * time.Hour)
		}),
		field.String("invited_by").Default(""),
	}
}

func (TeamInvite) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("team", Team.Type).
			Ref("invites").
			Field("team_id").
			Unique().
			Required(),
	}
}

func (TeamInvite) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "team_id"),
		index.Fields("tenant_id", "email", "status"),
		index.Fields("token").Unique(),
	}
}

