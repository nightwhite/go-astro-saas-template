import { visibleAdminNavigation } from "@/features/admin/runtime/metadata";
import { Blocks, ChartColumn, Cog, Files, Logs, NotebookPen, Shield, Users } from "lucide-react";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";
import { Link } from "wouter";

interface AdminSidebarProps {
  currentPath: string;
  permissions: string[];
  tenantID: string;
  currentRole: string;
}

export function AdminSidebar({ currentPath, permissions, tenantID, currentRole }: AdminSidebarProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const visibleItems = visibleAdminNavigation(permissions);
  const currentMatch = currentPath === "/admin" ? "/admin" : currentPath;
  const iconByLabel: Record<string, any> = {
    Dashboard: <ChartColumn className="size-4" />,
    Blog: <NotebookPen className="size-4" />,
    Announcements: <NotebookPen className="size-4" />,
    公告: <NotebookPen className="size-4" />,
    お知らせ: <NotebookPen className="size-4" />,
    博客: <NotebookPen className="size-4" />,
    ブログ: <NotebookPen className="size-4" />,
    SEO: <ChartColumn className="size-4" />,
    Users: <Users className="size-4" />,
    Roles: <Shield className="size-4" />,
    Files: <Files className="size-4" />,
    Jobs: <Blocks className="size-4" />,
    Audit: <Logs className="size-4" />,
    Observability: <ChartColumn className="size-4" />,
    Site: <Cog className="size-4" />,
    Auth: <Cog className="size-4" />,
    SMTP: <Cog className="size-4" />,
    "Email Templates": <Cog className="size-4" />,
    Storage: <Cog className="size-4" />,
    Profile: <Users className="size-4" />,
  };

  return (
    <aside className="hidden h-svh w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="p-2">
        <Link
          href="/"
          className="flex h-12 items-center gap-2 rounded-md px-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          data-active="true"
        >
          <Shield className="size-5" />
          <span className="text-base font-bold">{m.sidebar.adminPanel}</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pb-1">
          <p className="px-2 text-xs font-medium uppercase tracking-[0.12em] text-sidebar-foreground/70">{m.sidebar.platform}</p>
        </div>
        <nav className="space-y-1 px-2 pb-4">
          {visibleItems.map((item) => {
            const localizedLabel = m.sidebar.items[item.label as keyof typeof m.sidebar.items] ?? item.label;
            return (
            <Link
              key={item.href}
              href={item.href.replace("/admin", "") || "/"}
              className={`flex h-8 items-center gap-2 overflow-hidden rounded-md px-2 text-sm transition ${
                currentMatch === item.match
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              title={localizedLabel}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center text-sidebar-foreground/70">
                {iconByLabel[item.label] ?? <span className="text-[10px] font-semibold">{item.label.slice(0, 1)}</span>}
              </span>
              <span className="truncate">{localizedLabel}</span>
            </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-sidebar-border p-2">
        <a href="/dashboard/account" className="flex h-14 items-center gap-2 rounded-md px-2 hover:bg-sidebar-accent">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-background text-xs font-semibold text-foreground">
            {currentRole.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{m.sidebar.rolePrefix}: {currentRole}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">{tenantID}</p>
          </div>
        </a>
      </div>
    </aside>
  );
}
