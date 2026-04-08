import { useEffect, useMemo, useState } from "react";
import { Link, Route, Router, Switch } from "wouter";
import { t, type Locale } from "@/lib/i18n";
import { AppSidebar } from "@/components/client/AppSidebar";
import { PageHeader } from "@/components/page-header";
import { useSessionStore } from "@/state/session";
import { apiGet } from "@/lib/api/client";
import type { AdminOverview } from "@/features/dashboard/api/admin";
import { TeamsFeature } from "@/features/teams/components/TeamsFeature";
import { TeamDetailFeature } from "@/features/teams/components/TeamDetailFeature";
import { BillingFeature } from "@/features/billing/components/BillingFeature";
import { MarketplaceFeature } from "@/features/marketplace/components/MarketplaceFeature";
import { AccountFeature } from "@/features/account/components/AccountFeature";
import { SettingsNav } from "@/features/settings/components/SettingsNav";
import { ProfileSettingsForm } from "@/features/settings/components/ProfileSettingsForm";
import { PasskeysFeature } from "@/features/settings/components/PasskeysFeature";
import { SessionsFeature } from "@/features/profile/components/SessionsFeature";
import type { SessionRecord } from "@/lib/api/admin";
import {
  fetchTeamDetail,
  fetchTeams,
  type TeamDetailRecord,
  type TeamRecord,
} from "@/features/teams/api/teams";
import {
  fetchBillingSummary,
  fetchBillingTransactions,
  fetchMarketplaceCatalog,
  type BillingSummary,
  type BillingTransaction,
  type MarketplaceItem,
} from "@/features/billing/api/billing";
import { fetchCurrentUserPasskeys, type PasskeyRecord } from "@/features/settings/api/security";
import { fetchCurrentSessions } from "@/lib/api/admin";

type Props = {
  locale: Locale;
  initialPath: string;
  initialSearch: string;
};

type HomeStats = {
  users: number;
  files: number;
  jobs: number;
};

function normalizeDashboardPath(pathname: string): string {
  if (!pathname.startsWith("/dashboard")) return pathname;
  const next = pathname.slice("/dashboard".length);
  if (!next) return "/";
  return next.startsWith("/") ? next : `/${next}`;
}

function DashboardOverviewPage(props: { locale: Locale }) {
  const m = t(props.locale);
  const dm = m.dashboard;
  const session = useSessionStore((state) => state.session);
  const [stats, setStats] = useState<HomeStats>({ users: 0, files: 0, jobs: 0 });

  useEffect(() => {
    void apiGet<{ overview: AdminOverview }>("/api/v1/admin/overview")
      .then((response) => {
        setStats({
          users: response.data.overview.stats.user_count,
          files: response.data.overview.stats.file_count,
          jobs: response.data.overview.stats.job_count,
        });
      })
      .catch(() => {
        setStats({ users: 0, files: 0, jobs: 0 });
      });
  }, []);

  const profile = session?.user ?? null;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{dm.dashboardHome.users}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{stats.users}</p>
          </div>
          <div className="aspect-video rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{dm.dashboardHome.files}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{stats.files}</p>
          </div>
          <div className="aspect-video rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{dm.dashboardHome.jobs}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{stats.jobs}</p>
          </div>
        </div>

        {profile ? (
          <div className="min-h-[56vh] rounded-xl bg-muted/50 p-6 md:min-h-min">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{dm.dashboardHome.workspace}</p>
            <p className="mt-3 text-lg font-semibold text-foreground">{profile.display_name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {dm.dashboardHome.roleLabel}={profile.role} · {dm.dashboardHome.tenantLabel}={profile.tenant_id}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                href="/teams"
              >
                {m.common.teams}
              </Link>
              <Link
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                href="/billing"
              >
                {m.common.billing}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
            {dm.dashboardHome.noSessionStart} <a href="/sign-in" className="underline-offset-2 hover:underline">{m.common.signIn}</a> {dm.dashboardHome.noSessionEnd}
          </div>
        )}
      </section>
    </div>
  );
}

function TeamsIndexPage(props: { locale: Locale }) {
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  useEffect(() => {
    void fetchTeams().then(setTeams).catch(() => setTeams([]));
  }, []);
  return <TeamsFeature initialTeams={teams} locale={props.locale} />;
}

