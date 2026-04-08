package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type BlogPreviewToken struct {
	ent.Schema
}

func (BlogPreviewToken) Mixin() []ent.Mixin {
	return []ent.Mixin{
		IDMixin{},
		TenantMixin{},
		TimeMixin{},
	}
}

func (BlogPreviewToken) Fields() []ent.Field {
	return []ent.Field{
		field.String("blog_post_id").NotEmpty(),
		field.String("token").NotEmpty(),
		field.String("language").Default("en"),
		field.Time("expires_at").Default(func() time.Time {
			return time.Now().Add(2 * time.Hour)
		}),
	}
}

func (BlogPreviewToken) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("blog_post", BlogPost.Type).
			Ref("preview_tokens").
			Field("blog_post_id").
			Unique().
			Required(),
	}
}

func (BlogPreviewToken) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("token").Unique(),
		index.Fields("tenant_id", "blog_post_id", "expires_at"),
		index.Fields("tenant_id", "expires_at"),
	}
}

