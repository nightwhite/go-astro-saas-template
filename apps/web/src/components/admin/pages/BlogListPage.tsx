import type { BlogAdminFeatureData } from "@/features/blog-admin/api/blog";
import { BlogListFeature } from "@/features/blog-admin/components/BlogListFeature";

interface BlogListPageProps {
  data: BlogAdminFeatureData;
}

export function BlogListPage({ data }: BlogListPageProps) {
  return <BlogListFeature data={data} />;
}

