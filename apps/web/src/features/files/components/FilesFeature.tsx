import { useState } from "react";
import { Badge, Button, DataTable, EmptyState, FilterBar, Input, ListPageLayout, Pagination, SurfacePanel, Toast } from "@repo/ui";
import { headFileObject, prepareFileUpload } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import type { FilesFeatureData } from "../api/files";
import { fetchFilesWithExplain } from "@/lib/api/admin";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface FilesFeatureProps {
  data: FilesFeatureData;
}

export function FilesFeature({ data }: FilesFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "warning">("success");
  const [files, setFiles] = useState(data.files);
  const [explain, setExplain] = useState(data.explain);
  const [page, setPage] = useState(data.page);
  const [pageSize] = useState(data.pageSize || 20);
  const [total, setTotal] = useState(data.total || data.files.length);
  const [fileNameFilter, setFileNameFilter] = useState(data.filters.file_name ?? "");
  const [contentTypeFilter, setContentTypeFilter] = useState(data.filters.content_type ?? "");
  const [loading, setLoading] = useState(false);
  const baseURL = getAPIBaseURL();

  async function reload(nextPage = page) {
    setLoading(true);
    try {
      const response = await fetchFilesWithExplain(baseURL, {
        page: nextPage,
        pageSize,
        sortBy: "created_at",
        sortOrder: "desc",
        filters: {
          file_name: fileNameFilter,
          content_type: contentTypeFilter,
        },
      });
      setFiles(response.files);
      setExplain(response.explain ?? []);
      setTotal(response.pagination?.total ?? response.files.length);
      setPage(response.pagination?.page ?? nextPage);
      if (typeof window !== "undefined") {
        const params = new URLSearchParams();
        params.set("page", String(response.pagination?.page ?? nextPage));
        params.set("page_size", String(pageSize));
        if (fileNameFilter.trim()) params.set("filter_file_name", fileNameFilter.trim());
        if (contentTypeFilter.trim()) params.set("filter_content_type", contentTypeFilter.trim());
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
      }
    } catch {
      setMessage(m.files.failedLoad);
      setMessageTone("warning");
    } finally {
      setLoading(false);
    }
  }

  async function prepareUpload() {
    try {
      const response = await prepareFileUpload(baseURL, "demo-upload.txt", "text/plain", 2048);
      setMessage(response.data.result.upload_url);
      setMessageTone("success");
    } catch {
      setMessage(m.files.failedGenerateUploadURL);
      setMessageTone("warning");
    }
  }

  async function inspectFirstObject(objectKey: string) {
    try {
      const response = await headFileObject(baseURL, objectKey);
      setMessage(`${response.data.result.bucket} · ${response.data.result.endpoint}`);
      setMessageTone("success");
    } catch {
      setMessage(m.files.failedInspect);
      setMessageTone("warning");
    }
  }

  return (
    <ListPageLayout
      title={m.files.title}
      description={m.files.description}
      toolbar={
        <>
          <Button variant="secondary" onClick={() => void reload(1)}>
            {m.files.applyFilters}
          </Button>
          <Button onClick={() => void prepareUpload()}>{m.files.generateUploadURL}</Button>
          {files[0] ? (
            <Button variant="secondary" onClick={() => void inspectFirstObject(files[0].object_key)}>
              {m.files.inspectFirstObject}
            </Button>
          ) : null}
        </>
      }
    >
      <FilterBar>
        <Input
          label={m.files.filters.fileName}
          placeholder={m.files.filters.fileNamePlaceholder}
          value={fileNameFilter}
          onChange={(event) => setFileNameFilter(event.currentTarget.value)}
        />
        <Input
          label={m.files.filters.contentType}
          placeholder={m.files.filters.contentTypePlaceholder}
          value={contentTypeFilter}
          onChange={(event) => setContentTypeFilter(event.currentTarget.value)}
        />
      </FilterBar>

      {loading ? (
        <p className="text-sm text-muted-foreground">{m.files.loading}</p>
      ) : files.length ? (
        <DataTable
          columns={[
            {
              key: "file",
              title: m.files.columns.file,
              render: (file) => (
                <div className="space-y-2">
                  <p className="font-medium text-foreground">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">{file.object_key}</p>
                </div>
              ),
            },
            {
              key: "type",
              title: m.files.columns.type,
              render: (file) => <Badge tone="brand">{file.content_type}</Badge>,
            },
            {
              key: "size",
              title: m.files.columns.size,
              render: (file) => <span>{Math.round(file.size_bytes / 1024)} KB</span>,
            },
          ]}
          items={files}
        />
      ) : (
        <EmptyState title={m.files.noFilesTitle} description={m.files.noFilesDescription} />
      )}

      <SurfacePanel title={m.files.queryPolicyTitle} description={m.files.queryPolicyDescription}>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>{m.files.sortAllowlist}</li>
          <li>{m.files.filterAllowlist}</li>
          <li>{m.files.deletePolicy}</li>
          {explain.length ? (
            <li>{m.files.explainPrefix}: {explain.join(" | ")}</li>
          ) : null}
        </ul>
        <div className="mt-4 space-y-2">
          <Pagination page={page} pageSize={pageSize} total={total || files.length} />
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
        </div>
      </SurfacePanel>

      {message ? (
        <Toast
          tone={messageTone}
          title={m.files.feedbackTitle}
          description={message}
        />
      ) : null}
    </ListPageLayout>
  );
}
