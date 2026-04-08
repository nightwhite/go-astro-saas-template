import { useState } from "react";
import { Button, Input, SurfacePanel, Toast, AdminPageLayout } from "@repo/ui";
import { createAdminBlogPost } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { resolveClientLocale } from "@/lib/locale";
import { blogAdminT } from "@/features/blog-admin/i18n";
import { Link } from "wouter";

export function BlogCreateFeature() {
  const locale = resolveClientLocale();
  const m = blogAdminT(locale);
  const baseURL = getAPIBaseURL();

  const [slug, setSlug] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [authorName, setAuthorName] = useState("Admin");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  async function onCreate() {
    setSaving(true);
    try {
      const response = await createAdminBlogPost(baseURL, {
        slug,
        default_language: defaultLanguage,
        author_name: authorName,
      });
      window.location.href = `/admin/blog/${encodeURIComponent(response.data.post.id)}`;
    } catch {
      setMessage(m.createFailed);
      setTone("warning");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageLayout section={m.section} title={m.createTitle} description={m.createDescription}>
      <SurfacePanel title={m.createTitle} description={m.description}>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={m.fields.slug}
            placeholder={m.placeholders.slug}
            value={slug}
            onChange={(event) => setSlug(event.currentTarget.value)}
          />
          <Input
            label={m.fields.defaultLanguage}
            placeholder={m.placeholders.defaultLanguage}
            value={defaultLanguage}
            onChange={(event) => setDefaultLanguage(event.currentTarget.value)}
          />
          <Input
            label={m.fields.authorName}
            placeholder={m.placeholders.authorName}
            value={authorName}
            onChange={(event) => setAuthorName(event.currentTarget.value)}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className="inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            {m.backToList}
          </Link>
          <Button onClick={() => void onCreate()} disabled={saving}>
            {saving ? m.saving : m.createAction}
          </Button>
        </div>
      </SurfacePanel>

      {message ? <Toast title={m.createTitle} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
