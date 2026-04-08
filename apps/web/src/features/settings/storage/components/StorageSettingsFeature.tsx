import { useEffect, useState } from "react";
import { Button, Drawer, Input, SettingsPageLayout, SurfacePanel, Switch, Toast } from "@repo/ui";
import { fetchSettingsByCategory, saveStorageSettings, testStorage as testStorageRequest } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

export function StorageSettingsFeature() {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bucket, setBucket] = useState("template-assets");
  const [endpoint, setEndpoint] = useState("https://r2.example.com");
  const [publicBaseURL, setPublicBaseURL] = useState("https://cdn.example.com");
  const [presignEnabled, setPresignEnabled] = useState(true);
  const baseURL = getAPIBaseURL();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetchSettingsByCategory(baseURL, "storage");
        const settings = response.data.settings as Record<string, unknown>;
        if (cancelled) {
          return;
        }
        if (typeof settings.bucket === "string") {
          setBucket(settings.bucket);
        }
        if (typeof settings.endpoint === "string") {
          setEndpoint(settings.endpoint);
        }
        if (typeof settings.public_base_url === "string") {
          setPublicBaseURL(settings.public_base_url);
        }
      } catch {
        if (!cancelled) {
          setMessage(m.settingsStorage.failedLoad);
          setTone("warning");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [baseURL]);

  async function saveStorage() {
    setSaving(true);
    try {
      await saveStorageSettings(baseURL, {
        bucket,
        endpoint,
        public_base_url: publicBaseURL,
        presign_enabled: presignEnabled,
      });
      setMessage(m.settingsStorage.saveSuccess);
      setTone("success");
    } catch {
      setMessage(m.settingsStorage.failedSave);
      setTone("warning");
    } finally {
      setSaving(false);
    }
  }

  async function testStorage() {
    setTesting(true);
    try {
      const response = await testStorageRequest(baseURL, "demo/test.txt");
      setMessage(response.data.result.upload_url || m.settingsStorage.testSuccess);
      setTone("success");
    } catch {
      setMessage(m.settingsStorage.failedTest);
      setTone("warning");
    } finally {
      setTesting(false);
    }
  }

  return (
    <SettingsPageLayout title={m.settingsStorage.title} description={m.settingsStorage.description}>
      <div className="space-y-6">
        <SurfacePanel title={m.settingsStorage.panelTitle} description={m.settingsStorage.panelDescription}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label={m.settingsStorage.fields.bucket} value={bucket} onChange={(event) => setBucket(event.currentTarget.value)} />
            <Input label={m.settingsStorage.fields.endpoint} value={endpoint} onChange={(event) => setEndpoint(event.currentTarget.value)} />
            <Input label={m.settingsStorage.fields.publicBaseURL} value={publicBaseURL} onChange={(event) => setPublicBaseURL(event.currentTarget.value)} />
            <button type="button" className="text-left" onClick={() => setPresignEnabled((value) => !value)}>
              <Switch checked={presignEnabled} label={m.settingsStorage.fields.presignEnabled} hint={m.settingsStorage.fields.presignHint} />
            </button>
          </div>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => void saveStorage()} disabled={saving} className="mr-2">
              {saving ? m.settingsStorage.saving : m.settingsStorage.saveButton}
            </Button>
            <Button onClick={() => void testStorage()} disabled={testing}>
              {testing ? m.settingsStorage.testing : m.settingsStorage.testButton}
            </Button>
          </div>
        </SurfacePanel>

        <Drawer title={m.settingsStorage.policyTitle} description={m.settingsStorage.policyDescription}>
          <p className="text-sm text-sidebar-foreground/80">{m.settingsStorage.policyBody}</p>
        </Drawer>
      </div>
      {message ? <Toast title={m.settingsStorage.feedbackTitle} description={message} tone={tone} /> : null}
    </SettingsPageLayout>
  );
}
