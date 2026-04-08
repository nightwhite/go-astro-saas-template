import { apiDelete, apiGet, apiPatch, apiPost, apiPut, buildListQuery } from "./client";
import type { AdminOverview } from "@/features/dashboard/api/admin";
import type { AuditLog, JobRecord, RoleRecord } from "@/types/admin";

export async function fetchAdminOverview(baseURL: string): Promise<AdminOverview | null> {
  try {
    const response = await apiGet<{ overview: AdminOverview }>("/api/v1/admin/overview", { baseURL });
    return response.data.overview;
  } catch {
    return null;
  }
}

export interface UserRecord {
  id: string;
  tenant_id: string;
  email: string;
  display_name: string;
  role: string;
  status: string;
  created_at: string;
}

export interface ListQueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string>;
}

export interface UserListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    email?: string;
    role?: string;
    status?: string;
  };
}

export interface UserDetailRecord {
  user: UserRecord;
  roles: Array<{
    id: string;
    key: string;
    name: string;
    description: string;
    created_at: string;
  }>;
  permissions: string[];
}

export async function createDemoFile(baseURL: string) {
  return apiPost<{ created: boolean }>("/api/v1/admin/files/demo", {
    file_name: "demo-upload.txt",
    content_type: "text/plain",
    size_bytes: 2048,
  }, { baseURL });
}

export async function prepareFileUpload(baseURL: string, fileName: string, contentType: string, sizeBytes: number) {
  return apiPost<{ result: { object_key: string; upload_url: string; download_url: string } }>("/api/v1/admin/files/upload/prepare",
    {
      file_name: fileName,
      content_type: contentType,
      size_bytes: sizeBytes,
    },
    { baseURL });
}

export async function headFileObject(baseURL: string, objectKey: string) {
  return apiGet<{ result: { object_key: string; bucket: string; endpoint: string } }>(`/api/v1/admin/files/object?object_key=${encodeURIComponent(objectKey)}`, { baseURL });
}

export async function enqueueJob(baseURL: string, jobType: string, payload: Record<string, unknown>) {
  return apiPost<{ enqueued: boolean }>("/api/v1/admin/jobs", {
    job_type: jobType,
    payload,
  }, { baseURL });
}

export async function saveDemoSMTPSettings(baseURL: string) {
  return apiPost<{ saved: boolean }>("/api/v1/admin/settings/smtp", {
    host: "smtp.example.com",
    port: 587,
    from: "noreply@example.com",
  }, { baseURL });
}

export async function saveSMTPSettings(baseURL: string, payload: Record<string, unknown>) {
  return apiPost<{ saved: boolean }>("/api/v1/admin/settings/smtp", payload, { baseURL });
}

export async function saveStorageSettings(baseURL: string, payload: Record<string, unknown>) {
  return apiPost<{ saved: boolean }>("/api/v1/admin/settings/storage", payload, { baseURL });
}

export async function testSMTP(baseURL: string, to: string) {
  return apiPost<{ result: { target: string; message: string } }>("/api/v1/admin/settings/smtp/test", {
    to,
  }, { baseURL });
}

export async function testStorage(baseURL: string, objectKey: string) {
  return apiPost<{ result: { object_key: string; upload_url: string } }>("/api/v1/admin/settings/storage/test", {
    object_key: objectKey,
  }, { baseURL });
}

export async function fetchRoles(baseURL: string): Promise<RoleRecord[]> {
  const response = await apiGet<{ roles: RoleRecord[] }>("/api/v1/admin/roles", { baseURL });
  return response.data.roles;
}

export async function fetchUsers(
  baseURL: string,
  query?: UserListQuery,
): Promise<{
  users: UserRecord[];
  filters: Record<string, string>;
  explain: string[];
  pagination?: { page: number; page_size: number; total: number };
}> {
  const search = buildListQuery({
    page: query?.page,
    pageSize: query?.pageSize,
    sortBy: query?.sortBy,
    sortOrder: query?.sortOrder,
    filters: query?.filters as Record<string, string> | undefined,
  });
  const response = await apiGet<{ users: UserRecord[]; filters: Record<string, string>; explain: string[] }>(
    `/api/v1/admin/users${search.toString() ? `?${search.toString()}` : ""}`,
    { baseURL },
  );
  return {
    users: response.data.users,
    filters: response.data.filters ?? {},
    explain: response.data.explain ?? [],
    pagination: response.pagination,
  };
}

