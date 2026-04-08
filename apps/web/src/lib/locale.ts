import { defaultLocale, getClientLocale, getPreferredLocale, type Locale } from "@/lib/i18n";

export function resolveClientLocale(): Locale {
  return typeof window !== "undefined" ? getClientLocale() : defaultLocale;
}

export function resolveServerLocale(request: Request): Locale {
  return getPreferredLocale(request);
}
