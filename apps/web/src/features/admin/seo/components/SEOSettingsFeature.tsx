import { useEffect, useState } from "react";
import { AdminPageLayout, Button, Input, SurfacePanel, Switch, Textarea, Toast } from "@repo/ui";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { apiGet, apiPost, apiPut } from "@/lib/api/client";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

type SEOSettings = {
  site_name: string;
  site_description: string;
  site_url: string;
  default_language: string;
  organization_type: string;
  organization_name: string;
  organization_logo: string;
  organization_description: string;
  contact_email: string;
  social_links: Record<string, string>;
  robots_allow_paths: string[];
  robots_disallow_paths: string[];
  robots_custom_rules: string;
  sitemap_include_paths: string[];
  sitemap_exclude_paths: string[];
  sitemap_change_freq: string;
  sitemap_priority: number;
  google_analytics_id: string;
  google_site_verification: string;
  bing_site_verification: string;
  default_og_image: string;
  default_twitter_card: string;
  default_keywords: string;
  enable_structured_data: boolean;
  enable_breadcrumbs: boolean;
  enable_author_schema: boolean;
};

function toLines(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value.map((item) => String(item)).join("\n");
}

function toStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const normalized = String(item ?? "").trim();
    if (!normalized) continue;
    out[key] = normalized;
  }
  return out;
}

function toLineList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function coerceSEOSettings(raw: Record<string, unknown>): SEOSettings {
  return {
    site_name: String(raw.site_name ?? ""),
    site_description: String(raw.site_description ?? ""),
    site_url: String(raw.site_url ?? ""),
    default_language: String(raw.default_language ?? "en"),
    organization_type: String(raw.organization_type ?? "Organization"),
    organization_name: String(raw.organization_name ?? ""),
    organization_logo: String(raw.organization_logo ?? ""),
    organization_description: String(raw.organization_description ?? ""),
    contact_email: String(raw.contact_email ?? ""),
    social_links: toStringMap(raw.social_links),
    robots_allow_paths: Array.isArray(raw.robots_allow_paths) ? raw.robots_allow_paths.map((item) => String(item)) : ["/"],
    robots_disallow_paths: Array.isArray(raw.robots_disallow_paths) ? raw.robots_disallow_paths.map((item) => String(item)) : [],
    robots_custom_rules: String(raw.robots_custom_rules ?? ""),
    sitemap_include_paths: Array.isArray(raw.sitemap_include_paths) ? raw.sitemap_include_paths.map((item) => String(item)) : ["/"],
    sitemap_exclude_paths: Array.isArray(raw.sitemap_exclude_paths) ? raw.sitemap_exclude_paths.map((item) => String(item)) : [],
    sitemap_change_freq: String(raw.sitemap_change_freq ?? "weekly"),
    sitemap_priority: Number(raw.sitemap_priority ?? 0.5) || 0.5,
    google_analytics_id: String(raw.google_analytics_id ?? ""),
    google_site_verification: String(raw.google_site_verification ?? ""),
    bing_site_verification: String(raw.bing_site_verification ?? ""),
    default_og_image: String(raw.default_og_image ?? ""),
    default_twitter_card: String(raw.default_twitter_card ?? "summary_large_image"),
    default_keywords: String(raw.default_keywords ?? ""),
    enable_structured_data: Boolean(raw.enable_structured_data),
    enable_breadcrumbs: Boolean(raw.enable_breadcrumbs),
    enable_author_schema: Boolean(raw.enable_author_schema),
  };
}

