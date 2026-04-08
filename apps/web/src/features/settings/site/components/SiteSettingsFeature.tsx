import { useEffect, useState } from "react";
import { Button, Input, SettingsPageLayout, SurfacePanel, Toast } from "@repo/ui";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { fetchSettingsByCategory, saveSiteSettings } from "@/lib/api/admin";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

export function SiteSettingsFeature() {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const baseURL = getAPIBaseURL();
  const [name, setName] = useState("go-astro-template");
  const [baseURLValue, setBaseURLValue] = useState("http://localhost:8080");
  const [webOrigin, setWebOrigin] = useState("http://localhost:4321");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetchSettingsByCategory(baseURL, "site");
        const settings = response.data.settings as Record<string, unknown>;
        if (cancelled) {
          return;
        }
        if (typeof settings.name === "string") {
          setName(settings.name);
        }
        if (typeof settings.base_url === "string") {
          setBaseURLValue(settings.base_url);
        }
        if (typeof settings.web_origin === "string") {
          setWebOrigin(settings.web_origin);
        }
      } catch {
        if (!cancelled) {
          setMessage(m.settingsSite.failedLoad);
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
      await saveSiteSettings(baseURL, {
        name,
        base_url: baseURLValue,
        web_origin: webOrigin,
      });
      setMessage(m.settingsSite.saved);
      setTone("success");
    } catch {
      setMessage(m.settingsSite.failedSave);
      setTone("warning");
    }
  }

  return (
    <SettingsPageLayout title={m.settingsSite.title} description={m.settingsSite.description}>
      <SurfacePanel title={m.settingsSite.panelTitle} description={m.settingsSite.panelDescription}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={m.settingsSite.fields.appName} value={name} onChange={(event) => setName(event.currentTarget.value)} />
          <Input label={m.settingsSite.fields.baseURL} value={baseURLValue} onChange={(event) => setBaseURLValue(event.currentTarget.value)} />
          <Input label={m.settingsSite.fields.webOrigin} value={webOrigin} onChange={(event) => setWebOrigin(event.currentTarget.value)} />
        </div>
        <div className="mt-4">
          <Button onClick={() => void handleSave()}>{m.common.save}</Button>
        </div>
      </SurfacePanel>
      {message ? <Toast title={m.settingsSite.feedbackTitle} description={message} tone={tone} /> : null}
    </SettingsPageLayout>
  );
}
