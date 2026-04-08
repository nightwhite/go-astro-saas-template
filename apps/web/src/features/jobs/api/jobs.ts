import type { JobRecord } from "@/types/admin";
import { fetchJobsWithExplain } from "@/lib/api/admin";

export interface JobsFeatureData {
  jobs: JobRecord[];
  explain: string[];
  filters: Record<string, string>;
  page: number;
  pageSize: number;
  total: number;
}

export interface JobsQueryOptions {
  page?: number;
  pageSize?: number;
  filters?: Record<string, string>;
}

export async function loadJobsFeature(baseURL: string, query?: JobsQueryOptions): Promise<JobsFeatureData> {
  const response = await fetchJobsWithExplain(baseURL, {
    page: query?.page,
    pageSize: query?.pageSize,
    sortBy: "executed_at",
    sortOrder: "desc",
    filters: query?.filters,
  }).catch(() => ({
    jobs: [],
    explain: [],
    filters: {},
    pagination: { page: 1, page_size: 20, total: 0 },
  }));
  return {
    jobs: response.jobs,
    explain: response.explain,
    filters: response.filters,
    page: response.pagination?.page ?? 1,
    pageSize: response.pagination?.page_size ?? 20,
    total: response.pagination?.total ?? response.jobs.length,
  };
}
