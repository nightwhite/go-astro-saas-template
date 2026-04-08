import { LocaleSwitcher } from "@/components/navigation/LocaleSwitcher";
import { ThemeSwitcher } from "@/components/navigation/ThemeSwitcher";
import { t, type Locale } from "@/lib/i18n";
import { Link } from "wouter";

interface PageHeaderProps {
  items: Array<{ href: string; label: string }>;
  currentPath?: string;
  locale: Locale;
}

function toDashboardRouterHref(href: string): string {
  if (!href.startsWith("/dashboard")) return href;
  const next = href.slice("/dashboard".length);
  return next || "/";
}

export function PageHeader({ items, currentPath = "", locale }: PageHeaderProps) {
  const m = t(locale);
  const breadcrumbs = items.length ? items : [{ href: "#", label: m.common.dashboard }];
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <div key={`${item.href}-${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-border">/</span> : null}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              (item.href.startsWith("/dashboard") ? (
                <Link href={toDashboardRouterHref(item.href)} className="hidden transition-colors hover:text-foreground md:inline-flex">
                  {item.label}
                </Link>
              ) : (
                <a href={item.href} className="hidden transition-colors hover:text-foreground md:inline-flex">
                  {item.label}
                </a>
              ))
            )}
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeSwitcher compact />
        <LocaleSwitcher currentPath={currentPath} />
      </div>
    </header>
  );
}
