package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type BlogTranslation struct {
	ent.Schema
}

func (BlogTranslation) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (BlogTranslation) Fields() []ent.Field {
	return []ent.Field{
		field.String("blog_post_id").NotEmpty(),
		field.String("language").NotEmpty(),
		field.String("title").Default(""),
		field.String("excerpt").Optional().Nillable(),
		field.String("content").Default(""),
		field.String("meta_title").Optional().Nillable(),
		field.String("meta_description").Optional().Nillable(),
		field.String("keywords").Optional().Nillable(),
	}
}

func (BlogTranslation) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("blog_post", BlogPost.Type).
			Ref("translations").
			Field("blog_post_id").
			Unique().
			Required(),
	}
}

func (BlogTranslation) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "blog_post_id", "language").Unique(),
		index.Fields("tenant_id", "language", "updated_at"),
	}
}

