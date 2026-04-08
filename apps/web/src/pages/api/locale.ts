import { LOCALE_COOKIE_NAME, defaultLocale, isLocale } from "@/lib/i18n";

export const prerender = false;

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const rawLocale = (url.searchParams.get("locale") || "").toLowerCase();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const redirect = url.searchParams.get("redirect") || "/";
  const destination = redirect.startsWith("/") ? redirect : "/";

  const headers = new Headers();
  headers.set(
    "Set-Cookie",
    `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`,
  );
  headers.set("Location", destination);
  return new Response(null, { status: 302, headers });
}
