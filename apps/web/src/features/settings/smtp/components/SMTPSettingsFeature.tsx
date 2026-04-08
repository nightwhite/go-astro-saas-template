import { useEffect, useState } from "react";
import { Button, ConfirmDialog, Input, SettingsPageLayout, SurfacePanel, Switch, Toast } from "@repo/ui";
import { fetchSettingsByCategory, saveSMTPSettings, testSMTP as testSMTPRequest } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";
import { Link } from "wouter";

export function SMTPSettingsFeature() {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [host, setHost] = useState("smtp.example.com");
  const [port, setPort] = useState("587");
  const [from, setFrom] = useState("noreply@example.com");
  const [testTo, setTestTo] = useState("ops@example.com");
  const [templateMailEnabled, setTemplateMailEnabled] = useState(true);
  const baseURL = getAPIBaseURL();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetchSettingsByCategory(baseURL, "smtp");
        const settings = response.data.settings as Record<string, unknown>;
        if (cancelled) {
          return;
        }
        if (typeof settings.host === "string" && settings.host) {
          setHost(settings.host);
        }
        if (typeof settings.port === "number") {
          setPort(String(settings.port));
        }
        if (typeof settings.from === "string" && settings.from) {
          setFrom(settings.from);
        }
      } catch {
        // keep defaults if remote settings are unavailable
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [baseURL]);

  async function saveSMTP() {
    setSaving(true);
    try {
      await saveSMTPSettings(baseURL, {
        host,
        port: Number(port) || 587,
        from,
        template_mail_enabled: templateMailEnabled,
      });
      setMessage(m.settingsSMTP.saveSuccess);
      setTone("success");
    } catch {
      setMessage(m.settingsSMTP.failedSave);
      setTone("warning");
    } finally {
      setSaving(false);
    }
  }

  async function testSMTP() {
    setTesting(true);
    try {
      const response = await testSMTPRequest(baseURL, testTo);
      setMessage(response.data.result.message || m.settingsSMTP.testSuccess);
      setTone("success");
    } catch {
      setMessage(m.settingsSMTP.failedTest);
      setTone("warning");
    } finally {
      setTesting(false);
    }
  }

  return (
    <SettingsPageLayout title={m.settingsSMTP.title} description={m.settingsSMTP.description}>
      <div className="space-y-6">
        <SurfacePanel title={m.settingsSMTP.panelTitle} description={m.settingsSMTP.panelDescription}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label={m.settingsSMTP.fields.host} value={host} onChange={(event) => setHost(event.currentTarget.value)} />
            <Input label={m.settingsSMTP.fields.port} value={port} onChange={(event) => setPort(event.currentTarget.value)} />
            <Input label={m.settingsSMTP.fields.from} value={from} onChange={(event) => setFrom(event.currentTarget.value)} />
            <Input label={m.settingsSMTP.fields.testRecipient} value={testTo} onChange={(event) => setTestTo(event.currentTarget.value)} />
            <button type="button" className="text-left" onClick={() => setTemplateMailEnabled((value) => !value)}>
              <Switch checked={templateMailEnabled} label={m.settingsSMTP.fields.templateMailEnabled} hint={m.settingsSMTP.fields.templateMailHint} />
            </button>
          </div>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => void saveSMTP()} disabled={saving} className="mr-2">
              {saving ? m.settingsSMTP.saving : m.settingsSMTP.saveButton}
            </Button>
            <Button onClick={() => void testSMTP()} disabled={testing}>
              {testing ? m.settingsSMTP.testing : m.settingsSMTP.testButton}
            </Button>
            <Link
              className="ml-2 inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
              href="/settings/email-templates"
            >
              {m.settingsSMTP.emailTemplates}
            </Link>
          </div>
        </SurfacePanel>

        <ConfirmDialog title={m.settingsSMTP.releasePolicyTitle} description={m.settingsSMTP.releasePolicyDescription}>
          <p className="text-sm text-muted-foreground">{m.settingsSMTP.releasePolicyBody}</p>
        </ConfirmDialog>
      </div>
      {message ? <Toast title={m.settingsSMTP.feedbackTitle} description={message} tone={tone} /> : null}
    </SettingsPageLayout>
  );
}