export async function fetchUserDetail(baseURL: string, userID: string): Promise<UserDetailRecord> {
  const response = await apiGet<{ detail: UserDetailRecord }>(`/api/v1/admin/users/${encodeURIComponent(userID)}`, { baseURL });
  return response.data.detail;
}

export async function createUser(baseURL: string, payload: {
  email: string;
  display_name: string;
  password: string;
  role: string;
}) {
  return apiPost<{ user: UserRecord }>("/api/v1/admin/users", payload, { baseURL });
}

export async function updateUser(baseURL: string, payload: {
  user_id: string;
  display_name?: string;
  role?: string;
  status?: string;
}) {
  return apiPut<{ user: UserRecord }>("/api/v1/admin/users", payload, { baseURL });
}

export async function deleteUser(baseURL: string, userID: string) {
  return apiDelete<{ deleted: boolean }>("/api/v1/admin/users", { user_id: userID }, { baseURL });
}

export async function resetUserPassword(baseURL: string, userID: string, newPassword: string) {
  return apiPost<{ reset: boolean }>("/api/v1/admin/users/password/reset", { user_id: userID, new_password: newPassword }, { baseURL });
}

export async function fetchJobs(baseURL: string): Promise<JobRecord[]> {
  const response = await apiGet<{ jobs: JobRecord[] }>("/api/v1/admin/jobs", { baseURL });
  return response.data.jobs;
}

export async function fetchAuditLogs(baseURL: string): Promise<AuditLog[]> {
  const response = await apiGet<{ audit_logs: AuditLog[] }>("/api/v1/admin/audit", { baseURL });
  return response.data.audit_logs;
}

export async function fetchJobsWithExplain(
  baseURL: string,
  queryOptions?: ListQueryOptions,
) {
  const search = buildListQuery({
    page: queryOptions?.page,
    pageSize: queryOptions?.pageSize,
    sortBy: queryOptions?.sortBy,
    sortOrder: queryOptions?.sortOrder,
    filters: queryOptions?.filters,
  });
  const response = await apiGet<{ jobs: JobRecord[]; explain: string[]; filters: Record<string, string> }>(
    `/api/v1/admin/jobs${search.toString() ? `?${search.toString()}` : ""}`,
    { baseURL },
  );
  return {
    ...response.data,
    pagination: response.pagination,
  };
}

export async function fetchAuditLogsWithExplain(
  baseURL: string,
  queryOptions?: ListQueryOptions,
) {
  const search = buildListQuery({
    page: queryOptions?.page,
    pageSize: queryOptions?.pageSize,
    sortBy: queryOptions?.sortBy,
    sortOrder: queryOptions?.sortOrder,
    filters: queryOptions?.filters,
  });
  const response = await apiGet<{ audit_logs: AuditLog[]; explain: string[]; filters: Record<string, string> }>(
    `/api/v1/admin/audit${search.toString() ? `?${search.toString()}` : ""}`,
    { baseURL },
  );
  return {
    ...response.data,
    pagination: response.pagination,
  };
}

export async function fetchFilesWithExplain(
  baseURL: string,
  queryOptions?: ListQueryOptions,
) {
  const search = buildListQuery({
    page: queryOptions?.page,
    pageSize: queryOptions?.pageSize,
    sortBy: queryOptions?.sortBy,
    sortOrder: queryOptions?.sortOrder,
    filters: queryOptions?.filters,
  });
  const response = await apiGet<{
    files: AdminOverview["files"];
    explain: string[];
    filters: Record<string, string>;
  }>(`/api/v1/admin/files${search.toString() ? `?${search.toString()}` : ""}`, { baseURL });
  return {
    ...response.data,
    pagination: response.pagination,
  };
}

export async function fetchCurrentUserRoles(baseURL: string): Promise<RoleRecord[]> {
  const response = await apiGet<{ roles: RoleRecord[] }>("/api/v1/admin/roles/current", { baseURL });
  return response.data.roles;
}

export async function fetchRolesWithExplain(
  baseURL: string,
  queryOptions?: ListQueryOptions,
) {
  const search = buildListQuery({
    page: queryOptions?.page,
    pageSize: queryOptions?.pageSize,
    sortBy: queryOptions?.sortBy,
    sortOrder: queryOptions?.sortOrder,
    filters: queryOptions?.filters,
  });
  const response = await apiGet<{ roles: RoleRecord[] }>(
    `/api/v1/admin/roles${search.toString() ? `?${search.toString()}` : ""}`,
    { baseURL },
  );
  return {
    roles: response.data.roles,
    pagination: response.pagination,
  };
}

