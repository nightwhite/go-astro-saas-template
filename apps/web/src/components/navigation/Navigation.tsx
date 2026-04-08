"use client";

import { useMemo } from "react";
import { useLocationStore } from "@/state/location";
import { Menu } from "lucide-react";
import { SITE_NAME } from "@/constants";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/state/session";
import { t } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";
import { ThemeSwitcher } from "@/components/navigation/ThemeSwitcher";
import { LocaleSwitcher } from "@/components/navigation/LocaleSwitcher";

type NavItem = {
  name: string;
  href: string;
};

function useLocaleMessages() {
  const locale = resolveClientLocale();
  return { locale, t: t(locale) };
}

export default function Navigation() {
  const { session, isLoading } = useSessionStore();
  const pathname = useLocationStore((s) => s.pathname);
  const { t } = useLocaleMessages();

  const navItems: NavItem[] = useMemo(
    () => [
      { name: t.nav.home, href: "/" },
      { name: t.nav.blog, href: "/blog" },
      { name: t.nav.about, href: "/about" },
      { name: t.nav.contact, href: "/contact" },
    ],
    [t.nav.about, t.nav.blog, t.nav.contact, t.nav.home],
  );

  const isActiveLink = (itemHref: string) => {
    if (itemHref === "/") {
      return pathname === "/";
    }
    if (itemHref === "/blog") {
      return pathname === "/blog" || pathname.startsWith("/blog/");
    }
    return pathname === itemHref;
  };

  const ctaHref = session ? "/dashboard" : "/sign-in";
  const ctaLabel = session ? t.nav.dashboard : t.nav.signIn;
  const ctaLoadingClass = isLoading ? "opacity-70" : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight" aria-label={SITE_NAME}>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-xs font-bold">A</span>
            </span>
            <span>{SITE_NAME}</span>
          </a>

          <nav className="hidden items-center gap-4 lg:flex" aria-label="Main">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActiveLink(item.href) ? "" : "text-muted-foreground",
                )}
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            className={cn(
              "hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:inline-flex",
              ctaLoadingClass,
            )}
            href={ctaHref}
          >
            {ctaLabel}
          </a>

          <LocaleSwitcher />
          <ThemeSwitcher compact />

          <details className="relative lg:hidden">
            <summary
              className="inline-flex h-9 w-9 list-none items-center justify-center rounded-md border border-border bg-background shadow-sm transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label={t.nav.openMenu}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">{t.nav.openMenu}</span>
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md">
              <div className="grid gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "rounded-sm px-2 py-1.5 text-sm transition hover:bg-accent hover:text-accent-foreground",
                      isActiveLink(item.href) ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="my-1 h-px bg-border" />
                <a
                  href={ctaHref}
                  className={cn(
                    "rounded-sm px-2 py-1.5 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
                    ctaLoadingClass,
                  )}
                >
                  {ctaLabel}
                </a>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
