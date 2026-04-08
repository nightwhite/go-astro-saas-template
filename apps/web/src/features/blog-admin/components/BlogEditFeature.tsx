import { useEffect, useMemo, useState } from "react";
import { AdminPageLayout, Button, Input, SurfacePanel, Textarea, Toast } from "@repo/ui";
import {
  createAdminBlogPreviewLink,
  deleteAdminBlogPost,
  deleteAdminBlogTranslation,
  fetchAdminBlogTranslation,
  publishAdminBlogPost,
  saveAdminBlogTranslation,
  unpublishAdminBlogPost,
  updateAdminBlogPost,
  type BlogPostRecord,
} from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { resolveClientLocale } from "@/lib/locale";
import { renderBlogMarkdown } from "@/lib/blog";
import { blogAdminT } from "@/features/blog-admin/i18n";
import { Link } from "wouter";
import { MediaPickerDialog } from "@/features/blog-admin/components/MediaPickerDialog";

interface BlogEditFeatureProps {
  initialPost: BlogPostRecord;
}

export function BlogEditFeature({ initialPost }: BlogEditFeatureProps) {
  const locale = resolveClientLocale();
  const m = blogAdminT(locale);
  const baseURL = getAPIBaseURL();

  const [post, setPost] = useState(initialPost);
  const [activeLanguage, setActiveLanguage] = useState(initialPost.default_language || "en");

  const [translationTitle, setTranslationTitle] = useState("");
  const [translationExcerpt, setTranslationExcerpt] = useState("");
  const [translationContent, setTranslationContent] = useState("");
  const [translationMetaTitle, setTranslationMetaTitle] = useState("");
  const [translationMetaDescription, setTranslationMetaDescription] = useState("");
  const [translationKeywords, setTranslationKeywords] = useState("");

  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingTranslation, setSavingTranslation] = useState(false);
  const [previewURL, setPreviewURL] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const previewHTML = useMemo(() => renderBlogMarkdown(translationContent), [translationContent]);

  function statusLabel(value: string) {
    const normalized = String(value ?? "").toLowerCase();
    if (normalized === "draft") return m.status.draft;
    if (normalized === "published") return m.status.published;
    if (normalized === "archived") return m.status.archived;
    return value;
  }

  useEffect(() => {
    let cancelled = false;
    async function loadTranslation() {
      setLoadingTranslation(true);
      try {
        const response = await fetchAdminBlogTranslation(baseURL, post.id, activeLanguage);
        if (cancelled) return;
        const record = response.data.translation;
        setTranslationTitle(record?.title || "");
        setTranslationExcerpt(record?.excerpt || "");
        setTranslationContent(record?.content || "");
        setTranslationMetaTitle(record?.meta_title || "");
        setTranslationMetaDescription(record?.meta_description || "");
        setTranslationKeywords(record?.keywords || "");
      } catch {
        if (!cancelled) {
          setMessage(m.loadTranslationFailed);
          setTone("warning");
        }
      } finally {
        if (!cancelled) setLoadingTranslation(false);
      }
    }
    void loadTranslation();
    return () => {
      cancelled = true;
    };
  }, [activeLanguage, baseURL, post.id, m.loadTranslationFailed]);

  async function savePostMeta() {
    setSavingMeta(true);
    try {
      const response = await updateAdminBlogPost(baseURL, post.id, {
        slug: post.slug,
        status: post.status,
        default_language: post.default_language,
        author_name: post.author_name,
        featured_image: post.featured_image ?? null,
        admin_note: post.admin_note ?? null,
      });
      setPost(response.data.post);
      setMessage(m.saved);
      setTone("success");
    } catch {
      setMessage(m.updateFailed);
      setTone("warning");
    } finally {
      setSavingMeta(false);
    }
  }

  async function saveTranslation() {
    setSavingTranslation(true);
    try {
      await saveAdminBlogTranslation(baseURL, post.id, activeLanguage, {
        title: translationTitle,
        excerpt: translationExcerpt || null,
        content: translationContent,
        meta_title: translationMetaTitle || null,
        meta_description: translationMetaDescription || null,
        keywords: translationKeywords || null,
      });
      setMessage(m.saved);
      setTone("success");
      const refreshed = await updateAdminBlogPost(baseURL, post.id, {});
      setPost(refreshed.data.post);
    } catch {
      setMessage(m.saveTranslationFailed);
      setTone("warning");
    } finally {
      setSavingTranslation(false);
    }
  }

  return (
    <AdminPageLayout section={m.section} title={m.editTitle} description={m.editDescription}>
      <SurfacePanel title={m.editTitle} description={m.description}>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{m.fields.slug}: {post.slug}</span>
          <span>·</span>
          <span>{m.fields.postStatus}: {statusLabel(post.status)}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label={m.fields.slug} value={post.slug} onChange={(event) => setPost((prev) => ({ ...prev, slug: event.currentTarget.value }))} />
          <Input
            label={m.fields.postStatus}
            value={post.status}
            onChange={(event) =>
              setPost((prev) => ({
                ...prev,
                status: (event.currentTarget.value as BlogPostRecord["status"]) || "draft",
              }))
            }
          />
          <Input
            label={m.fields.defaultLanguage}
            value={post.default_language}
            onChange={(event) => setPost((prev) => ({ ...prev, default_language: event.currentTarget.value || "en" }))}
          />
          <Input
            label={m.fields.authorName}
            value={post.author_name}
            onChange={(event) => setPost((prev) => ({ ...prev, author_name: event.currentTarget.value }))}
          />
          <Input
            label={m.fields.featuredImage}
            placeholder={m.placeholders.featuredImage}
            value={post.featured_image || ""}
            onChange={(event) => setPost((prev) => ({ ...prev, featured_image: event.currentTarget.value || null }))}
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => setShowMediaPicker(true)}>
              {m.media.open}
            </Button>
          </div>
          <Input
            label={m.fields.adminNote}
            value={post.admin_note || ""}
            onChange={(event) => setPost((prev) => ({ ...prev, admin_note: event.currentTarget.value || null }))}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className="inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            {m.backToList}
          </Link>
          <Button onClick={() => void savePostMeta()} disabled={savingMeta}>
            {savingMeta ? m.saving : m.saveSettings}
          </Button>
          {post.status === "published" ? (
            <Button
              variant="secondary"
              onClick={() => {
                void (async () => {
                  try {
                    const response = await unpublishAdminBlogPost(baseURL, post.id);
                    setPost(response.data.post);
                    setMessage(m.unpublished);
                    setTone("success");
                  } catch {
                    setMessage(m.unpublish);
                    setTone("warning");
                  }
                })();
              }}
            >
              {m.unpublish}
            </Button>
          ) : (
            <Button
              onClick={() => {
                void (async () => {
                  try {
                    const response = await publishAdminBlogPost(baseURL, post.id);
                    setPost(response.data.post);
                    setMessage(m.published);
                    setTone("success");
                  } catch {
                    setMessage(m.publish);
                    setTone("warning");
                  }
                })();
              }}
            >
              {m.publish}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              void (async () => {
                try {
                  const response = await createAdminBlogPreviewLink(baseURL, post.id, activeLanguage);
                  const absolute = response.data.url.startsWith("http")
                    ? response.data.url
                    : `${window.location.origin}${response.data.url}`;
                  setPreviewURL(absolute);
                  await navigator.clipboard.writeText(absolute).catch(() => undefined);
                  setMessage(m.previewLinkCreated);
                  setTone("success");
                } catch {
                  setMessage(m.previewLinkFailed);
                  setTone("warning");
                }
              })();
            }}
          >
            {m.previewLink}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (!confirm(m.confirm.deletePost)) return;
              void (async () => {
                try {
                  await deleteAdminBlogPost(baseURL, post.id);
                  window.location.href = "/admin/blog";
                } catch {
                  setMessage(m.deleteFailed);
                  setTone("warning");
                }
              })();
            }}
          >
            {m.actions.delete}
          </Button>
        </div>

        {previewURL ? (
          <p className="mt-3 break-all text-sm text-muted-foreground">
            {m.previewLink}:{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href={previewURL} target="_blank" rel="noreferrer">
              {previewURL}
            </a>
          </p>
        ) : null}
      </SurfacePanel>

      <SurfacePanel title={m.fields.content} description={m.editDescription}>
        <div className="mb-4 flex flex-wrap gap-2">
          {["en", "zh", "ja"].map((lang) => (
            <Button
              key={lang}
              variant={activeLanguage === lang ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveLanguage(lang)}
            >
              {lang}
            </Button>
          ))}
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (!confirm(m.confirm.deleteTranslation)) return;
              void (async () => {
                try {
                  await deleteAdminBlogTranslation(baseURL, post.id, activeLanguage);
                  setTranslationTitle("");
                  setTranslationExcerpt("");
                  setTranslationContent("");
                  setTranslationMetaTitle("");
                  setTranslationMetaDescription("");
                  setTranslationKeywords("");
                  setMessage(m.translationDeleted);
                  setTone("success");
                } catch {
                  setMessage(m.deleteFailed);
                  setTone("warning");
                }
              })();
            }}
          >
            {m.actions.delete}
          </Button>
        </div>

        {loadingTranslation ? (
          <p className="text-sm text-muted-foreground">{m.saving}</p>
        ) : (
          <div className="grid gap-4">
            <Input label={m.fields.title} value={translationTitle} onChange={(event) => setTranslationTitle(event.currentTarget.value)} />
            <Textarea label={m.fields.excerpt} value={translationExcerpt} onChange={(event) => setTranslationExcerpt(event.currentTarget.value)} />
            <Textarea label={m.fields.content} value={translationContent} onChange={(event) => setTranslationContent(event.currentTarget.value)} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label={m.fields.metaTitle} value={translationMetaTitle} onChange={(event) => setTranslationMetaTitle(event.currentTarget.value)} />
              <Input
                label={m.fields.metaDescription}
                value={translationMetaDescription}
                onChange={(event) => setTranslationMetaDescription(event.currentTarget.value)}
              />
            </div>
            <Input
              label={m.fields.keywords}
              placeholder={m.placeholders.keywords}
              value={translationKeywords}
              onChange={(event) => setTranslationKeywords(event.currentTarget.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void saveTranslation()} disabled={savingTranslation}>
                {savingTranslation ? m.saving : m.saveTranslation}
              </Button>
            </div>
          </div>
        )}
      </SurfacePanel>

      <SurfacePanel title={m.preview.title} description={m.preview.open}>
        <article className="prose max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
        </article>
      </SurfacePanel>

      {message ? <Toast title={m.title} description={message} tone={tone} /> : null}
      {showMediaPicker ? (
        <MediaPickerDialog
          onClose={() => setShowMediaPicker(false)}
          onPick={(url) => {
            setPost((prev) => ({ ...prev, featured_image: url }));
            setShowMediaPicker(false);
          }}
        />
      ) : null}
    </AdminPageLayout>
  );
}
