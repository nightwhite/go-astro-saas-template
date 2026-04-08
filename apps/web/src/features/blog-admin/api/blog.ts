import {
  createAdminBlogPost,
  fetchAdminBlogPost,
  fetchAdminBlogPosts,
  type BlogPostRecord,
} from "@/lib/api/admin";

export interface BlogAdminFeatureData {
  posts: BlogPostRecord[];
  filters: Record<string, string>;
  explain: string[];
  page: number;
  pageSize: number;
  total: number;
}

export interface BlogAdminQueryOptions {
  page?: number;
  pageSize?: number;
  filters?: {
    slug?: string;
    status?: string;
    lang?: string;
  };
}

export async function loadBlogAdminFeature(baseURL: string, query?: BlogAdminQueryOptions): Promise<BlogAdminFeatureData> {
  const response = await fetchAdminBlogPosts(baseURL, {
    page: query?.page,
    pageSize: query?.pageSize,
    sortBy: "created_at",
    sortOrder: "desc",
    filters: query?.filters,
  }).catch(() => ({
    posts: [],
    filters: {},
    explain: [],
    pagination: { page: 1, page_size: 20, total: 0 },
  }));

  return {
    posts: response.posts,
    filters: response.filters,
    explain: response.explain,
    page: response.pagination?.page ?? 1,
    pageSize: response.pagination?.page_size ?? 20,
    total: response.pagination?.total ?? response.posts.length,
  };
}

export interface BlogCreateDefaults {
  slug: string;
  defaultLanguage: string;
  authorName: string;
}

export async function createBlogAndLoad(baseURL: string, payload: BlogCreateDefaults): Promise<BlogPostRecord> {
  const created = await createAdminBlogPost(baseURL, {
    slug: payload.slug,
    default_language: payload.defaultLanguage,
    author_name: payload.authorName,
  });
  return created.data.post;
}

export async function loadBlogByID(baseURL: string, blogID: string): Promise<BlogPostRecord> {
  return fetchAdminBlogPost(baseURL, blogID);
}

