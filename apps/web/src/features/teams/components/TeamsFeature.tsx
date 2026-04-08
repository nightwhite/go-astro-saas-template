import { useEffect, useMemo, useState } from "react";
import { AdminPageLayout, Button, EmptyState, Input, SurfacePanel, Toast } from "@repo/ui";
import { acceptTeamInvite, createTeam, fetchPendingInvites, fetchTeams, inviteTeamMember, type TeamInviteRecord, type TeamRecord } from "@/features/teams/api/teams";
import { t, type Locale } from "@/lib/i18n";
import { Link } from "wouter";

interface TeamsFeatureProps {
  initialTeams: TeamRecord[];
  mode?: "index" | "create";
  locale: Locale;
}

export function TeamsFeature({ initialTeams, mode = "index", locale }: TeamsFeatureProps) {
  const m = t(locale).dashboard;
  const [teams, setTeams] = useState<TeamRecord[]>(initialTeams);
  const [name, setName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteTeamID, setInviteTeamID] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");
  const [pendingInvites, setPendingInvites] = useState<TeamInviteRecord[]>([]);

  useEffect(() => {
    if (!initialTeams.length) {
      void fetchTeams().then(setTeams).catch(() => {
        setMessage(m.teams.failedLoadTeams);
        setTone("warning");
      });
    }
    void fetchPendingInvites().then(setPendingInvites).catch(() => {
      // keep page usable even if pending invites fails
    });
  }, [initialTeams.length]);

  const currentTeamOptions = useMemo(() => teams.map((item) => ({ id: item.id, name: item.name })), [teams]);

  async function handleCreateTeam() {
    if (!name.trim()) return;
    try {
      const response = await createTeam(name.trim());
      setTeams((current) => [response.data.team, ...current]);
      setName("");
      setInviteTeamID(response.data.team.id);
      setMessage(m.teams.teamCreated);
      setTone("success");
    } catch {
      setMessage(m.teams.failedCreateTeam);
      setTone("warning");
    }
  }

  async function handleInvite() {
    if (!inviteTeamID || !inviteEmail.trim()) return;
    try {
      const response = await inviteTeamMember(inviteTeamID, inviteEmail.trim());
      setMessage(`${m.teams.inviteCreated}: token=${response.data.invite.token}`);
      setTone("success");
      setInviteEmail("");
    } catch {
      setMessage(m.teams.failedCreateInvite);
      setTone("warning");
    }
  }

  async function handleAcceptInvite() {
    if (!inviteToken.trim()) return;
    try {
      await acceptTeamInvite(inviteToken.trim());
      setMessage(m.teams.inviteAccepted);
      setTone("success");
      setInviteToken("");
      const latest = await fetchTeams();
      setTeams(latest);
    } catch {
      setMessage(m.teams.failedAcceptInvite);
      setTone("warning");
    }
  }

  if (mode === "create") {
    return (
      <AdminPageLayout section={m.teams.section} title={m.teams.createPanelTitle} description={m.teams.createPanelDescription}>
        <SurfacePanel title={m.teams.createPanelTitle} description={m.teams.createPanelDescription}>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input label={m.teams.teamName} value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder={m.teams.teamNamePlaceholder} />
            <div className="flex items-end">
              <Button onClick={() => void handleCreateTeam()}>{m.teams.createTeamAction}</Button>
            </div>
          </div>
        </SurfacePanel>
        {message ? <Toast title={m.teams.feedbackTitle} description={message} tone={tone} /> : null}
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      section={m.teams.section}
      title={m.teams.title}
      description={m.teams.description}
    >
      {pendingInvites.length ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/20">
          <h3 className="text-base font-semibold text-foreground">{m.teams.pendingInvitesTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{m.teams.pendingInvitesDescription}</p>
          <div className="mt-3 space-y-2">
            {pendingInvites.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.email}</p>
                  <p className="text-xs text-muted-foreground">{m.teams.colTeamID}: {item.team_id}</p>
                </div>
                <a className="text-sm text-primary underline-offset-2 hover:underline" href={`/team-invite?token=${encodeURIComponent(item.token)}`}>
                  {m.teams.accept}
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {teams.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teams.map((item) => (
            <a key={item.id} href={`/dashboard/teams/${encodeURIComponent(item.slug || item.id)}`} className="block">
              <div className="h-full rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.teams.colSlug}: {item.slug}</p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{m.teams.open}</span>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{m.teams.colOwner}: {item.owner_user_id}</p>
              </div>
            </a>
          ))}
          <Link href="/teams/create" className="block">
            <div className="flex h-full min-h-[170px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-foreground">
              + {m.teams.createTeamAction}
            </div>
          </Link>
        </div>
      ) : (
        <EmptyState title={m.teams.noTeamsTitle} description={m.teams.noTeamsDescription} />
      )}

      <SurfacePanel title={m.teams.invitesPanelTitle} description={m.teams.invitesPanelDescription}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm font-medium text-foreground">{m.teams.createInviteTitle}</p>
            <label className="space-y-1 text-sm text-muted-foreground">
              {m.teams.team}
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={inviteTeamID}
                onChange={(event) => setInviteTeamID(event.currentTarget.value)}
              >
                <option value="">{m.teams.selectTeam}</option>
                {currentTeamOptions.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <Input label={m.teams.inviteEmail} value={inviteEmail} onChange={(event) => setInviteEmail(event.currentTarget.value)} placeholder={m.teams.inviteEmailPlaceholder} />
            <Button onClick={() => void handleInvite()}>{m.teams.createInviteAction}</Button>
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm font-medium text-foreground">{m.teams.acceptInviteTitle}</p>
            <Input label={m.teams.inviteToken} value={inviteToken} onChange={(event) => setInviteToken(event.currentTarget.value)} placeholder={m.teams.inviteTokenPlaceholder} />
            <Button variant="secondary" onClick={() => void handleAcceptInvite()}>
              {m.teams.acceptInviteAction}
            </Button>
          </div>
        </div>
      </SurfacePanel>

      {message ? <Toast title={m.teams.feedbackTitle} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
