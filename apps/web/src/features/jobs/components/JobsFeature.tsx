import { useState } from "react";
import { AdminPageLayout, Badge, Button, DataTable, EmptyState, FilterBar, Input, Pagination, SurfacePanel, Toast } from "@repo/ui";
import type { JobsFeatureData } from "../api/jobs";
import { enqueueJob, fetchJobsWithExplain } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface JobsFeatureProps {
  data: JobsFeatureData;
}

export function JobsFeature({ data }: JobsFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");
  const [jobs, setJobs] = useState(data.jobs);
  const [explain, setExplain] = useState(data.explain);
  const [page, setPage] = useState(data.page);
  const [pageSize] = useState(data.pageSize || 20);
  const [total, setTotal] = useState(data.total || data.jobs.length);
  const [jobTypeFilter, setJobTypeFilter] = useState(data.filters.job_type ?? "");
  const [statusFilter, setStatusFilter] = useState(data.filters.status ?? "");
  const [queueFilter, setQueueFilter] = useState(data.filters.queue ?? "");
  const [loading, setLoading] = useState(false);
  const baseURL = getAPIBaseURL();

  async function reload(nextPage = page) {
    setLoading(true);
    try {
      const response = await fetchJobsWithExplain(baseURL, {
        page: nextPage,
        pageSize,
        sortBy: "executed_at",
        sortOrder: "desc",
        filters: {
          job_type: jobTypeFilter,
          status: statusFilter,
          queue: queueFilter,
        },
      });
      setJobs(response.jobs);
      setExplain(response.explain ?? []);
      setTotal(response.pagination?.total ?? response.jobs.length);
      setPage(response.pagination?.page ?? nextPage);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams();
        params.set("page", String(response.pagination?.page ?? nextPage));
        params.set("page_size", String(pageSize));
        if (jobTypeFilter.trim()) params.set("filter_job_type", jobTypeFilter.trim());
        if (statusFilter.trim()) params.set("filter_status", statusFilter.trim());
        if (queueFilter.trim()) params.set("filter_queue", queueFilter.trim());
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
      }
    } catch {
      setMessage(m.jobs.failedLoad);
      setTone("warning");
    } finally {
      setLoading(false);
    }
  }

  async function createDemoJob() {
    try {
      await enqueueJob(baseURL, "mail.send_test", { should_fail: false, source: "admin-page" });
      setMessage(m.jobs.enqueued);
      setTone("success");
      await reload(1);
    } catch {
      setMessage(m.jobs.failedEnqueue);
      setTone("warning");
    }
  }

  return (
    <AdminPageLayout
      section={m.jobs.section}
      title={m.jobs.title}
      description={m.jobs.description}
    >
      <FilterBar>
        <Input label={m.jobs.filters.jobType} placeholder={m.jobs.filters.jobTypePlaceholder} value={jobTypeFilter} onChange={(event) => setJobTypeFilter(event.currentTarget.value)} />
        <Input label={m.jobs.filters.status} placeholder={m.jobs.filters.statusPlaceholder} value={statusFilter} onChange={(event) => setStatusFilter(event.currentTarget.value)} />
        <Input label={m.jobs.filters.queue} placeholder={m.jobs.filters.queuePlaceholder} value={queueFilter} onChange={(event) => setQueueFilter(event.currentTarget.value)} />
        <Button variant="secondary" onClick={() => void reload(1)}>{m.common.applyFilters}</Button>
      </FilterBar>
      <SurfacePanel title={m.jobs.panelTitle} description={m.jobs.panelDescription}>
        <div className="space-y-4">
          <Button onClick={() => void createDemoJob()}>{m.jobs.createDemoJob}</Button>
          {message ? <Toast title={m.jobs.feedbackTitle} description={message} tone={tone} /> : null}
          {loading ? (
            <p className="text-sm text-muted-foreground">{m.jobs.loading}</p>
          ) : jobs.length ? (
            <DataTable
              columns={[
                {
                  key: "job_type",
                  title: m.jobs.columns.job,
                  render: (job) => (
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">{job.job_type}</p>
                      <p className="text-xs text-muted-foreground">{m.jobs.columns.queueLabel}: {job.queue}</p>
                    </div>
                  ),
                },
                {
                  key: "status",
                  title: m.jobs.columns.status,
                  render: (job) => <Badge tone={job.status === "success" ? "success" : job.status === "failed" ? "danger" : "warning"}>{job.status}</Badge>,
                },
                {
                  key: "attempts",
                  title: m.jobs.columns.attempts,
                  render: (job) => (
                    <div className="space-y-1">
                      <p>{job.attempts}</p>
                      {job.last_error ? <p className="text-xs text-rose-600">{job.last_error}</p> : null}
                    </div>
                  ),
                },
              ]}
            items={jobs}
            />
          ) : (
            <EmptyState title={m.jobs.noJobsTitle} description={m.jobs.noJobsDescription} />
          )}
          <div className="space-y-2">
            <Pagination page={page} pageSize={pageSize} total={total || jobs.length} />
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
              <p className="text-xs text-muted-foreground">{m.jobs.explainPrefix}: {explain.join(" | ")}</p>
            ) : null}
          </div>
        </div>
      </SurfacePanel>
    </AdminPageLayout>
  );
}
