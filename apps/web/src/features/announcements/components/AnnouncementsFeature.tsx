import { useMemo, useState } from "react";
import { AdminPageLayout, Badge, Button, DataTable, EmptyState, FilterBar, Input, Pagination, SurfacePanel, Toast } from "@repo/ui";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

type AnnouncementStatus = "draft" | "published";

interface AnnouncementRecord {
  id: string;
  title: string;
  summary: string;
  status: AnnouncementStatus;
  published_at: string | null;
}

const demoAnnouncements: AnnouncementRecord[] = [
  {
    id: "announce-1",
    title: "Template Rollout Complete",
    summary: "Core auth, admin, teams, billing, and i18n baseline are aligned.",
    status: "published",
    published_at: "2026-04-07T10:00:00Z",
  },
  {
    id: "announce-2",
    title: "Performance Baseline Ready",
    summary: "Perf script now emits avg/p95/errors and CSRF fallback states.",
    status: "draft",
    published_at: null,
  },
];

export function AnnouncementsFeature() {
  const locale = resolveClientLocale();
  const m = adminT(locale);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");
  const [items, setItems] = useState<AnnouncementRecord[]>(demoAnnouncements);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesKeyword = keyword.trim()
        ? `${item.title} ${item.summary}`.toLowerCase().includes(keyword.trim().toLowerCase())
        : true;
      const matchesStatus = status.trim() ? item.status === status.trim() : true;
      return matchesKeyword && matchesStatus;
    });
  }, [items, keyword, status]);

  function toggleStatus(id: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (item.status === "draft") {
          return { ...item, status: "published", published_at: new Date().toISOString() };
        }
        return { ...item, status: "draft", published_at: null };
      }),
    );
    setTone("success");
    setMessage(m.announcements.saved);
  }

  return (
    <AdminPageLayout
      section={m.sidebar.items.Blog}
      title={m.announcements.title}
      description={m.announcements.description}
    >
      <FilterBar>
        <Input
          label={m.announcements.filters.keyword}
          placeholder={m.announcements.filters.keywordPlaceholder}
          value={keyword}
          onChange={(event) => setKeyword(event.currentTarget.value)}
        />
        <Input
          label={m.announcements.filters.status}
          placeholder={m.announcements.filters.statusPlaceholder}
          value={status}
          onChange={(event) => setStatus(event.currentTarget.value)}
        />
      </FilterBar>

      <SurfacePanel title={m.announcements.panelTitle} description={m.announcements.panelDescription}>
        {filtered.length ? (
          <DataTable
            columns={[
              {
                key: "title",
                title: m.announcements.columns.title,
                render: (item) => (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.summary}</p>
                  </div>
                ),
              },
              {
                key: "status",
                title: m.announcements.columns.status,
                render: (item) => <Badge tone={item.status === "published" ? "success" : "warning"}>{item.status}</Badge>,
              },
              {
                key: "published_at",
                title: m.announcements.columns.publishedAt,
                render: (item) => (
                  <span className="text-xs text-muted-foreground">
                    {item.published_at ? new Date(item.published_at).toLocaleString() : m.announcements.notPublished}
                  </span>
                ),
              },
              {
                key: "actions",
                title: m.announcements.columns.actions,
                render: (item) => (
                  <Button size="sm" variant="secondary" onClick={() => toggleStatus(item.id)}>
                    {item.status === "draft" ? m.announcements.actions.publish : m.announcements.actions.unpublish}
                  </Button>
                ),
              },
            ]}
            items={filtered}
          />
        ) : (
          <EmptyState title={m.announcements.emptyTitle} description={m.announcements.emptyDescription} />
        )}
        <div className="mt-4">
          <Pagination page={1} pageSize={20} total={filtered.length} />
        </div>
      </SurfacePanel>

      {message ? <Toast title={m.announcements.feedbackTitle} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
