package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

type User struct {
	ent.Schema
}

func (User) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (User) Fields() []ent.Field {
	return []ent.Field{
		field.String("email").NotEmpty(),
		field.String("password_hash").Sensitive(),
		field.String("display_name").NotEmpty(),
		field.String("role").Default("member"),
		field.String("status").Default("active"),
		field.UUID("profile_file_id", uuid.Nil).Optional().Nillable(),
	}
}

func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("sessions", Session.Type),
		edge.To("passkey_credentials", PasskeyCredential.Type),
		edge.To("uploaded_files", File.Type),
		edge.To("role_bindings", UserRoleBinding.Type),
		edge.To("team_memberships", TeamMembership.Type),
		edge.To("agent_conversations", AgentConversation.Type),
	}
}

func (User) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "email").Unique(),
		index.Fields("tenant_id", "role"),
		index.Fields("tenant_id", "status"),
	}
}
