import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageLayout, EmptyState } from "@repo/ui";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { fetchCurrentSessions, revokeCurrentSession, type SessionRecord } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { t, type Locale } from "@/lib/i18n";

interface SessionsFeatureProps {
  initialSessions: SessionRecord[];
  locale: Locale;
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function formatRelative(value: string, locale: string): string {
  const parsed = new Date(value);
  const delta = Date.now() - parsed.getTime();
  if (Number.isNaN(parsed.getTime()) || delta < 0) return formatDateTime(value);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < minute) return formatter.format(0, "minute");
  if (delta < hour) return formatter.format(-Math.floor(delta / minute), "minute");
  if (delta < day) return formatter.format(-Math.floor(delta / hour), "hour");
  return formatter.format(-Math.floor(delta / day), "day");
}

export function SessionsFeature({ initialSessions, locale }: SessionsFeatureProps) {
  const m = t(locale).dashboard;
  const baseURL = getAPIBaseURL();
  const [sessions, setSessions] = useState<SessionRecord[]>(initialSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchCurrentSessions(baseURL);
      setSessions(result);
    } catch {
      setMessage(m.sessions.failedLoad);
      setTone("warning");
    } finally {
      setIsLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    if (!initialSessions.length) {
      void loadSessions();
    }
  }, [initialSessions.length, loadSessions]);

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      if (a.current) return -1;
      if (b.current) return 1;
      return Date.parse(b.created_at) - Date.parse(a.created_at);
    });
  }, [sessions]);

  async function handleRevoke(sessionID: string) {
    try {
      await revokeCurrentSession(baseURL, sessionID);
      setSessions((current) => current.filter((item) => item.id !== sessionID));
      setMessage(m.sessions.sessionRevoked);
      setTone("success");
    } catch {
      setMessage(m.sessions.failedRevoke);
      setTone("warning");
    }
  }

  return (
    <AdminPageLayout
      section={m.sessions.section}
      title={m.sessions.title}
      description={m.sessions.description}
    >
      <div className="mb-1 flex items-center justify-end">
        <Button variant="secondary" onClick={() => void loadSessions()} disabled={isLoading}>
          {isLoading ? m.sessions.refreshing : m.sessions.refresh}
        </Button>
      </div>

      {sorted.length ? (
        <div className="space-y-3">
          {sorted.map((item) => (
            <SessionCard key={item.id} item={item} onRevoke={handleRevoke} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyState title={m.sessions.noSessionsTitle} description={m.sessions.noSessionsDescription} />
      )}

      {message ? (
        <p className={tone === "success" ? "text-sm text-emerald-600" : "text-sm text-amber-600"}>
          {message}
        </p>
      ) : null}
    </AdminPageLayout>
  );
}

function SessionCard(props: { item: SessionRecord; onRevoke: (sessionID: string) => Promise<void>; locale: Locale }) {
  const m = t(props.locale).dashboard.sessions;
  const closeRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Card
      className={
        props.item.current
          ? "border-primary/35 bg-secondary/30 shadow-sm"
          : "border-border bg-card/70"
      }
    >
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {m.sessionTitle}
              {props.item.current ? (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {m.currentSession}
                </span>
              ) : null}
            </CardTitle>
            <CardDescription className="text-sm">
              {m.created}: {formatDateTime(props.item.created_at)}
              <span className="mx-2 text-muted-foreground">·</span>
              {m.colLastSeen}: {formatRelative(props.item.last_seen_at, props.locale)}
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              {m.colSession}: {props.item.id}
            </p>
            <p className="text-xs text-muted-foreground">
              {m.colExpires}: {formatDateTime(props.item.expires_at)}
            </p>
          </div>
          {!props.item.current ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  {m.revoke}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{m.deleteSessionTitle}</DialogTitle>
                  <DialogDescription>{m.deleteSessionDescription}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose ref={closeRef} asChild>
                    <Button variant="outline">{m.cancel}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={() => void props.onRevoke(props.item.id)}>
                      {m.confirmDelete}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </CardHeader>
    </Card>
  );
}
