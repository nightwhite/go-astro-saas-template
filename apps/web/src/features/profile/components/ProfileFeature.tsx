import { useState } from "react";
import { AdminPageLayout, Button, Input, SurfacePanel, Toast } from "@repo/ui";
import type { CurrentUserProfile } from "@/features/profile/api/profile";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { apiPost } from "@/lib/api/client";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface ProfileFeatureProps {
  profile: CurrentUserProfile | null;
}

export function ProfileFeature({ profile }: ProfileFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const baseURL = getAPIBaseURL();
  const [displayName, setDisplayName] = useState(profile?.display_name || "Admin");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  async function handleSave() {
    try {
      await apiPost<{ saved: boolean }>("/api/v1/admin/settings/site", { profile_display_name: displayName }, { baseURL });
      setMessage(m.settingsSite.saved);
      setTone("success");
    } catch {
      setMessage(m.settingsSite.failedSave);
      setTone("warning");
    }
  }

  async function handleLogoutAll() {
    try {
      await apiPost<{ logged_out_all: boolean }>("/api/v1/auth/logout-all", {}, { baseURL });
      setMessage(m.profile.logoutAllSuccess);
      setTone("success");
    } catch {
      setMessage(m.profile.logoutAllFailed);
      setTone("warning");
    }
  }

  return (
    <AdminPageLayout
      section={m.profile.section}
      title={m.profile.title}
      description={m.profile.description}
    >
      <SurfacePanel title={m.profile.panelTitle} description={m.profile.panelDescription}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={m.profile.fields.displayName} value={displayName} onChange={(event) => setDisplayName(event.currentTarget.value)} />
          <Input label={m.profile.fields.email} value={profile?.email || "admin@example.com"} readOnly />
          <Input label={m.profile.fields.role} value={profile?.role || "super_admin"} readOnly />
          <Input label={m.profile.fields.tenant} value={profile?.tenant_id || "default"} readOnly />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={() => void handleSave()}>{m.profile.saveButton}</Button>
          <Button variant="secondary" onClick={() => void handleLogoutAll()}>
            {m.profile.logoutAllButton}
          </Button>
        </div>
      </SurfacePanel>
      {message ? <Toast title={m.profile.feedbackTitle} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
