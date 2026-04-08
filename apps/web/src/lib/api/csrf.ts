import { apiGet } from "@/lib/api/client";

export async function prefetchCSRFToken(): Promise<void> {
  // Best-effort: causes server to Set-Cookie with CSRF token.
  await apiGet<{ token: string }>("/api/v1/auth/csrf").catch(() => null);
}

