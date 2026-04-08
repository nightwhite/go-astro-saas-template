"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  changeCurrentUserEmail,
  changeCurrentUserPassword,
  deleteCurrentUserAccount,
} from "@/features/account/api/account";
import { t, type Locale } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";
import { useSessionStore } from "@/state/session";

interface AccountFeatureProps {
  locale?: Locale;
}

export function AccountFeature({ locale }: AccountFeatureProps) {
  const resolvedLocale = locale ?? resolveClientLocale();
  const m = t(resolvedLocale).dashboard.accountPage;
  const common = t(resolvedLocale).common;
  const session = useSessionStore((state) => state.session);
  const refresh = useSessionStore((state) => state.refresh);

  const [nextEmail, setNextEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const isDeleteConfirmMatched = useMemo(() => {
    return deleteConfirmText.trim().toUpperCase() === "DELETE";
  }, [deleteConfirmText]);

  useEffect(() => {
    setNextEmail(session?.user?.email || "");
  }, [session?.user?.email]);

  async function onChangeEmail(event: any) {
    event.preventDefault();
    const normalizedEmail = nextEmail.trim().toLowerCase();
    const password = emailPassword.trim();
    if (!normalizedEmail || !password) {
      toast.error(m.validationEmailRequired);
      return;
    }
    setIsSubmittingEmail(true);
    const loadingID = toast.loading(m.changeEmailSubmitting);
    try {
      await changeCurrentUserEmail(normalizedEmail, password);
      setEmailPassword("");
      await refresh();
      toast.success(m.changeEmailSuccess, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.changeEmailFailed;
      toast.error(message, { id: loadingID });
    } finally {
      setIsSubmittingEmail(false);
    }
  }

  async function onChangePassword(event: any) {
    event.preventDefault();
    const oldPassword = currentPassword.trim();
    const newPassword = nextPassword.trim();
    if (!oldPassword || !newPassword) {
      toast.error(m.validationPasswordRequired);
      return;
    }
    if (oldPassword === newPassword) {
      toast.error(m.validationNewPasswordDifferent);
      return;
    }
    setIsSubmittingPassword(true);
    const loadingID = toast.loading(m.changePasswordSubmitting);
    try {
      await changeCurrentUserPassword(oldPassword, newPassword);
      setCurrentPassword("");
      setNextPassword("");
      await refresh();
      toast.success(m.changePasswordSuccess, { id: loadingID });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.changePasswordFailed;
      toast.error(message, { id: loadingID });
    } finally {
      setIsSubmittingPassword(false);
    }
  }

  async function onDeleteAccount(event: any) {
    event.preventDefault();
    const password = deletePassword.trim();
    if (!isDeleteConfirmMatched) {
      toast.error(m.deleteValidationConfirmText);
      return;
    }
    if (!password) {
      toast.error(m.deleteValidationPasswordRequired);
      return;
    }
    setIsSubmittingDelete(true);
    const loadingID = toast.loading(m.deleteSubmitting);
    try {
      await deleteCurrentUserAccount(password);
      toast.success(m.deleteSuccess, { id: loadingID });
      window.location.href = "/sign-in";
    } catch (error) {
      const message = error instanceof Error ? error.message : m.deleteFailed;
      toast.error(message, { id: loadingID });
      setIsSubmittingDelete(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{m.title}</CardTitle>
          <CardDescription>{m.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-[0.1em]">{m.summaryEmailLabel}</p>
            <p className="mt-1 break-all font-medium text-foreground">{session?.user?.email || "-"}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-[0.1em]">{m.summaryRoleLabel}</p>
            <p className="mt-1 font-medium text-foreground">{session?.user?.role || "-"}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-[0.1em]">{m.summaryTenantLabel}</p>
            <p className="mt-1 font-medium text-foreground">{session?.user?.tenant_id || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.changeEmailTitle}</CardTitle>
          <CardDescription>{m.changeEmailDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onChangeEmail}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{m.changeEmailNewEmailLabel}</span>
              <Input
                type="email"
                autoComplete="email"
                value={nextEmail}
                onChange={(event) => setNextEmail(event.currentTarget.value)}
                placeholder={m.changeEmailNewEmailPlaceholder}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{m.changeEmailCurrentPasswordLabel}</span>
              <Input
                type="password"
                autoComplete="current-password"
                value={emailPassword}
                onChange={(event) => setEmailPassword(event.currentTarget.value)}
                placeholder={m.changeEmailCurrentPasswordPlaceholder}
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmittingEmail}>
                {isSubmittingEmail ? m.actionSaving : m.changeEmailAction}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.changePasswordTitle}</CardTitle>
          <CardDescription>{m.changePasswordDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onChangePassword}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{m.changePasswordCurrentLabel}</span>
              <Input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.currentTarget.value)}
                placeholder={m.changePasswordCurrentPlaceholder}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{m.changePasswordNewLabel}</span>
              <Input
                type="password"
                autoComplete="new-password"
                value={nextPassword}
                onChange={(event) => setNextPassword(event.currentTarget.value)}
                placeholder={m.changePasswordNewPlaceholder}
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmittingPassword}>
                {isSubmittingPassword ? m.actionSaving : common.changePassword}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">{m.deleteTitle}</CardTitle>
          <CardDescription>{m.deleteDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onDeleteAccount}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{m.deleteConfirmTextLabel}</span>
              <Input
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.currentTarget.value)}
                placeholder={m.deleteConfirmTextPlaceholder}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">{m.deletePasswordLabel}</span>
              <Input
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.currentTarget.value)}
                placeholder={m.deletePasswordPlaceholder}
              />
            </label>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" variant="destructive" disabled={isSubmittingDelete}>
                {isSubmittingDelete ? m.actionDeleting : m.deleteAction}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
