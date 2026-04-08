import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@repo/ui";
import { useSessionStore } from "@/state/session";
import { apiPut } from "@/lib/api/client";
import { t, type Locale } from "@/lib/i18n";

function trimDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function ProfileSettingsForm({ locale }: { locale: Locale }) {
  const m = t(locale).dashboard.settingsProfile;
  const session = useSessionStore((s) => s.session);
  const isLoading = useSessionStore((s) => s.isLoading);
  const refresh = useSessionStore((s) => s.refresh);

  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(session?.user?.display_name || "");
  }, [session?.user?.display_name]);

  if (!session || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{m.title}</CardTitle>
          <CardDescription>{m.loadingDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{m.loadingHint}</p>
        </CardContent>
      </Card>
    );
  }

  const onSubmit: NonNullable<ComponentProps<"form">["onSubmit"]> = async (event) => {
    event.preventDefault();
    const next = trimDisplayName(displayName);
    if (!next) {
      toast.error(m.validationDisplayNameRequired);
      return;
    }

    setIsSaving(true);
    const loadingID = toast.loading(m.saving);
    try {
      await apiPut<{ user: { display_name: string } }>("/api/v1/auth/me", {
        display_name: next,
      });
      await refresh();
      toast.success(m.saved, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.saveFailed;
      toast.error(message, { id: loadingID });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.title}</CardTitle>
        <CardDescription>{m.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-6 sm:grid-cols-2">
            <FieldLabel label={m.displayName}>
              <Input
                value={displayName}
                maxLength={80}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
              />
            </FieldLabel>
            <FieldLabel label={m.role}>
              <Input value={session.user.role || "member"} readOnly />
            </FieldLabel>
          </div>
          <FieldLabel label={m.email} hint={m.emailHint}>
            <Input
              type="email"
              value={session.user.email}
              readOnly
            />
          </FieldLabel>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? m.savingButton : m.saveButton}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldLabel(props: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{props.label}</span>
      {props.children}
      {props.hint ? <span className="block text-xs text-muted-foreground">{props.hint}</span> : null}
    </label>
  );
}
