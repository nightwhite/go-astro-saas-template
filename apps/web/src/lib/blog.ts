import { apiGet } from "@/lib/api/client";
import { getServerAPIBaseURL } from "@/lib/api/server";
import { defaultLocale, type Locale } from "@/lib/i18n";

export interface BlogTranslationRecord {
  id: string;
  blog_post_id: string;
  language: string;
  title: string;
  excerpt?: string | null;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostRecord {
  id: string;
  tenant_id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  default_language: string;
  author_name: string;
  featured_image?: string | null;
  admin_note?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  available_languages: string[];
  translations: BlogTranslationRecord[];
}

export function resolvePostLocale(locale: string | null | undefined): Locale {
  const raw = String(locale ?? "").toLowerCase();
  if (raw === "zh" || raw === "ja" || raw === "en") return raw;
  return defaultLocale;
}

export async function fetchPublishedPosts(language: Locale): Promise<BlogPostRecord[]> {
  const baseURL = getServerAPIBaseURL();
  const response = await apiGet<{ posts: BlogPostRecord[] }>(
    `/api/v1/blog/posts?lang=${encodeURIComponent(language)}`,
    { baseURL },
  );
  return response.data.posts ?? [];
}

export async function fetchPublishedPostBySlug(slug: string): Promise<BlogPostRecord | null> {
  const baseURL = getServerAPIBaseURL();
  try {
    const response = await apiGet<{ post: BlogPostRecord }>(`/api/v1/blog/posts/${encodeURIComponent(slug)}`, { baseURL });
    return response.data.post ?? null;
  } catch {
    return null;
  }
}

export async function fetchPreviewPost(token: string): Promise<{ preview: { language: string }; post: BlogPostRecord } | null> {
  if (!token.trim()) return null;
  const baseURL = getServerAPIBaseURL();
  try {
    const response = await apiGet<{ preview: { language: string }; post: BlogPostRecord }>(
      `/api/v1/blog/preview?token=${encodeURIComponent(token)}`,
      { baseURL },
    );
    return response.data;
  } catch {
    return null;
  }
}

export function selectTranslation(post: BlogPostRecord, language: Locale): BlogTranslationRecord | null {
  const direct = (post.translations ?? []).find((item) => item.language === language);
  if (direct) return direct;
  const fallback = (post.translations ?? []).find((item) => item.language === post.default_language);
  if (fallback) return fallback;
  return post.translations?.[0] ?? null;
}

function escapeHTML(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderBlogMarkdown(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${escapeHTML(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${escapeHTML(line.slice(2))}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${escapeHTML(line)}</p>`);
  }

  closeList();
  return html.join("\n");
}

