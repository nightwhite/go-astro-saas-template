package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type MailLog struct {
	ent.Schema
}

func (MailLog) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (MailLog) Fields() []ent.Field {
	return []ent.Field{
		field.String("template_key").Default(""),
		field.String("recipient").NotEmpty(),
		field.String("subject").Default(""),
		field.String("status").Default("queued"),
		field.String("error_message").Default(""),
		field.Time("sent_at").Optional().Nillable(),
		field.JSON("payload", map[string]any{}).Optional(),
	}
}

func (MailLog) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "recipient", "created_at"),
		index.Fields("tenant_id", "status", "created_at"),
	}
}
