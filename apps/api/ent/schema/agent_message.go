package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type AgentMessage struct {
	ent.Schema
}

func (AgentMessage) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (AgentMessage) Fields() []ent.Field {
	return []ent.Field{
		field.String("conversation_id").NotEmpty(),
		field.String("role").NotEmpty(),
		field.Text("content").NotEmpty(),
	}
}

func (AgentMessage) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("conversation", AgentConversation.Type).
			Ref("messages").
			Field("conversation_id").
			Unique().
			Required(),
	}
}

func (AgentMessage) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "conversation_id", "created_at"),
		index.Fields("tenant_id", "created_at"),
	}
}