export async function updateRolePermissions(baseURL: string, roleID: string, permissionKeys: string[]) {
  return apiPost<{ updated: boolean }>("/api/v1/admin/roles/permissions", {
    role_id: roleID,
    permission_keys: permissionKeys,
  }, { baseURL });
}

export async function bindUserRole(baseURL: string, email: string, roleID: string) {
  return apiPost<{ bound: boolean }>("/api/v1/admin/roles/bind-user", {
    email,
    role_id: roleID,
  }, { baseURL });
}

export async function saveSiteSettings(baseURL: string, payload: Record<string, unknown>) {
  return apiPost<{ saved: boolean }>("/api/v1/admin/settings/site", payload, { baseURL });
}

export async function saveAuthSettings(baseURL: string, payload: Record<string, unknown>) {
  return apiPost<{ saved: boolean }>("/api/v1/admin/settings/auth", payload, { baseURL });
}

export async function fetchSettingsByCategory(baseURL: string, category: "site" | "auth" | "smtp" | "storage" | "runtime") {
  return apiGet<{ settings: Record<string, unknown>; category: string }>(`/api/v1/admin/settings/${category}`, { baseURL });
}

export async function fetchMailTemplates(baseURL: string) {
  return apiGet<{ templates: Array<Record<string, unknown>> }>("/api/v1/admin/settings/mail-templates", { baseURL });
}

export async function fetchMailTemplate(baseURL: string, templateKey: string) {
  return apiGet<{ template: Record<string, unknown> }>(`/api/v1/admin/settings/mail-templates/${encodeURIComponent(templateKey)}`, { baseURL });
}

export async function saveMailTemplate(
  baseURL: string,
  templateKey: string,
  payload: { subject: string; body: string; description: string; enabled: boolean },
) {
  return apiPost<{ template: Record<string, unknown> }>(
    `/api/v1/admin/settings/mail-templates/${encodeURIComponent(templateKey)}`,
    payload,
    { baseURL },
  );
}

export async function previewMailTemplate(
  baseURL: string,
  templateKey: string,
  payload: Record<string, unknown>,
) {
  return apiPost<{ preview: Record<string, unknown> }>(
    `/api/v1/admin/settings/mail-templates/${encodeURIComponent(templateKey)}/preview`,
    { payload },
    { baseURL },
  );
}

export async function testMailTemplate(
  baseURL: string,
  templateKey: string,
  to: string,
  payload: Record<string, unknown>,
) {
  return apiPost<{ result: string }>(
    `/api/v1/admin/settings/mail-templates/${encodeURIComponent(templateKey)}/test`,
    { to, payload },
    { baseURL },
  );
}

export interface SessionRecord {
  id: string;
  current: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
  last_seen_at: string;
}

export async function fetchCurrentSessions(baseURL: string): Promise<SessionRecord[]> {
  const response = await apiGet<{ sessions: SessionRecord[] }>("/api/v1/auth/sessions", { baseURL });
  return response.data.sessions;
}

export async function revokeCurrentSession(baseURL: string, sessionID: string) {
  return apiDelete<{ logged_out: boolean }>(`/api/v1/auth/sessions/${encodeURIComponent(sessionID)}`, {}, { baseURL });
}

export interface BlogTranslationRecord {
  id: string;
  blog_post_id: string;
  language: string;
  title: string;
  excerpt?: string | null;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostRecord {
  id: string;
  tenant_id: string;
  slug: string;
  status: "draft" | "published" | "archived";
  default_language: string;
  author_name: string;
  featured_image?: string | null;
  admin_note?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  available_languages: string[];
  translations: BlogTranslationRecord[];
}

export interface AdminMediaObject {
  key: string;
  size: number;
  uploaded: string | null;
  url: string;
}

export async function listAdminMedia(baseURL: string, cursor?: string) {
  const search = new URLSearchParams();
  if (cursor) search.set("cursor", cursor);
  return apiGet<{ objects: AdminMediaObject[]; truncated: boolean; cursor: string }>(
    `/api/v1/admin/media${search.toString() ? `?${search.toString()}` : ""}`,
    { baseURL },
  );
}

export async function uploadAdminMedia(
  baseURL: string,
  payload: { file_name: string; content_type: string; size_bytes: number; folder?: string },
) {
  return apiPost<{ key: string; url: string }>("/api/v1/admin/media/upload", payload, { baseURL });
}

export async function deleteAdminMedia(baseURL: string, key: string) {
  return apiDelete<{ ok: boolean }>("/api/v1/admin/media", { key }, { baseURL });
}

export interface BlogListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: {
    slug?: string;
    status?: string;
    lang?: string;
  };
}

