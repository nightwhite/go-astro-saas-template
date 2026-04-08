"use client";

import { locales, t, type Locale } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";
import { useMemo } from "react";
import { useLocationStore } from "@/state/location";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function getClientRedirect(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname || "/"}${window.location.search || ""}`;
}

interface LocaleSwitcherProps {
  currentPath?: string;
}

export function LocaleSwitcher({ currentPath = "" }: LocaleSwitcherProps) {
  const locale = resolveClientLocale();
  const m = t(locale);
  const pathWithSearch = useLocationStore((s) => s.pathWithSearch);

  const redirectPath = useMemo(() => {
    const normalized = currentPath.trim();
    if (normalized) return normalized;
    if (pathWithSearch && pathWithSearch.trim().length > 0) return pathWithSearch;
    return getClientRedirect();
  }, [currentPath, pathWithSearch]);

  function localeHref(code: Locale): string {
    return `/api/locale?locale=${encodeURIComponent(code)}&redirect=${encodeURIComponent(redirectPath)}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={m.nav.language}>
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2c2.8 2.7 4.5 6.2 4.5 10S14.8 19.3 12 22c-2.8-2.7-4.5-6.2-4.5-10S9.2 4.7 12 2Z" />
          </svg>
          <span className="sr-only">{m.nav.language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((code) => (
          <DropdownMenuItem key={code} asChild>
            <a href={localeHref(code)} aria-label={`${m.nav.language}: ${m.nav.localeLabel[code as Locale]}`}>
              {m.nav.localeLabel[code as Locale]}
              <span className="ml-auto text-xs" aria-hidden="true" style={{ opacity: code === locale ? 1 : 0 }}>
                ✓
              </span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
