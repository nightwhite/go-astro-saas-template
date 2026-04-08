import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  deleteCurrentUserPasskey,
  fetchCurrentUserPasskeys,
  type PasskeyRecord,
} from "@/features/settings/api/security";
import { t, type Locale } from "@/lib/i18n";
import { useSessionStore } from "@/state/session";
import { prefetchCSRFToken } from "@/lib/api/csrf";

function getCookie(name: string): string | null {
  const encoded = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(encoded)) {
      return decodeURIComponent(part.slice(encoded.length));
    }
  }
  return null;
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

function describeDevice(userAgent: string, fallback: string): string {
  if (typeof navigator !== "undefined" && userAgent === navigator.userAgent) {
    return fallback;
  }
  const normalized = userAgent.trim();
  if (!normalized) return fallback;

  const known: Array<{ pattern: RegExp; label: string }> = [
    { pattern: /Macintosh|Mac OS X/i, label: "Mac" },
    { pattern: /Windows/i, label: "Windows" },
    { pattern: /Linux/i, label: "Linux" },
    { pattern: /Android/i, label: "Android" },
    { pattern: /iPhone|iPad|iPod/i, label: "iOS" },
    { pattern: /Chrome/i, label: "Chrome" },
    { pattern: /Safari/i, label: "Safari" },
    { pattern: /Firefox/i, label: "Firefox" },
    { pattern: /Edge/i, label: "Edge" },
  ];
  for (const item of known) {
    if (item.pattern.test(normalized)) return item.label;
  }
  return fallback;
}

type Props = {
  initialPasskeys: PasskeyRecord[];
  locale: Locale;
};

export function PasskeysFeature({ initialPasskeys, locale }: Props) {
  const m = t(locale).dashboard.settingsSecurity;
  const session = useSessionStore((state) => state.session);
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>(initialPasskeys);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  async function loadPasskeys() {
    setIsLoading(true);
    try {
      const rows = await fetchCurrentUserPasskeys();
      setPasskeys(rows);
      if (!rows.length) {
        setMessage("");
      }
    } catch {
      setMessage(m.passkeysLoadFailed);
      setTone("warning");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!initialPasskeys.length) {
      void loadPasskeys();
    }
  }, [initialPasskeys.length]);

  const sorted = useMemo(() => {
    return [...passkeys].sort((a, b) => {
      if (a.is_current) return -1;
      if (b.is_current) return 1;
      return Date.parse(b.created_at) - Date.parse(a.created_at);
    });
  }, [passkeys]);

  async function handleDelete(credentialID: string) {
    try {
      await deleteCurrentUserPasskey(credentialID);
      setPasskeys((current) => current.filter((item) => item.credential_id !== credentialID));
      setMessage(m.passkeyDeleted);
      setTone("success");
    } catch {
      setMessage(m.passkeyDeleteFailed);
      setTone("warning");
    }
  }

  async function handleRegisterPasskey() {
    const email = session?.user?.email?.trim();
    if (!email) {
      setMessage(m.passkeysLoadFailed);
      setTone("warning");
      return;
    }

    setIsRegistering(true);
    try {
      await prefetchCSRFToken();
      const csrfToken = getCookie("go_astro_csrf");
      if (!csrfToken) {
        throw new Error(m.passkeyRegisterFailed);
      }
      const optionRes = await fetch("/api/v1/auth/passkey/register/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Idempotency-Key": `web_passkey_${Date.now()}`,
          "X-Tenant-ID": "default",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!optionRes.ok) {
        const body = await optionRes.json().catch(() => null);
        throw new Error(body?.error?.message || m.passkeyRegisterFailed);
      }

      const optionsBody = await optionRes.json().catch(() => null);
      const challenge: string = optionsBody?.data?.options?.challenge || "";

      const verifyRes = await fetch("/api/v1/auth/passkey/register/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "Idempotency-Key": `web_passkey_${Date.now()}_verify`,
          "X-Tenant-ID": "default",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          response: {
            email,
            method: "mock_passkey",
            credential_id: `pk_${challenge || Date.now().toString()}`,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
            aaguid: "mock-authenticator",
            public_key: "mock_public_key",
          },
        }),
      });
      if (!verifyRes.ok) {
        const body = await verifyRes.json().catch(() => null);
        throw new Error(body?.error?.message || m.passkeyRegisterFailed);
      }

      await loadPasskeys();
      setMessage(m.passkeyRegistered);
      setTone("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : m.passkeyRegisterFailed);
      setTone("warning");
    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6 text-card-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{m.passkeys}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{m.passkeysTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{m.passkeysDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={() => void loadPasskeys()} disabled={isLoading}>
            {isLoading ? m.passkeysRefreshing : m.passkeysRefresh}
          </Button>
          {session?.user?.email ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleRegisterPasskey()}
              disabled={isRegistering}
            >
              {isRegistering ? m.passkeysRegistering : m.passkeysRegister}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {sorted.length ? (
          sorted.map((item) => (
            <PasskeyCard key={item.id} item={item} onDelete={handleDelete} locale={locale} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            {m.passkeysEmpty}
          </div>
        )}
      </div>

      {message ? (
        <p className={tone === "success" ? "mt-4 text-sm text-emerald-600" : "mt-4 text-sm text-amber-600"}>
          {message}
        </p>
      ) : null}
    </section>
  );
}

function PasskeyCard(props: { item: PasskeyRecord; onDelete: (credentialID: string) => Promise<void>; locale: Locale }) {
  const m = t(props.locale).dashboard.settingsSecurity;
  const device = describeDevice(props.item.user_agent || "", m.passkeysDeviceFallback);

  return (
    <Card className={props.item.is_current ? "border-primary/35 bg-secondary/30 shadow-sm" : "border-border bg-card/70"}>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              {m.passkeysItemTitle}
              {props.item.is_current ? (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {m.passkeysCurrent}
                </span>
              ) : null}
            </CardTitle>
            <CardDescription className="text-sm">
              {device}
              <span className="mx-2 text-muted-foreground">·</span>
              {formatRelative(props.item.created_at, props.locale)}
            </CardDescription>
            <p className="text-xs text-muted-foreground">
              {m.passkeysCreatedAt}: {formatDateTime(props.item.created_at)}
            </p>
            <p className="text-xs text-muted-foreground">
              {m.passkeysCredential}: {props.item.credential_id}
            </p>
          </div>
          {!props.item.is_current ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  {m.passkeysDelete}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{m.passkeysDeleteTitle}</DialogTitle>
                  <DialogDescription>{m.passkeysDeleteDescription}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{m.passkeysCancel}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={() => void props.onDelete(props.item.credential_id)}>
                      {m.passkeysConfirmDelete}
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
