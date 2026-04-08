import { apiGet } from "@/lib/api/client";

export interface AuthSessionUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  tenant_id: string;
}

export async function getCurrentSession(baseURL: string): Promise<AuthSessionUser | null> {
  const response = await apiGet<{ user: AuthSessionUser }>("/api/v1/auth/me", { baseURL }).catch(() => null);
  return response?.data.user ?? null;
}