export function SEOSettingsFeature() {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const baseURL = getAPIBaseURL();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [settings, setSettings] = useState<SEOSettings | null>(null);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  async function loadSEOSettings() {
    setLoading(true);
    try {
      const response = await apiGet<{ seo: Record<string, unknown> | null }>("/api/v1/admin/seo", { baseURL });
      const raw = response.data.seo;
      setSettings(raw ? coerceSEOSettings(raw) : null);
    } catch {
      setMessage(m.seo.failedLoad);
      setTone("warning");
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSEOSettings();
  }, [baseURL]);

  function patchSettings(next: Partial<SEOSettings>) {
    setSettings((prev) => (prev ? { ...prev, ...next } : prev));
  }

  async function handleInit() {
    setInitializing(true);
    try {
      const response = await apiPost<{ seo: Record<string, unknown> | null; already_initialized: boolean }>(
        "/api/v1/admin/seo/init",
        {},
        { baseURL },
      );
      const raw = response.data.seo;
      setSettings(raw ? coerceSEOSettings(raw) : null);
      setMessage(response.data.already_initialized ? m.seo.alreadyInitialized : m.seo.initialized);
      setTone("success");
    } catch {
      setMessage(m.seo.failedInit);
      setTone("warning");
    } finally {
      setInitializing(false);
    }
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const payload = {
        ...settings,
        social_links: {
          twitter: settings.social_links.twitter?.trim() ?? "",
          facebook: settings.social_links.facebook?.trim() ?? "",
          linkedin: settings.social_links.linkedin?.trim() ?? "",
          github: settings.social_links.github?.trim() ?? "",
          youtube: settings.social_links.youtube?.trim() ?? "",
        },
      };
      const response = await apiPut<{ seo: Record<string, unknown> | null }>(
        "/api/v1/admin/seo",
        payload,
        { baseURL },
      );
      const raw = response.data.seo;
      if (raw) {
        setSettings(coerceSEOSettings(raw));
      }
      setMessage(m.seo.saved);
      setTone("success");
    } catch {
      setMessage(m.seo.failedSave);
      setTone("warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageLayout section={m.seo.section} title={m.seo.title} description={m.seo.description}>
      {!settings ? (
        <SurfacePanel title={m.seo.notInitializedTitle} description={m.seo.notInitializedDescription}>
          <div className="flex items-center gap-2">
            <Button onClick={() => void handleInit()} disabled={initializing}>
              {initializing ? m.seo.initializing : m.seo.initButton}
            </Button>
            <Button variant="secondary" onClick={() => void loadSEOSettings()} disabled={loading}>
              {m.common.refresh}
            </Button>
          </div>
        </SurfacePanel>
      ) : (
        <div className="space-y-6">
          <SurfacePanel title={m.seo.sections.site} description={m.seo.sections.siteDescription}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label={m.seo.fields.siteName} value={settings.site_name} onChange={(event) => patchSettings({ site_name: event.currentTarget.value })} />
              <Input label={m.seo.fields.siteURL} value={settings.site_url} onChange={(event) => patchSettings({ site_url: event.currentTarget.value })} />
              <Input label={m.seo.fields.defaultLanguage} value={settings.default_language} onChange={(event) => patchSettings({ default_language: event.currentTarget.value })} />
              <Input label={m.seo.fields.defaultKeywords} value={settings.default_keywords} onChange={(event) => patchSettings({ default_keywords: event.currentTarget.value })} />
              <Textarea
                className="md:col-span-2"
                label={m.seo.fields.siteDescription}
                value={settings.site_description}
                onChange={(event) => patchSettings({ site_description: event.currentTarget.value })}
              />
            </div>
          </SurfacePanel>

          <SurfacePanel title={m.seo.sections.organization} description={m.seo.sections.organizationDescription}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={m.seo.fields.organizationType}
                value={settings.organization_type}
                onChange={(event) => patchSettings({ organization_type: event.currentTarget.value })}
              />
              <Input
                label={m.seo.fields.organizationName}
                value={settings.organization_name}
                onChange={(event) => patchSettings({ organization_name: event.currentTarget.value })}
              />
              <Input
                label={m.seo.fields.organizationLogo}
                value={settings.organization_logo}
                onChange={(event) => patchSettings({ organization_logo: event.currentTarget.value })}
              />
              <Input
                label={m.seo.fields.contactEmail}
                value={settings.contact_email}
                onChange={(event) => patchSettings({ contact_email: event.currentTarget.value })}
              />
              <Textarea
                className="md:col-span-2"
                label={m.seo.fields.organizationDescription}
                value={settings.organization_description}
                onChange={(event) => patchSettings({ organization_description: event.currentTarget.value })}
              />
            </div>
          </SurfacePanel>

          <SurfacePanel title={m.seo.sections.social} description={m.seo.sections.socialDescription}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={m.seo.fields.socialTwitter}
                value={settings.social_links.twitter ?? ""}
                onChange={(event) => patchSettings({ social_links: { ...settings.social_links, twitter: event.currentTarget.value } })}
              />
              <Input
                label={m.seo.fields.socialFacebook}
                value={settings.social_links.facebook ?? ""}
                onChange={(event) => patchSettings({ social_links: { ...settings.social_links, facebook: event.currentTarget.value } })}
              />
              <Input
                label={m.seo.fields.socialLinkedIn}
                value={settings.social_links.linkedin ?? ""}
                onChange={(event) => patchSettings({ social_links: { ...settings.social_links, linkedin: event.currentTarget.value } })}
              />
              <Input
                label={m.seo.fields.socialGitHub}
                value={settings.social_links.github ?? ""}
                onChange={(event) => patchSettings({ social_links: { ...settings.social_links, github: event.currentTarget.value } })}
              />
              <Input
                label={m.seo.fields.socialYouTube}
                value={settings.social_links.youtube ?? ""}
                onChange={(event) => patchSettings({ social_links: { ...settings.social_links, youtube: event.currentTarget.value } })}
              />
            </div>
          </SurfacePanel>

          <SurfacePanel title={m.seo.sections.robotsSitemap} description={m.seo.sections.robotsSitemapDescription}>
            <div className="grid gap-4 md:grid-cols-2">
              <Textarea
                label={m.seo.fields.robotsAllowPaths}
                value={toLines(settings.robots_allow_paths)}
                onChange={(event) => patchSettings({ robots_allow_paths: toLineList(event.currentTarget.value) })}
              />
              <Textarea
                label={m.seo.fields.robotsDisallowPaths}
                value={toLines(settings.robots_disallow_paths)}
                onChange={(event) => patchSettings({ robots_disallow_paths: toLineList(event.currentTarget.value) })}
              />
              <Textarea
                className="md:col-span-2"
                label={m.seo.fields.robotsCustomRules}
                value={settings.robots_custom_rules}
                onChange={(event) => patchSettings({ robots_custom_rules: event.currentTarget.value })}
              />
              <Textarea
                label={m.seo.fields.sitemapIncludePaths}
                value={toLines(settings.sitemap_include_paths)}
                onChange={(event) => patchSettings({ sitemap_include_paths: toLineList(event.currentTarget.value) })}
              />
              <Textarea
                label={m.seo.fields.sitemapExcludePaths}
                value={toLines(settings.sitemap_exclude_paths)}
                onChange={(event) => patchSettings({ sitemap_exclude_paths: toLineList(event.currentTarget.value) })}
              />
              <Input
                label={m.seo.fields.sitemapChangeFreq}
                value={settings.sitemap_change_freq}
                onChange={(event) => patchSettings({ sitemap_change_freq: event.currentTarget.value })}
              />
              <Input
                label={m.seo.fields.sitemapPriority}
                value={String(settings.sitemap_priority)}
                onChange={(event) =>
                  patchSettings({
                    sitemap_priority: Number(event.currentTarget.value) || 0.5,
                  })
                }
              />
            </div>
          </SurfacePanel>

          <SurfacePanel title={m.seo.sections.integrations} description={m.seo.sections.integrationsDescription}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={m.seo.fields.googleAnalyticsID}
                value={settings.google_analytics_id}
                onChange={(event) => patchSettings({ google_analytics_id: event.currentTarget.value })}
              />
              <Input
                label={m.seo.fields.googleVerification}
                value={settings.google_site_verification}
                onChange={(event) => patchSettings({ google_site_verification: event.currentTarget.value })}
              />
              <Input
                label={m.seo.fields.bingVerification}
                value={settings.bing_site_verification}
                onChange={(event) => patchSettings({ bing_site_verification: event.currentTarget.value })}
              />
              <Input
                label={m.seo.fields.defaultOgImage}
                value={settings.default_og_image}
                onChange={(event) => patchSettings({ default_og_image: event.currentTarget.value })}
              />
              <Input
                label={m.seo.fields.defaultTwitterCard}
                value={settings.default_twitter_card}
                onChange={(event) => patchSettings({ default_twitter_card: event.currentTarget.value })}
              />
            </div>
          </SurfacePanel>

          <SurfacePanel title={m.seo.sections.toggles} description={m.seo.sections.togglesDescription}>
            <div className="grid gap-2">
              <button type="button" className="text-left" onClick={() => patchSettings({ enable_structured_data: !settings.enable_structured_data })}>
                <Switch checked={settings.enable_structured_data} label={m.seo.fields.enableStructuredData} />
              </button>
              <button type="button" className="text-left" onClick={() => patchSettings({ enable_breadcrumbs: !settings.enable_breadcrumbs })}>
                <Switch checked={settings.enable_breadcrumbs} label={m.seo.fields.enableBreadcrumbs} />
              </button>
              <button type="button" className="text-left" onClick={() => patchSettings({ enable_author_schema: !settings.enable_author_schema })}>
                <Switch checked={settings.enable_author_schema} label={m.seo.fields.enableAuthorSchema} />
              </button>
            </div>
          </SurfacePanel>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? m.seo.saving : m.common.save}
            </Button>
            <Button variant="secondary" onClick={() => void loadSEOSettings()} disabled={loading}>
              {m.common.refresh}
            </Button>
          </div>
        </div>
      )}

      {message ? <Toast title={m.seo.feedbackTitle} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
