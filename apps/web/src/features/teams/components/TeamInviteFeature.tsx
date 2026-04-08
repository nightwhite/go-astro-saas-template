import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/state/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@repo/ui";
import { acceptTeamInvite } from "@/features/teams/api/teams";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";

interface TeamInviteFeatureProps {
  initialToken: string;
  locale?: Locale;
}

type InviteState = "idle" | "processing" | "success" | "error" | "invalid";

export function TeamInviteFeature({ initialToken, locale }: TeamInviteFeatureProps) {
  const resolvedLocale = locale ?? resolveClientLocale();
  const m = t(resolvedLocale).dashboard;
  const session = useSessionStore((state) => state.session);
  const isLoading = useSessionStore((state) => state.isLoading);

  const [token, setToken] = useState(initialToken.trim());
  const [state, setState] = useState<InviteState>(initialToken.trim() ? "processing" : "invalid");
  const [message, setMessage] = useState("");
  const [teamID, setTeamID] = useState("");
  const hasAttemptedAuto = useRef(false);

  async function handleAcceptInvite(inviteToken: string) {
    const normalized = inviteToken.trim();
    if (!normalized) {
      setState("invalid");
      setMessage(m.teamInvite.inviteTokenRequired);
      return;
    }
    setState("processing");
    setMessage("");
    setTeamID("");
    try {
      const response = await acceptTeamInvite(normalized);
      const nextTeamID = response.data.team_id || "";
      setTeamID(nextTeamID);
      setState("success");
      setMessage(m.teamInvite.joinedSuccess);
    } catch (error) {
      const text = error instanceof Error ? error.message : m.teamInvite.failedAccept;
      setState("error");
      setMessage(text);
    }
  }

  useEffect(() => {
    const normalized = initialToken.trim();
    setToken(normalized);
    setState(normalized ? "processing" : "invalid");
    hasAttemptedAuto.current = false;
  }, [initialToken]);

  useEffect(() => {
    if (hasAttemptedAuto.current) return;
    if (!token) return;
    if (isLoading) return;
    hasAttemptedAuto.current = true;

    if (!session) {
      setState("idle");
      return;
    }
    void handleAcceptInvite(token);
  }, [isLoading, session, token]);

  if (!token) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{m.teamInvite.invalidLinkTitle}</CardTitle>
            <CardDescription>{m.teamInvite.invalidLinkDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" asChild>
              <a href="/dashboard">{m.teamInvite.goDashboard}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || state === "processing") {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{m.teamInvite.acceptingTitle}</CardTitle>
            <CardDescription>{m.teamInvite.acceptingDescription}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!session && state === "idle") {
    const redirectURL = `/team-invite?token=${encodeURIComponent(token)}`;
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{m.teamInvite.signInRequiredTitle}</CardTitle>
            <CardDescription>{m.teamInvite.signInRequiredDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <a href={`/sign-in?redirect=${encodeURIComponent(redirectURL)}`}>{m.teamInvite.signInContinue}</a>
            </Button>
            <Button className="w-full" variant="secondary" asChild>
              <a href="/sign-up">{m.teamInvite.createAccount}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === "success") {
    const target = teamID ? `/dashboard/teams/${encodeURIComponent(teamID)}` : "/dashboard/teams";
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{m.teamInvite.successTitle}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <a href={target}>{m.teamInvite.openTeamDashboard}</a>
            </Button>
            <Button className="w-full" variant="secondary" asChild>
              <a href="/dashboard">{m.teamInvite.goToDashboard}</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{m.teamInvite.errorTitle}</CardTitle>
          <CardDescription>{message || m.teamInvite.errorDefault}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {message.toLowerCase().includes("exists") || message.toLowerCase().includes("already")
              ? m.teamInvite.alreadyMember
              : m.teamInvite.maybeExpired}
          </p>
          <Input
            label={m.teamInvite.inviteToken}
            value={token}
            onChange={(event) => setToken(event.currentTarget.value)}
            placeholder={m.teamInvite.inviteTokenPlaceholder}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => void handleAcceptInvite(token)}>{m.teamInvite.tryAgain}</Button>
            <Button variant="secondary" asChild>
              <a href="/dashboard">{m.teamInvite.goToDashboard}</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
