import type { AuditLog } from "@/types/admin";
import { fetchAuditLogsWithExplain } from "@/lib/api/admin";

export interface AuditFeatureData {
  logs: AuditLog[];
  explain: string[];
  filters: Record<string, string>;
  page: number;
  pageSize: number;
  total: number;
}

export interface AuditQueryOptions {
  page?: number;
  pageSize?: number;
  filters?: Record<string, string>;
}

export async function loadAuditFeature(baseURL: string, query?: AuditQueryOptions): Promise<AuditFeatureData> {
  const response = await fetchAuditLogsWithExplain(baseURL, {
    page: query?.page,
    pageSize: query?.pageSize,
    sortBy: "created_at",
    sortOrder: "desc",
    filters: query?.filters,
  }).catch(() => ({
    audit_logs: [],
    explain: [],
    filters: {},
    pagination: { page: 1, page_size: 20, total: 0 },
  }));

  return {
    logs: response.audit_logs,
    explain: response.explain,
    filters: response.filters,
    page: response.pagination?.page ?? 1,
    pageSize: response.pagination?.page_size ?? 20,
    total: response.pagination?.total ?? response.audit_logs.length,
  };
}
