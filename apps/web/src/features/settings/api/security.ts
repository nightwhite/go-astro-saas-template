import { apiDelete, apiGet } from "@/lib/api/client";

export type PasskeyRecord = {
  id: string;
  credential_id: string;
  aaguid: string;
  user_agent: string;
  created_at: string;
  is_current: boolean;
};

export async function fetchCurrentUserPasskeys() {
  const response = await apiGet<{ passkeys: PasskeyRecord[] }>("/api/v1/settings/passkeys");
  return response.data.passkeys ?? [];
}

export async function deleteCurrentUserPasskey(credentialID: string) {
  return apiDelete<{ ok: boolean }>(`/api/v1/settings/passkeys/${encodeURIComponent(credentialID)}`, {});
}
