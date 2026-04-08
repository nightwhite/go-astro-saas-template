import { apiPost } from "@/lib/api/client";

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(baseURL: string, payload: LoginPayload) {
  return apiPost<{ user: { id: string; email: string; display_name: string; role: string } }>(`${baseURL}/api/v1/auth/login`, payload);
}
