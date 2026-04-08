import { AdminPageLayout, Badge, EmptyState, StatCard, SurfacePanel } from "@repo/ui";
import type { AdminOverview } from "../api/admin";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";
import { Link } from "wouter";

interface DashboardOverviewFeatureProps {
  overview: AdminOverview | null;
}

export function DashboardOverviewFeature({ overview }: DashboardOverviewFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  if (!overview) {
    return (
      <AdminPageLayout section={m.dashboard.section} title={m.dashboard.title} description={m.dashboard.description}>
        <EmptyState title={m.dashboard.noOverviewTitle} description={m.dashboard.noOverviewDescription} />
      </AdminPageLayout>
    );
  }

  const cards = [
    { label: m.dashboard.cards.users, value: overview.stats.user_count, hint: m.dashboard.cards.usersHint },
    { label: m.dashboard.cards.files, value: overview.stats.file_count, hint: m.dashboard.cards.filesHint },
    { label: m.dashboard.cards.jobs, value: overview.stats.job_count, hint: m.dashboard.cards.jobsHint },
    { label: m.dashboard.cards.auditLogs, value: overview.stats.audit_log_count, hint: m.dashboard.cards.auditHint },
  ];

  return (
    <AdminPageLayout
      section={m.dashboard.section}
      title={m.dashboard.title}
      description={m.dashboard.description}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <div key={item.label} className="space-y-2">
            <StatCard label={item.label} value={String(item.value)} />
            <p className="text-xs text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SurfacePanel title={m.dashboard.recentUsersTitle} description={m.dashboard.recentUsersDescription}>
          {overview.users.length ? (
            <div className="space-y-3">
              {overview.users.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border border-border bg-card p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{item.display_name}</p>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="brand">{item.role}</Badge>
                    <Badge tone={item.status === "active" ? "success" : "warning"}>{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={m.dashboard.noUsersTitle} description={m.dashboard.noUsersDescription} />
          )}
        </SurfacePanel>

        <SurfacePanel title={m.dashboard.quickActionsTitle} description={m.dashboard.quickActionsDescription}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link className="rounded-md border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground" href="/users">
              {m.dashboard.actions.openUsers}
            </Link>
            <Link className="rounded-md border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground" href="/roles">
              {m.dashboard.actions.manageRoles}
            </Link>
            <Link className="rounded-md border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground" href="/jobs">
              {m.dashboard.actions.queueJobs}
            </Link>
            <Link className="rounded-md border border-input bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground" href="/settings/smtp">
              {m.dashboard.actions.smtpSettings}
            </Link>
          </div>
        </SurfacePanel>
      </div>
    </AdminPageLayout>
  );
}
