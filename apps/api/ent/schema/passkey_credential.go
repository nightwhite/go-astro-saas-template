package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type PasskeyCredential struct {
	ent.Schema
}

func (PasskeyCredential) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (PasskeyCredential) Fields() []ent.Field {
	return []ent.Field{
		field.String("user_id").NotEmpty(),
		field.String("credential_id").NotEmpty(),
		field.String("public_key").Default(""),
		field.String("aaguid").Optional().Nillable(),
		field.String("user_agent").Optional().Nillable(),
	}
}

func (PasskeyCredential) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("passkey_credentials").
			Field("user_id").
			Unique().
			Required(),
	}
}

func (PasskeyCredential) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "credential_id").Unique(),
		index.Fields("tenant_id", "user_id", "created_at"),
	}
}
