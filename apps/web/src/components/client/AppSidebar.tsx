import { useMemo, useState } from "react";
import { Activity, Bell, CreditCard, LayoutDashboard, LogOut, Moon, Settings, Sun, UserCircle, Users } from "lucide-react";
import { selectTeam } from "@/features/teams/api/teams";
import { apiPost } from "@/lib/api/client";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useSessionStore } from "@/state/session";
import { useTheme } from "@/lib/use-theme";

interface AppSidebarProps {
  currentPath: string;
  locale: Locale;
}

export function AppSidebar({ currentPath, locale }: AppSidebarProps) {
  const allMessages = t(locale);
  const m = allMessages.dashboard;
  const session = useSessionStore((state) => state.session);
  const setSelectedTeam = useSessionStore((state) => state.setSelectedTeam);
  const clearSelectedTeam = useSessionStore((state) => state.clearSelectedTeam);
  const clearSession = useSessionStore((state) => state.clearSession);
  const { theme, resolvedTheme, systemTheme, setTheme } = useTheme();
  const [isSwitchingTeam, setIsSwitchingTeam] = useState(false);
  const teams = session?.teams ?? [];
  const selectedTeamID = session?.selectedTeam || teams[0]?.id || "";

  const activeTeam = useMemo(() => {
    if (!teams.length) return null;
    return teams.find((item) => item.id === selectedTeamID) ?? teams[0];
  }, [selectedTeamID, teams]);

  async function onChangeTeam(teamID: string) {
    if (!teamID || teamID === selectedTeamID) return;
    setIsSwitchingTeam(true);
    try {
      await selectTeam(teamID);
      setSelectedTeam(teamID);
      document.cookie = `go_astro_selected_team=${encodeURIComponent(teamID)}; Path=/; SameSite=Lax`;
    } catch {
      // keep sidebar navigable if switch API fails
    } finally {
      setIsSwitchingTeam(false);
    }
  }

  async function onSignOut() {
    try {
      await apiPost<{ logged_out: boolean }>("/api/v1/auth/logout", {});
    } catch {
      // Ignore network error and clear local state anyway.
    } finally {
      clearSelectedTeam();
      clearSession();
      document.cookie = "go_astro_selected_team=; Path=/; Max-Age=0; SameSite=Lax";
      window.location.href = "/sign-in";
    }
  }

  const nav = [
    { href: "/dashboard", label: m.sidebar.dashboard, icon: LayoutDashboard, spa: true },
    { href: "/dashboard/teams", label: m.sidebar.teams, icon: Users, spa: true },
    { href: "/dashboard/billing", label: m.sidebar.billing, icon: CreditCard, spa: true },
    { href: "/dashboard/marketplace", label: m.sidebar.marketplace, icon: Activity, spa: true },
    { href: "/dashboard/settings", label: m.sidebar.settings, icon: Settings, spa: true },
    { href: "/dashboard/account", label: m.sidebar.account, icon: UserCircle, spa: true },
  ];
  const currentTheme = theme === "system" ? (systemTheme ?? resolvedTheme ?? "system") : (theme ?? resolvedTheme ?? "system");

  return (
    <aside className="hidden h-svh w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="space-y-2 border-b border-sidebar-border p-2">
        <Link
          href="/"
          className="flex h-10 items-center gap-2 rounded-md px-2 text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LayoutDashboard className="size-4" />
          <span className="text-sm font-semibold">{m.sidebar.workspace}</span>
        </Link>
        {activeTeam ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={isSwitchingTeam}
                className="flex h-11 w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/45 px-2 text-sm text-sidebar-foreground shadow-sm hover:bg-sidebar-accent disabled:opacity-60"
              >
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">{activeTeam.name}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{activeTeam.role_name || activeTeam.role || m.sidebar.teams}</span>
                </span>
                <span className="text-xs text-sidebar-foreground/70">{isSwitchingTeam ? "..." : "⌄"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>{m.sidebar.teams}</DropdownMenuLabel>
              {teams.map((team) => (
                <DropdownMenuItem key={team.id} onSelect={() => void onChangeTeam(team.id)} className="flex items-center justify-between">
                  <span className="truncate">{team.name}</span>
                  {team.id === activeTeam.id ? <span className="text-xs">✓</span> : null}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/teams/create">+ {m.teamsPage.createTeam}</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <p className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.12em] text-sidebar-foreground/70">
          {m.sidebar.navigation}
        </p>
        <nav className="space-y-1">
          {nav.map((item) => {
            const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const linkClass = `flex h-9 items-center gap-2 rounded-md px-2.5 text-sm transition ${
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`;
            const routerHref = item.href.startsWith("/dashboard") ? item.href.slice("/dashboard".length) || "/" : item.href;

            if (item.spa) {
              return (
                <Link key={item.href} href={routerHref} className={linkClass}>
                  <Icon className="size-4" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            }
            return (
              <a
                key={item.href}
                href={item.href}
                className={linkClass}
              >
                <Icon className="size-4" />
                <span className="truncate">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-14 w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar-accent/35 px-3 py-2 text-left hover:bg-sidebar-accent"
            >
              <span className="grid flex-1 leading-tight">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {session?.user?.display_name || session?.user?.email || "-"}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">{session?.user?.email || "-"}</span>
              </span>
              <span className="text-xs text-sidebar-foreground/70">⌄</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account" className="cursor-pointer">
                  <UserCircle className="size-4" />
                  {m.accountPage.title}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing" className="cursor-pointer">
                  <CreditCard className="size-4" />
                  {allMessages.common.billing}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Bell className="size-4" />
                {allMessages.common.notifications}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="size-4" />
                {allMessages.nav.theme}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={() => setTheme("system")} className="cursor-pointer">
                    {allMessages.nav.themeSystem}
                    <span className="ml-auto text-xs" aria-hidden="true" style={{ opacity: theme === "system" ? 1 : 0 }}>✓</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTheme("light")} className="cursor-pointer">
                    <Sun className="size-4" />
                    {allMessages.nav.themeLight}
                    <span className="ml-auto text-xs" aria-hidden="true" style={{ opacity: currentTheme === "light" ? 1 : 0 }}>✓</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTheme("dark")} className="cursor-pointer">
                    <Moon className="size-4" />
                    {allMessages.nav.themeDark}
                    <span className="ml-auto text-xs" aria-hidden="true" style={{ opacity: currentTheme === "dark" ? 1 : 0 }}>✓</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void onSignOut()} className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
              <LogOut className="size-4" />
              {allMessages.common.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
