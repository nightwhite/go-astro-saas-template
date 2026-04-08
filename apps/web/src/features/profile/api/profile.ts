import { apiGet } from "@/lib/api/client";

export interface CurrentUserProfile {
  id: string;
  email: string;
  display_name: string;
  role: string;
  tenant_id: string;
}

export async function loadCurrentProfile(): Promise<CurrentUserProfile | null> {
  const response = await apiGet<{ user: CurrentUserProfile }>("/api/v1/auth/me").catch(() => null);
  return response?.data.user ?? null;
}
