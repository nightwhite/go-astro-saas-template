package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type JobRecord struct {
	ent.Schema
}

func (JobRecord) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (JobRecord) Fields() []ent.Field {
	return []ent.Field{
		field.String("job_type").NotEmpty(),
		field.String("status").NotEmpty(),
		field.String("queue").Default("default"),
		field.Int("attempts").NonNegative().Default(0),
		field.String("last_error").Default(""),
		field.Time("executed_at").Default(time.Now),
	}
}

func (JobRecord) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "executed_at"),
		index.Fields("tenant_id", "job_type", "status"),
	}
}
