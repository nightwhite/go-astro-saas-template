import { ThemeSwitcher } from "@/components/navigation/ThemeSwitcher";
import { LocaleSwitcher } from "@/components/navigation/LocaleSwitcher";
import { t } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";
import { adminT } from "@/lib/admin-i18n";

interface AdminTopbarProps {
  breadcrumb: string[];
}

export function AdminTopbar({ breadcrumb }: AdminTopbarProps) {
  const locale = resolveClientLocale();
  const m = t(locale);
  const am = adminT(locale);
  const breadcrumbItems = breadcrumb.length ? breadcrumb : [m.common.admin];
  const fallbackMap: Record<string, string> = {
    Admin: m.common.admin,
    Dashboard: am.sidebar.items.Dashboard,
    Blog: am.sidebar.items.Blog,
    SEO: am.sidebar.items.SEO,
    Users: am.sidebar.items.Users,
    Roles: am.sidebar.items.Roles,
    Files: am.sidebar.items.Files,
    Jobs: am.sidebar.items.Jobs,
    Audit: am.sidebar.items.Audit,
    Observability: am.sidebar.items.Observability,
    Settings: m.common.settings,
    Site: am.sidebar.items.Site,
    Auth: am.sidebar.items.Auth,
    SMTP: am.sidebar.items.SMTP,
    "Email Templates": am.sidebar.items["Email Templates"],
    Storage: am.sidebar.items.Storage,
    Profile: am.sidebar.items.Profile,
    Create: am.blog.createShort,
    Detail: am.common.details,
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumbItems.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-border">/</span> : null}
            <span className={index === breadcrumbItems.length - 1 ? "font-medium text-foreground" : ""}>
              {fallbackMap[item] ?? item}
            </span>
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <ThemeSwitcher compact />
        <LocaleSwitcher />
        <a
          href="/dashboard"
          className="hidden text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground sm:inline-flex"
        >
          {m.common.backToDashboard}
        </a>
        <a
          href="/dashboard/account"
          className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          {m.dashboard.accountPage.title}
        </a>
      </div>
    </header>
  );
}
