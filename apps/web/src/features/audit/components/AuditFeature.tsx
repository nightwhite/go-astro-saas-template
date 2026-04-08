import { useMemo, useState } from "react";
import { AdminPageLayout, Badge, DataTable, EmptyState, FilterBar, Input, Pagination, SurfacePanel, Drawer } from "@repo/ui";
import type { AuditFeatureData } from "../api/audit";
import { fetchAuditLogsWithExplain } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { Button } from "@repo/ui";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface AuditFeatureProps {
  data: AuditFeatureData;
}

export function AuditFeature({ data }: AuditFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const baseURL = getAPIBaseURL();
  const [logs, setLogs] = useState(data.logs);
  const [explain, setExplain] = useState(data.explain);
  const [page, setPage] = useState(data.page || 1);
  const [pageSize] = useState(data.pageSize || 20);
  const [total, setTotal] = useState(data.total || data.logs.length);
  const [actorFilter, setActorFilter] = useState(data.filters.actor_email ?? "");
  const [actionFilter, setActionFilter] = useState(data.filters.action ?? "");
  const [resourceFilter, setResourceFilter] = useState(data.filters.resource ?? "");
  const [loading, setLoading] = useState(false);
  const [selectedLogID, setSelectedLogID] = useState("");

  const filteredLogs = useMemo(() => {
    return logs;
  }, [logs]);

  const selectedLog = filteredLogs.find((log) => log.id === selectedLogID) ?? null;

  async function reload(nextPage = page) {
    setLoading(true);
    try {
      const response = await fetchAuditLogsWithExplain(baseURL, {
        page: nextPage,
        pageSize,
        sortBy: "created_at",
        sortOrder: "desc",
        filters: {
          actor_email: actorFilter,
          action: actionFilter,
          resource: resourceFilter,
        },
      });
      setLogs(response.audit_logs);
      setExplain(response.explain ?? []);
      setTotal(response.pagination?.total ?? response.audit_logs.length);
      setPage(response.pagination?.page ?? nextPage);
      setSelectedLogID("");
      if (typeof window !== "undefined") {
        const params = new URLSearchParams();
        params.set("page", String(response.pagination?.page ?? nextPage));
        params.set("page_size", String(pageSize));
        if (actorFilter.trim()) params.set("filter_actor_email", actorFilter.trim());
        if (actionFilter.trim()) params.set("filter_action", actionFilter.trim());
        if (resourceFilter.trim()) params.set("filter_resource", resourceFilter.trim());
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminPageLayout
      section={m.audit.section}
      title={m.audit.title}
      description={m.audit.description}
    >
      <FilterBar>
        <Input label={m.audit.filters.actor} placeholder={m.audit.filters.actorPlaceholder} value={actorFilter} onChange={(event) => setActorFilter(event.currentTarget.value)} />
        <Input label={m.audit.filters.action} placeholder={m.audit.filters.actionPlaceholder} value={actionFilter} onChange={(event) => setActionFilter(event.currentTarget.value)} />
        <Input label={m.audit.filters.resource} placeholder={m.audit.filters.resourcePlaceholder} value={resourceFilter} onChange={(event) => setResourceFilter(event.currentTarget.value)} />
        <Button variant="secondary" onClick={() => void reload(1)}>{m.common.applyFilters}</Button>
      </FilterBar>
      <SurfacePanel title={m.audit.panelTitle} description={m.audit.panelDescription}>
        {loading ? (
          <p className="text-sm text-muted-foreground">{m.audit.loading}</p>
        ) : filteredLogs.length ? (
          <DataTable
            columns={[
              {
                key: "action",
                title: m.audit.columns.action,
                render: (log) => (
                  <button type="button" className="space-y-2 text-left" onClick={() => setSelectedLogID(log.id)}>
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.detail}</p>
                  </button>
                ),
              },
              {
                key: "actor",
                title: m.audit.columns.actor,
                render: (log) => <span>{log.actor_email}</span>,
              },
              {
                key: "resource",
                title: m.audit.columns.resource,
                render: (log) => <Badge>{log.resource}</Badge>,
              },
            ]}
            items={filteredLogs}
          />
        ) : (
          <EmptyState title={m.audit.noEventsTitle} description={m.audit.noEventsDescription} />
        )}
        <div className="mt-4 space-y-2">
          <Pagination page={page} pageSize={pageSize} total={total || filteredLogs.length} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => void reload(Math.max(1, page - 1))}>
              {m.common.prev}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page * pageSize >= total}
              onClick={() => void reload(page + 1)}
            >
              {m.common.next}
            </Button>
          </div>
          {explain.length ? (
            <p className="text-xs text-muted-foreground">{m.audit.explainPrefix}: {explain.join(" | ")}</p>
          ) : null}
        </div>
      </SurfacePanel>
      {selectedLog ? (
        <Drawer title={m.audit.detailTitle} description={m.audit.detailDescription}>
          <div className="space-y-2 text-sm text-sidebar-foreground/80">
            <p>{m.audit.fields.id}: {selectedLog.id}</p>
            <p>{m.audit.fields.actor}: {selectedLog.actor_email}</p>
            <p>{m.audit.fields.action}: {selectedLog.action}</p>
            <p>{m.audit.fields.resource}: {selectedLog.resource}</p>
            <p>{m.audit.fields.detail}: {selectedLog.detail}</p>
            <p>{m.audit.fields.createdAt}: {selectedLog.created_at}</p>
          </div>
        </Drawer>
      ) : null}
    </AdminPageLayout>
  );
}
