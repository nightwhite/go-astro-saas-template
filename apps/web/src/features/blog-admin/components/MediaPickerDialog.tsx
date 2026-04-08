import { useEffect, useState, type ChangeEvent } from "react";
import { Button, SurfacePanel } from "@repo/ui";
import { deleteAdminMedia, listAdminMedia, uploadAdminMedia, type AdminMediaObject } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { blogAdminT } from "@/features/blog-admin/i18n";
import { resolveClientLocale } from "@/lib/locale";

interface MediaPickerDialogProps {
  onPick: (url: string) => void;
  onClose: () => void;
}

export function MediaPickerDialog({ onPick, onClose }: MediaPickerDialogProps) {
  const locale = resolveClientLocale();
  const m = blogAdminT(locale);
  const baseURL = getAPIBaseURL();

  const [objects, setObjects] = useState<AdminMediaObject[]>([]);
  const [cursor, setCursor] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingKey, setDeletingKey] = useState("");
  const [error, setError] = useState("");

  async function loadMedia(nextCursor?: string) {
    setLoading(true);
    try {
      const response = await listAdminMedia(baseURL, nextCursor);
      setObjects(response.data.objects ?? []);
      setCursor(response.data.cursor || "");
      setError("");
    } catch {
      setError(m.media.loadFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMedia();
  }, [baseURL]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadAdminMedia(baseURL, {
        file_name: file.name,
        content_type: file.type || "application/octet-stream",
        size_bytes: file.size,
      });
      await loadMedia();
      onPick(response.data.url);
    } catch {
      setError(m.media.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-6xl rounded-2xl border border-border bg-background p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">{m.media.title}</h3>
          <button
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            {m.preview.close}
          </button>
        </div>

        <SurfacePanel title={m.media.title} description={m.media.description}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={(event) => void handleUpload(event)}
              />
              <span className="inline-flex h-10 cursor-pointer items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground">
                {uploading ? m.media.uploading : m.media.upload}
              </span>
            </label>
            <Button variant="secondary" onClick={() => void loadMedia()}>
              {m.actions.refresh}
            </Button>
            {cursor ? (
              <Button variant="secondary" onClick={() => void loadMedia(cursor)}>
                {m.media.loadMore}
              </Button>
            ) : null}
          </div>

          {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}

          {loading ? (
            <p className="text-sm text-muted-foreground">{m.loadingText}</p>
          ) : objects.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {objects.map((item) => (
                <div key={item.key} className="rounded-xl border border-border bg-card p-2">
                  <button className="block w-full text-left" type="button" onClick={() => onPick(item.url)}>
                    <div className="aspect-video overflow-hidden rounded-md bg-muted">
                      <img className="h-full w-full object-cover" src={item.url} alt={item.key} />
                    </div>
                    <p className="mt-2 truncate text-xs font-mono text-foreground">{item.key}</p>
                  </button>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{item.uploaded ? new Date(item.uploaded).toLocaleString() : "-"}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={deletingKey === item.key}
                      onClick={() => {
                        void (async () => {
                          setDeletingKey(item.key);
                          try {
                            await deleteAdminMedia(baseURL, item.key);
                            await loadMedia();
                          } catch {
                            setError(m.media.deleteFailed);
                          } finally {
                            setDeletingKey("");
                          }
                        })();
                      }}
                    >
                      {m.actions.delete}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{m.media.empty}</p>
          )}
        </SurfacePanel>
      </div>
    </div>
  );
}
