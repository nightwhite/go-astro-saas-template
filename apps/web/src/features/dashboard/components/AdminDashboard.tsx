import { Button, EmptyState, StatCard, SurfacePanel } from "@repo/ui";
import type { AdminOverview } from "../api/admin";
import { useState } from "react";
import { createDemoFile as createDemoFileRequest, saveDemoSMTPSettings } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface AdminDashboardProps {
  overview: AdminOverview | null;
}

export function AdminDashboard({ overview }: AdminDashboardProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const [message, setMessage] = useState<string>("");
  const baseURL = getAPIBaseURL();

  async function createDemoFile() {
    try {
      await createDemoFileRequest(baseURL);
      setMessage(m.dashboardLegacy.createDemoFileSuccess);
    } catch {
      setMessage(m.dashboardLegacy.createDemoFileFailed);
    }
  }

  async function saveSMTPSettings() {
    try {
      await saveDemoSMTPSettings(baseURL);
      setMessage(m.dashboardLegacy.saveSMTPDemoSuccess);
    } catch {
      setMessage(m.dashboardLegacy.saveSMTPDemoFailed);
    }
  }

  const stats = overview
    ? [
        { label: m.dashboardLegacy.cards.modules, value: String(overview.modules.length), tone: "brand" as const },
        { label: m.dashboardLegacy.cards.users, value: String(overview.stats.user_count), tone: "success" as const },
        { label: m.dashboardLegacy.cards.files, value: String(overview.stats.file_count), tone: "warning" as const },
      ]
    : [
        { label: m.dashboardLegacy.cards.api, value: m.dashboardLegacy.offline, tone: "warning" as const },
        { label: m.dashboardLegacy.cards.users, value: "-", tone: "brand" as const },
        { label: m.dashboardLegacy.cards.files, value: "-", tone: "brand" as const },
      ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfacePanel
          title={m.dashboardLegacy.recentActivityTitle}
          description={m.dashboardLegacy.recentActivityDescription}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-card-foreground">{m.dashboardLegacy.recentUsersTitle}</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(overview?.users ?? []).slice(0, 4).map((user) => (
                  <div key={user.id} className="rounded-md bg-muted/40 px-3 py-2">
                    {user.display_name} · {user.role}
                  </div>
                ))}
                {!overview?.users?.length ? <p>{m.dashboardLegacy.noUserData}</p> : null}
              </div>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-sm font-medium text-card-foreground">{m.dashboardLegacy.recentFilesTitle}</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(overview?.files ?? []).slice(0, 4).map((file) => (
                  <div key={file.id} className="rounded-md bg-muted/40 px-3 py-2">
                    {file.file_name} · {Math.round(file.size_bytes / 1024)} KB
                  </div>
                ))}
                {!overview?.files?.length ? <p>{m.dashboardLegacy.noFileData}</p> : null}
              </div>
            </div>
          </div>
        </SurfacePanel>

        <SurfacePanel
          title={m.dashboardLegacy.systemTitle}
          description={m.dashboardLegacy.systemDescription}
        >
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-md bg-muted/40 px-4 py-3">
              {m.dashboardLegacy.environmentLabel}: {overview?.env ?? m.dashboardLegacy.unknown}
            </div>
            <div className="rounded-md bg-muted/40 px-4 py-3">
              {m.dashboardLegacy.appLabel}: {overview?.app_name ?? "go-astro-template"}
            </div>
            <div className="rounded-md bg-muted/40 px-4 py-3">
              {m.dashboardLegacy.modulesLabel}: {overview?.modules?.join(" / ") ?? m.dashboardLegacy.unavailable}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => void saveSMTPSettings()}>
                {m.dashboardLegacy.saveSMTPDemo}
              </Button>
              <Button variant="secondary" onClick={() => void createDemoFile()}>
                {m.dashboardLegacy.createDemoFile}
              </Button>
            </div>
            {message ? <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">{message}</div> : null}
          </div>
        </SurfacePanel>
      </div>

      {!overview ? <EmptyState title={m.dashboardLegacy.unavailableTitle} description={m.dashboardLegacy.unavailableDescription} /> : null}
    </>
  );
}
