package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type BlogPost struct {
	ent.Schema
}

func (BlogPost) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (BlogPost) Fields() []ent.Field {
	return []ent.Field{
		field.String("slug").NotEmpty(),
		field.String("status").Default("draft"),
		field.String("default_language").Default("en"),
		field.String("author_name").Default(""),
		field.String("featured_image").Optional().Nillable(),
		field.String("admin_note").Optional().Nillable(),
		field.Time("published_at").Optional().Nillable(),
	}
}

func (BlogPost) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("translations", BlogTranslation.Type),
		edge.To("preview_tokens", BlogPreviewToken.Type),
	}
}

func (BlogPost) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("tenant_id", "slug").Unique(),
		index.Fields("tenant_id", "status", "published_at"),
		index.Fields("tenant_id", "created_at"),
	}
}

