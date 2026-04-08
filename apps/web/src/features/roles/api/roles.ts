import type { RoleRecord } from "@/types/admin";
import { fetchRolesWithExplain } from "@/lib/api/admin";

export interface RolesFeatureData {
  roles: RoleRecord[];
  page: number;
  pageSize: number;
  total: number;
}

export interface RolesQueryOptions {
  page?: number;
  pageSize?: number;
  filters?: Record<string, string>;
}

export async function loadRolesFeature(baseURL: string, query?: RolesQueryOptions): Promise<RolesFeatureData> {
  const response = await fetchRolesWithExplain(baseURL, {
    page: query?.page,
    pageSize: query?.pageSize,
    sortBy: "created_at",
    sortOrder: "desc",
    filters: query?.filters,
  }).catch(() => ({
    roles: [],
    pagination: { page: 1, page_size: 20, total: 0 },
  }));
  return {
    roles: response.roles,
    page: response.pagination?.page ?? 1,
    pageSize: response.pagination?.page_size ?? 20,
    total: response.pagination?.total ?? response.roles.length,
  };
}
