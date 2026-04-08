package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type AgentConversation struct {
	ent.Schema
}

func (AgentConversation) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (AgentConversation) Fields() []ent.Field {
	return []ent.Field{
		field.String("user_id").NotEmpty(),
		field.String("title").Default("New Conversation"),
	}
}

func (AgentConversation) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("agent_conversations").
			Field("user_id").
			Unique().
			Required(),
		edge.To("messages", AgentMessage.Type),
	}
}

func (AgentConversation) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "user_id", "updated_at"),
		index.Fields("tenant_id", "created_at"),
	}
}