export async function fetchAdminBlogPosts(
  baseURL: string,
  query?: BlogListQuery,
): Promise<{
  posts: BlogPostRecord[];
  filters: Record<string, string>;
  explain: string[];
  pagination?: { page: number; page_size: number; total: number };
}> {
  const search = buildListQuery({
    page: query?.page,
    pageSize: query?.pageSize,
    sortBy: query?.sortBy,
    sortOrder: query?.sortOrder,
    filters: query?.filters as Record<string, string> | undefined,
  });
  const response = await apiGet<{ posts: BlogPostRecord[]; filters: Record<string, string>; explain: string[] }>(
    `/api/v1/admin/blog/posts${search.toString() ? `?${search.toString()}` : ""}`,
    { baseURL },
  );
  return {
    posts: response.data.posts ?? [],
    filters: response.data.filters ?? {},
    explain: response.data.explain ?? [],
    pagination: response.pagination,
  };
}

export async function fetchAdminBlogPost(baseURL: string, blogID: string): Promise<BlogPostRecord> {
  const response = await apiGet<{ post: BlogPostRecord }>(`/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}`, { baseURL });
  return response.data.post;
}

export async function createAdminBlogPost(
  baseURL: string,
  payload: { slug: string; default_language: string; author_name?: string },
) {
  return apiPost<{ post: BlogPostRecord }>("/api/v1/admin/blog/posts", payload, { baseURL });
}

export async function updateAdminBlogPost(
  baseURL: string,
  blogID: string,
  payload: {
    slug?: string;
    status?: "draft" | "published" | "archived";
    default_language?: string;
    author_name?: string;
    featured_image?: string | null;
    admin_note?: string | null;
  },
) {
  return apiPatch<{ post: BlogPostRecord }>(`/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}`, payload, { baseURL });
}

export async function deleteAdminBlogPost(baseURL: string, blogID: string) {
  return apiDelete<{ deleted: boolean }>(`/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}`, {}, { baseURL });
}

export async function fetchAdminBlogTranslation(baseURL: string, blogID: string, lang: string) {
  return apiGet<{ translation: BlogTranslationRecord | null }>(
    `/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}/translation/${encodeURIComponent(lang)}`,
    { baseURL },
  );
}

export async function saveAdminBlogTranslation(
  baseURL: string,
  blogID: string,
  lang: string,
  payload: {
    title: string;
    excerpt?: string | null;
    content: string;
    meta_title?: string | null;
    meta_description?: string | null;
    keywords?: string | null;
  },
) {
  return apiPut<{ translation: BlogTranslationRecord }>(
    `/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}/translation/${encodeURIComponent(lang)}`,
    payload,
    { baseURL },
  );
}

export async function deleteAdminBlogTranslation(baseURL: string, blogID: string, lang: string) {
  return apiDelete<{ deleted: boolean }>(
    `/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}/translation/${encodeURIComponent(lang)}`,
    {},
    { baseURL },
  );
}

export async function publishAdminBlogPost(baseURL: string, blogID: string) {
  return apiPost<{ post: BlogPostRecord }>(`/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}/publish`, {}, { baseURL });
}

export async function unpublishAdminBlogPost(baseURL: string, blogID: string) {
  return apiPost<{ post: BlogPostRecord }>(`/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}/unpublish`, {}, { baseURL });
}

export async function createAdminBlogPreviewLink(baseURL: string, blogID: string, language: string) {
  return apiPost<{ url: string; expires_at: string }>(
    `/api/v1/admin/blog/posts/${encodeURIComponent(blogID)}/preview-link`,
    { language },
    { baseURL },
  );
}

export async function clearAdminBlogCache(baseURL: string) {
  return apiPost<{ ok: boolean }>("/api/v1/admin/blog/cache/clear", {}, { baseURL });
}
