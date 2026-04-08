export interface AdminStatItem {
  label: string;
  value: string;
}

export interface RoleRecord {
  id: string;
  key: string;
  name: string;
  description: string;
}

export interface JobRecord {
  id: string;
  job_type: string;
  status: string;
  queue: string;
  attempts: number;
  last_error: string;
  executed_at: string;
}

export interface AuditLog {
  id: string;
  actor_email: string;
  action: string;
  resource: string;
  detail: string;
  created_at: string;
}

export interface ListExplainResponse<T> {
  items: T[];
  explain: string[];
  filters: Record<string, string>;
}
