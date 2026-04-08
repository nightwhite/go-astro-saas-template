package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

type SystemSetting struct {
	ent.Schema
}

func (SystemSetting) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (SystemSetting) Fields() []ent.Field {
	return []ent.Field{
		field.String("category").NotEmpty(),
		field.String("key").NotEmpty(),
		field.JSON("value", map[string]any{}).Optional(),
		field.UUID("updated_by", uuid.Nil).Optional().Nillable(),
	}
}

func (SystemSetting) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "category", "key").Unique(),
	}
}
