package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type File struct {
	ent.Schema
}

func (File) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (File) Fields() []ent.Field {
	return []ent.Field{
		field.String("object_key").NotEmpty(),
		field.String("file_name").NotEmpty(),
		field.String("content_type").NotEmpty(),
		field.Int64("size_bytes").NonNegative(),
		field.String("uploaded_by").Optional().Nillable(),
	}
}

func (File) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("uploader", User.Type).
			Ref("uploaded_files").
			Field("uploaded_by").
			Unique(),
	}
}

func (File) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "object_key").Unique(),
		index.Fields("tenant_id", "created_at"),
	}
}
