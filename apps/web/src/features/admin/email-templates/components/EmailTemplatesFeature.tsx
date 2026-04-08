import { useEffect, useState } from "react";
import { AdminPageLayout, Badge, Button, DataTable, EmptyState, Input, SurfacePanel, Toast } from "@repo/ui";
import {
  fetchMailTemplate,
  fetchMailTemplates,
  previewMailTemplate,
  saveMailTemplate,
  testMailTemplate,
} from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface TemplateItem {
  key: string;
  subject: string;
  body: string;
  description: string;
  enabled: boolean;
}

function toTemplateItem(raw: Record<string, unknown>): TemplateItem {
  return {
    key: String(raw.key ?? ""),
    subject: String(raw.subject ?? ""),
    body: String(raw.body ?? ""),
    description: String(raw.description ?? ""),
    enabled: Boolean(raw.enabled),
  };
}

export function EmailTemplatesFeature() {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const baseURL = getAPIBaseURL();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const listResponse = await fetchMailTemplates(baseURL);
        const items = (listResponse.data.templates ?? []).map((item) => toTemplateItem(item as Record<string, unknown>));
        if (cancelled) return;
        setTemplates(items);
        if (items[0]) {
          setSelectedKey(items[0].key);
        }
      } catch {
        if (!cancelled) {
          setMessage(m.emailTemplates.failedLoadList);
          setTone("warning");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [baseURL]);

  useEffect(() => {
    let cancelled = false;
    async function loadSelected() {
      if (!selectedKey) return;
      try {
        const response = await fetchMailTemplate(baseURL, selectedKey);
        const template = toTemplateItem(response.data.template as Record<string, unknown>);
        if (cancelled) return;
        setSubject(template.subject || "");
        setBody(template.body || "");
        setDescription(template.description || "");
        setEnabled(Boolean(template.enabled));
      } catch {
        if (!cancelled) {
          setMessage(m.emailTemplates.failedLoadSelected);
          setTone("warning");
        }
      }
    }
    void loadSelected();
    return () => {
      cancelled = true;
    };
  }, [baseURL, selectedKey]);

  async function handleSave() {
    if (!selectedKey) return;
    try {
      await saveMailTemplate(baseURL, selectedKey, { subject, body, description, enabled });
      setMessage(m.emailTemplates.saved);
      setTone("success");
      const listResponse = await fetchMailTemplates(baseURL);
      setTemplates((listResponse.data.templates ?? []).map((item) => toTemplateItem(item as Record<string, unknown>)));
    } catch {
      setMessage(m.emailTemplates.failedSave);
      setTone("warning");
    }
  }

  async function handlePreview() {
    if (!selectedKey) return;
    try {
      const response = await previewMailTemplate(baseURL, selectedKey, {
        code: "123456",
        token: "reset_demo_token",
      });
      setPreview(String(response.data.preview.body || ""));
      setMessage(m.emailTemplates.previewRendered);
      setTone("success");
    } catch {
      setMessage(m.emailTemplates.failedPreview);
      setTone("warning");
    }
  }

  async function handleTestSend() {
    if (!selectedKey) return;
    try {
      const response = await testMailTemplate(baseURL, selectedKey, "ops@example.com", {
        code: "123456",
        token: "reset_demo_token",
      });
      setMessage(response.data.result || m.emailTemplates.testSent);
      setTone("success");
    } catch {
      setMessage(m.emailTemplates.failedTestSend);
      setTone("warning");
    }
  }

  return (
    <AdminPageLayout section={m.emailTemplates.section} title={m.emailTemplates.title} description={m.emailTemplates.description}>
      <SurfacePanel title={m.emailTemplates.listTitle} description={m.emailTemplates.listDescription}>
        {templates.length ? (
          <DataTable
            columns={[
              {
                key: "key",
                title: m.emailTemplates.columns.key,
                render: (item) => (
                  <button className="text-left font-medium text-foreground" type="button" onClick={() => setSelectedKey(item.key)}>
                    {item.key}
                  </button>
                ),
              },
              {
                key: "subject",
                title: m.emailTemplates.columns.subject,
                render: (item) => <span>{item.subject}</span>,
              },
              {
                key: "enabled",
                title: m.emailTemplates.columns.status,
                render: (item) => <Badge tone={item.enabled ? "success" : "warning"}>{item.enabled ? m.common.enabled : m.common.disabled}</Badge>,
              },
            ]}
            items={templates}
          />
        ) : (
          <EmptyState title={m.emailTemplates.noTemplatesTitle} description={m.emailTemplates.noTemplatesDescription} />
        )}
      </SurfacePanel>

      <SurfacePanel title={m.emailTemplates.editorTitle} description={m.emailTemplates.editorDescription}>
        <div className="grid gap-4">
          <Input label={m.emailTemplates.fields.templateKey} value={selectedKey} onChange={(event) => setSelectedKey(event.currentTarget.value)} />
          <Input label={m.emailTemplates.fields.description} value={description} onChange={(event) => setDescription(event.currentTarget.value)} />
          <Input label={m.emailTemplates.fields.subject} value={subject} onChange={(event) => setSubject(event.currentTarget.value)} />
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">{m.emailTemplates.fields.body}</span>
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              value={body}
              onChange={(event) => setBody(event.currentTarget.value)}
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.currentTarget.checked)} />
            {m.emailTemplates.fields.enabled}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void handleSave()}>{m.emailTemplates.buttons.save}</Button>
            <Button variant="secondary" onClick={() => void handlePreview()}>
              {m.emailTemplates.buttons.preview}
            </Button>
            <Button variant="secondary" onClick={() => void handleTestSend()}>
              {m.emailTemplates.buttons.sendTest}
            </Button>
          </div>
          {preview ? (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">{m.emailTemplates.previewTitle}</p>
              <pre className="whitespace-pre-wrap">{preview}</pre>
            </div>
          ) : null}
        </div>
      </SurfacePanel>

      {message ? <Toast title={m.emailTemplates.feedbackTitle} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