function TeamCreatePage(props: { locale: Locale }) {
  const [teams, setTeams] = useState<TeamRecord[]>([]);
  useEffect(() => {
    void fetchTeams().then(setTeams).catch(() => setTeams([]));
  }, []);
  return <TeamsFeature initialTeams={teams} mode="create" locale={props.locale} />;
}

function TeamDetailPage(props: { teamID: string; locale: Locale }) {
  const [detail, setDetail] = useState<TeamDetailRecord | null>(null);
  useEffect(() => {
    void fetchTeamDetail(props.teamID).then(setDetail).catch(() => setDetail(null));
  }, [props.teamID]);
  return <TeamDetailFeature detail={detail} teamID={props.teamID} locale={props.locale} />;
}

function BillingPage(props: { locale: Locale }) {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  useEffect(() => {
    void Promise.all([fetchBillingSummary(), fetchBillingTransactions(20)])
      .then(([nextSummary, nextTransactions]) => {
        setSummary(nextSummary);
        setTransactions(nextTransactions);
      })
      .catch(() => {
        setSummary(null);
        setTransactions([]);
      });
  }, []);
  return <BillingFeature initialSummary={summary} initialTransactions={transactions} locale={props.locale} />;
}

function MarketplacePage(props: { locale: Locale }) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  useEffect(() => {
    void fetchMarketplaceCatalog().then(setItems).catch(() => setItems([]));
  }, []);
  return <MarketplaceFeature initialItems={items} locale={props.locale} />;
}

function AccountPage(props: { locale: Locale }) {
  const dm = t(props.locale).dashboard.accountPage;
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{dm.section}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{dm.title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{dm.description}</p>
      </div>
      <AccountFeature locale={props.locale} />
    </section>
  );
}

function SettingsProfilePage(props: { locale: Locale }) {
  return (
    <div className="space-y-6">
      <SettingsNav locale={props.locale} />
      <ProfileSettingsForm locale={props.locale} />
    </div>
  );
}

function SettingsSecurityPage(props: { locale: Locale }) {
  const dm = t(props.locale).dashboard;
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  useEffect(() => {
    void fetchCurrentUserPasskeys().then(setPasskeys).catch(() => setPasskeys([]));
  }, []);

  return (
    <div className="space-y-6">
      <SettingsNav locale={props.locale} />
      <section className="rounded-lg border border-border bg-card p-8 text-card-foreground">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{dm.settingsSecurity.section}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{dm.settingsSecurity.title}</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{dm.settingsSecurity.description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <a className="rounded-lg border border-border bg-muted/30 p-5 transition hover:bg-accent hover:text-accent-foreground" href="/forgot-password">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{dm.settingsSecurity.password}</p>
            <p className="mt-3 text-lg font-semibold">{dm.settingsSecurity.passwordTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{dm.settingsSecurity.passwordDescription}</p>
          </a>
          <Link className="rounded-lg border border-border bg-muted/30 p-5 transition hover:bg-accent hover:text-accent-foreground" href="/dashboard/settings/sessions">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{dm.settingsSecurity.sessions}</p>
            <p className="mt-3 text-lg font-semibold">{dm.settingsSecurity.sessionsTitle}</p>
            <p className="mt-2 text-sm text-muted-foreground">{dm.settingsSecurity.sessionsDescription}</p>
          </Link>
        </div>
      </section>
      <PasskeysFeature initialPasskeys={passkeys} locale={props.locale} />
    </div>
  );
}

function SettingsSessionsPage(props: { locale: Locale }) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  useEffect(() => {
    void fetchCurrentSessions("").then(setSessions).catch(() => setSessions([]));
  }, []);

  return (
    <div className="space-y-6">
      <SettingsNav locale={props.locale} />
      <SessionsFeature initialSessions={sessions} locale={props.locale} />
    </div>
  );
}

function NotFoundPage(props: { locale: Locale }) {
  const m = t(props.locale);
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6">
      <p className="text-lg font-semibold text-foreground">404</p>
      <p className="mt-2 text-sm text-muted-foreground">{m.dashboard.notFoundDescription}</p>
      <Link href="/" className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-2 hover:underline">
        {m.common.dashboard}
      </Link>
    </div>
  );
}

