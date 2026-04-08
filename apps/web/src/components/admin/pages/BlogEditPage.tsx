import { BlogEditFeature } from "@/features/blog-admin/components/BlogEditFeature";
import type { BlogPostRecord } from "@/lib/api/admin";

interface BlogEditPageProps {
  post: BlogPostRecord;
}

export function BlogEditPage({ post }: BlogEditPageProps) {
  return <BlogEditFeature initialPost={post} />;
}

