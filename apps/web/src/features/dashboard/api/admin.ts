export interface AdminOverview {
  app_name: string;
  env: string;
  modules: string[];
  viewer: {
    tenant_id: string;
    role: string;
  };
  permissions: string[];
  stats: {
    user_count: number;
    file_count: number;
    role_count: number;
    job_count: number;
    audit_log_count: number;
    system_setting_count: number;
  };
  users: Array<{
    id: string;
    email: string;
    display_name: string;
    role: string;
    status: string;
  }>;
  files: Array<{
    id: string;
    object_key: string;
    file_name: string;
    content_type: string;
    size_bytes: number;
  }>;
  settings: Record<string, unknown>;
}