function getCurrentMeta(locale: Locale, path: string): { currentPath: string; breadcrumb: Array<{ href: string; label: string }> } {
  const m = t(locale);
  const dm = m.dashboard;

  if (path === "/") {
    return { currentPath: "/dashboard", breadcrumb: [{ href: "/dashboard", label: m.common.dashboard }] };
  }
  if (path === "/teams") {
    return {
      currentPath: "/dashboard/teams",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/teams", label: m.common.teams },
      ],
    };
  }
  if (path === "/teams/create") {
    return {
      currentPath: "/dashboard/teams/create",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/teams", label: m.common.teams },
        { href: "/dashboard/teams/create", label: dm.teamsPage.create },
      ],
    };
  }
  if (path.startsWith("/teams/")) {
    return {
      currentPath: "/dashboard/teams",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/teams", label: m.common.teams },
        { href: "#", label: dm.teamsPage.detail },
      ],
    };
  }
  if (path === "/billing") {
    return {
      currentPath: "/dashboard/billing",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/billing", label: m.common.billing },
      ],
    };
  }
  if (path === "/marketplace") {
    return {
      currentPath: "/dashboard/marketplace",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/marketplace", label: m.common.marketplace },
      ],
    };
  }
  if (path === "/settings") {
    return {
      currentPath: "/dashboard/settings",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/settings", label: m.common.settings },
      ],
    };
  }
  if (path === "/settings/security") {
    return {
      currentPath: "/dashboard/settings/security",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/settings", label: m.common.settings },
        { href: "/dashboard/settings/security", label: m.common.security },
      ],
    };
  }
  if (path === "/settings/sessions") {
    return {
      currentPath: "/dashboard/settings/sessions",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/settings", label: m.common.settings },
        { href: "/dashboard/settings/sessions", label: m.common.sessions },
      ],
    };
  }
  if (path === "/account") {
    return {
      currentPath: "/dashboard/account",
      breadcrumb: [
        { href: "/dashboard", label: m.common.dashboard },
        { href: "/dashboard/account", label: dm.accountPage.title },
      ],
    };
  }

  return {
    currentPath: "/dashboard",
    breadcrumb: [{ href: "/dashboard", label: m.common.dashboard }],
  };
}

export default function DashboardApp(props: Props) {
  const [path, setPath] = useState(() => normalizeDashboardPath(props.initialPath));

  useEffect(() => {
    const update = () => {
      setPath(normalizeDashboardPath(window.location.pathname));
    };
    update();
    window.addEventListener("popstate", update);
    document.addEventListener("astro:after-swap", update as EventListener);
    document.addEventListener("astro:page-load", update as EventListener);
    return () => {
      window.removeEventListener("popstate", update);
      document.removeEventListener("astro:after-swap", update as EventListener);
      document.removeEventListener("astro:page-load", update as EventListener);
    };
  }, []);

  const meta = useMemo(() => getCurrentMeta(props.locale, path), [path, props.locale]);
  const currentLocale = props.locale;

  return (
    <Router
      base="/dashboard"
      ssrPath={props.initialPath}
      ssrSearch={props.initialSearch}
    >
      <div className="min-h-svh bg-background text-foreground">
        <div className="flex min-h-svh">
          <AppSidebar currentPath={meta.currentPath} locale={currentLocale} />
          <div className="flex min-w-0 flex-1 flex-col">
            <PageHeader items={meta.breadcrumb} currentPath={meta.currentPath} locale={currentLocale} />
            <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8">
              <Switch>
                <Route path="/">
                  <DashboardOverviewPage locale={currentLocale} />
                </Route>
                <Route path="/teams">
                  <TeamsIndexPage locale={currentLocale} />
                </Route>
                <Route path="/teams/create">
                  <TeamCreatePage locale={currentLocale} />
                </Route>
                <Route path="/teams/:teamID">
                  {(params) => <TeamDetailPage teamID={params.teamID} locale={currentLocale} />}
                </Route>
                <Route path="/billing">
                  <BillingPage locale={currentLocale} />
                </Route>
                <Route path="/marketplace">
                  <MarketplacePage locale={currentLocale} />
                </Route>
                <Route path="/account">
                  <AccountPage locale={currentLocale} />
                </Route>
                <Route path="/settings">
                  <SettingsProfilePage locale={currentLocale} />
                </Route>
                <Route path="/settings/security">
                  <SettingsSecurityPage locale={currentLocale} />
                </Route>
                <Route path="/settings/sessions">
                  <SettingsSessionsPage locale={currentLocale} />
                </Route>
                <Route>
                  <NotFoundPage locale={currentLocale} />
                </Route>
              </Switch>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}
