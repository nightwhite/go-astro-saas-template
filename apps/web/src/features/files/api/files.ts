import type { AdminOverview } from "@/features/dashboard/api/admin";
import { fetchFilesWithExplain } from "@/lib/api/admin";

export interface FilesFeatureData {
  files: AdminOverview["files"];
  explain: string[];
  filters: Record<string, string>;
  page: number;
  pageSize: number;
  total: number;
}

export interface FilesQueryOptions {
  page?: number;
  pageSize?: number;
  filters?: Record<string, string>;
}

export async function loadFilesFeature(baseURL: string, query?: FilesQueryOptions): Promise<FilesFeatureData> {
  const response = await fetchFilesWithExplain(baseURL, {
    page: query?.page,
    pageSize: query?.pageSize,
    sortBy: "created_at",
    sortOrder: "desc",
    filters: query?.filters,
  }).catch(() => ({
    files: [],
    explain: [],
    filters: {},
    pagination: { page: 1, page_size: 20, total: 0 },
  }));

  return {
    files: response.files,
    explain: response.explain,
    filters: response.filters,
    page: response.pagination?.page ?? 1,
    pageSize: response.pagination?.page_size ?? 20,
    total: response.pagination?.total ?? response.files.length,
  };
}
