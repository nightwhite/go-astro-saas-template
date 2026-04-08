import { useEffect, useState } from "react";
import { Button, Input, SettingsPageLayout, SurfacePanel, Switch, Toast } from "@repo/ui";
import { fetchSettingsByCategory, saveAuthSettings } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

export function AuthSettingsFeature() {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const baseURL = getAPIBaseURL();
  const [defaultAdminEmail, setDefaultAdminEmail] = useState("admin@example.com");
  const [sessionTTL, setSessionTTL] = useState("86400");
  const [secureCookie, setSecureCookie] = useState(true);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetchSettingsByCategory(baseURL, "auth");
        const settings = response.data.settings as Record<string, unknown>;
        if (cancelled) {
          return;
        }
        if (typeof settings.default_admin_email === "string") {
          setDefaultAdminEmail(settings.default_admin_email);
        }
        if (typeof settings.session_ttl_seconds === "number") {
          setSessionTTL(String(settings.session_ttl_seconds));
        }
        if (typeof settings.secure_cookie === "boolean") {
          setSecureCookie(settings.secure_cookie);
        }
      } catch {
        if (!cancelled) {
          setMessage(m.settingsAuth.failedLoad);
          setTone("warning");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [baseURL]);

  async function handleSave() {
    try {
      await saveAuthSettings(baseURL, {
        default_admin_email: defaultAdminEmail,
        session_ttl_seconds: Number(sessionTTL) || 86400,
        secure_cookie: secureCookie,
      });
      setMessage(m.settingsAuth.saved);
      setTone("success");
    } catch {
      setMessage(m.settingsAuth.failedSave);
      setTone("warning");
    }
  }

  return (
    <SettingsPageLayout title={m.settingsAuth.title} description={m.settingsAuth.description}>
      <SurfacePanel title={m.settingsAuth.panelTitle} description={m.settingsAuth.panelDescription}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={m.settingsAuth.fields.defaultAdminEmail} value={defaultAdminEmail} onChange={(event) => setDefaultAdminEmail(event.currentTarget.value)} />
          <Input label={m.settingsAuth.fields.sessionTTL} value={sessionTTL} onChange={(event) => setSessionTTL(event.currentTarget.value)} />
          <button type="button" className="text-left" onClick={() => setSecureCookie((value) => !value)}>
            <Switch checked={secureCookie} label={m.settingsAuth.fields.secureCookie} hint={m.settingsAuth.fields.secureCookieHint} />
          </button>
        </div>
        <div className="mt-4">
          <Button onClick={() => void handleSave()}>{m.common.save}</Button>
        </div>
      </SurfacePanel>
      {message ? <Toast title={m.settingsAuth.feedbackTitle} description={message} tone={tone} /> : null}
    </SettingsPageLayout>
  );
}
