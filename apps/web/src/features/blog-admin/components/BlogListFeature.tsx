import { useState } from "react";
import { Button, DataTable, EmptyState, FilterBar, Input, Pagination, SurfacePanel, Toast } from "@repo/ui";
import { clearAdminBlogCache, deleteAdminBlogPost, fetchAdminBlogPosts } from "@/lib/api/admin";
import type { BlogAdminFeatureData } from "@/features/blog-admin/api/blog";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { resolveClientLocale } from "@/lib/locale";
import { blogAdminT } from "@/features/blog-admin/i18n";
import { AdminPageLayout } from "@repo/ui";
import { Link } from "wouter";

interface BlogListFeatureProps {
  data: BlogAdminFeatureData;
}

export function BlogListFeature({ data }: BlogListFeatureProps) {
  const locale = resolveClientLocale();
  const m = blogAdminT(locale);
  const baseURL = getAPIBaseURL();

  const [posts, setPosts] = useState(data.posts);
  const [page, setPage] = useState(data.page);
  const [pageSize] = useState(data.pageSize || 20);
  const [total, setTotal] = useState(data.total || data.posts.length);
  const [loading, setLoading] = useState(false);
  const [slugFilter, setSlugFilter] = useState(data.filters.slug ?? "");
  const [statusFilter, setStatusFilter] = useState(data.filters.status ?? "");
  const [languageFilter, setLanguageFilter] = useState(data.filters.lang ?? "");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  function syncURL(nextPage: number, nextSlug: string, nextStatus: string, nextLang: string) {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("page_size", String(pageSize));
    if (nextSlug.trim()) params.set("filter_slug", nextSlug.trim());
    if (nextStatus.trim()) params.set("filter_status", nextStatus.trim());
    if (nextLang.trim()) params.set("filter_lang", nextLang.trim());
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }

  async function reload(nextPage = page) {
    setLoading(true);
    try {
      const response = await fetchAdminBlogPosts(baseURL, {
        page: nextPage,
        pageSize,
        sortBy: "created_at",
        sortOrder: "desc",
        filters: {
          slug: slugFilter || undefined,
          status: statusFilter || undefined,
          lang: languageFilter || undefined,
        },
      });
      setPosts(response.posts);
      const resolvedPage = response.pagination?.page ?? nextPage;
      setPage(resolvedPage);
      setTotal(response.pagination?.total ?? response.posts.length);
      syncURL(resolvedPage, slugFilter, statusFilter, languageFilter);
    } catch {
      setMessage(m.loadFailed);
      setTone("warning");
    } finally {
      setLoading(false);
    }
  }

  function statusLabel(value: string) {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized === "draft") return m.status.draft;
    if (normalized === "published") return m.status.published;
    if (normalized === "archived") return m.status.archived;
    return value;
  }

  return (
    <AdminPageLayout section={m.section} title={m.title} description={m.description}>
      <FilterBar>
        <Input
          label={m.filters.slug}
          placeholder={m.placeholders.slugFilter}
          value={slugFilter}
          onChange={(event) => setSlugFilter(event.currentTarget.value)}
        />
        <Input
          label={m.filters.status}
          placeholder={m.placeholders.statusFilter}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.currentTarget.value)}
        />
        <Input
          label={m.filters.language}
          placeholder={m.placeholders.languageFilter}
          value={languageFilter}
          onChange={(event) => setLanguageFilter(event.currentTarget.value)}
        />
        <Button
          variant="secondary"
          onClick={() => {
            setPage(1);
            void reload(1);
          }}
        >
          {m.applyFilters}
        </Button>
        <Button variant="secondary" onClick={() => void reload(page)}>
          {m.actions.refresh}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            void (async () => {
              try {
                await clearAdminBlogCache(baseURL);
                setMessage(m.cacheCleared);
                setTone("success");
              } catch {
                setMessage(m.cacheClearFailed);
                setTone("warning");
              }
            })();
          }}
        >
          {m.actions.clearCache}
        </Button>
        <Link
          href="/blog/create"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          {m.createAction}
        </Link>
      </FilterBar>

      {loading ? (
        <p className="text-sm text-muted-foreground">{m.loadingText}</p>
      ) : posts.length ? (
        <DataTable
          columns={[
            {
              key: "slug",
              title: m.table.slug,
              render: (post) => (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{post.slug}</p>
                  <p className="text-xs text-muted-foreground">{post.id}</p>
                </div>
              ),
            },
            {
              key: "status",
              title: m.table.status,
              render: (post) => <span>{statusLabel(post.status)}</span>,
            },
            {
              key: "languages",
              title: m.table.languages,
              render: (post) => <span>{(post.available_languages ?? []).join(", ") || "-"}</span>,
            },
            {
              key: "publishedAt",
              title: m.table.publishedAt,
              render: (post) => <span>{post.published_at ? new Date(post.published_at).toLocaleString() : "-"}</span>,
            },
            {
              key: "actions",
              title: m.table.actions,
              render: (post) => (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/blog/${encodeURIComponent(post.id)}`}
                    className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    {m.actions.edit}
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      if (!confirm(m.confirm.deletePost)) return;
                      void (async () => {
                        try {
                          await deleteAdminBlogPost(baseURL, post.id);
                          setMessage(m.deleted);
                          setTone("success");
                          await reload(page);
                        } catch {
                          setMessage(m.deleteFailed);
                          setTone("warning");
                        }
                      })();
                    }}
                  >
                    {m.actions.delete}
                  </Button>
                </div>
              ),
            },
          ]}
          items={posts}
        />
      ) : (
        <EmptyState title={m.noPosts} description={m.noPostsDescription} />
      )}

      <SurfacePanel title={m.title} description={m.description}>
        <Pagination page={page} pageSize={pageSize} total={total || posts.length} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={page <= 1}
            onClick={() => {
              const nextPage = Math.max(1, page - 1);
              setPage(nextPage);
              void reload(nextPage);
            }}
          >
            {m.pagination.prev}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={page * pageSize >= total}
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              void reload(nextPage);
            }}
          >
            {m.pagination.next}
          </Button>
        </div>
      </SurfacePanel>

      {message ? <Toast title={m.title} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
