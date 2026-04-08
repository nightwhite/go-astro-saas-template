import { useEffect, useState } from "react";
import { AdminPageLayout, SurfacePanel, Toast } from "@repo/ui";
import type { AdminOverview } from "@/features/dashboard/api/admin";
import { apiGet } from "@/lib/api/client";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface ObservabilityFeatureProps {
  overview: AdminOverview | null;
}

export function ObservabilityFeature({ overview }: ObservabilityFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const stats = overview?.stats;
  const hasData = Boolean(overview);
  const [runtimeMetrics, setRuntimeMetrics] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState<string>("");
  const baseURL = getAPIBaseURL();

  useEffect(() => {
    let cancelled = false;
    async function loadMetrics() {
      try {
        const response = await apiGet<{ metrics: Record<string, unknown> }>("/metrics", { baseURL });
        if (!cancelled) {
          setRuntimeMetrics(response.data.metrics);
          setLoadError("");
        }
      } catch {
        if (!cancelled) {
          setLoadError(m.observability.failedMetrics);
        }
      }
    }
    void loadMetrics();
    return () => {
      cancelled = true;
    };
  }, [baseURL]);

  return (
    <AdminPageLayout
      section={m.observability.section}
      title={m.observability.title}
      description={m.observability.description}
    >
      {!hasData ? (
        <Toast
          tone="warning"
          title={m.observability.overviewUnavailableTitle}
          description={m.observability.overviewUnavailableDescription}
        />
      ) : null}
      {loadError ? <Toast tone="warning" title={m.observability.metricsErrorTitle} description={loadError} /> : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <SurfacePanel title={m.observability.panels.healthTitle} description={m.observability.panels.healthDescription}>
          <div className="space-y-2 text-sm text-foreground">
            <p>GET `/healthz`</p>
            <p>GET `/readyz`</p>
            <p>GET `/metrics`</p>
          </div>
        </SurfacePanel>

        <SurfacePanel title={m.observability.panels.queueTitle} description={m.observability.panels.queueDescription}>
          <div className="space-y-2 text-sm text-foreground">
            <p>{m.observability.labels.jobs}: {stats?.job_count ?? 0}</p>
            <p>{m.observability.labels.audit}: {stats?.audit_log_count ?? 0}</p>
            <p>{m.observability.labels.queueTotal}: {Number(runtimeMetrics?.queue_backlog_total ?? 0)}</p>
          </div>
        </SurfacePanel>

        <SurfacePanel title={m.observability.panels.resourcesTitle} description={m.observability.panels.resourcesDescription}>
          <div className="space-y-2 text-sm text-foreground">
            <p>{m.observability.labels.users}: {stats?.user_count ?? 0}</p>
            <p>{m.observability.labels.files}: {stats?.file_count ?? 0}</p>
            <p>{m.observability.labels.settings}: {stats?.system_setting_count ?? 0}</p>
            <p>{m.observability.labels.slowRequest}: {Number(runtimeMetrics?.slow_request_total ?? 0)}</p>
            <p>{m.observability.labels.slowQuery}: {Number(runtimeMetrics?.slow_query_total ?? 0)}</p>
            <p>{m.observability.labels.cacheHit}: {Number(runtimeMetrics?.cache_hit_rate ?? 0).toFixed(2)}%</p>
          </div>
        </SurfacePanel>
      </div>
    </AdminPageLayout>
  );
}
