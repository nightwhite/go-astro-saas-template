import { apiPost } from "@/lib/api/client";

export async function changeCurrentUserEmail(newEmail: string, currentPassword: string) {
  return apiPost<{ ok: boolean }>("/api/v1/settings/change-email", {
    newEmail,
    currentPassword,
  });
}

export async function changeCurrentUserPassword(currentPassword: string, newPassword: string) {
  return apiPost<{ ok: boolean }>("/api/v1/settings/change-password", {
    currentPassword,
    newPassword,
  });
}

export async function deleteCurrentUserAccount(currentPassword: string) {
  return apiPost<{ ok: boolean }>("/api/v1/settings/delete-account", {
    currentPassword,
  });
}
