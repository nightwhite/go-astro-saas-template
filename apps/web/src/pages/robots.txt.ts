import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const origin = new URL(request.url).origin;
  const body = [
    "User-agent: *",
    "Disallow: /api/",
    "Disallow: /admin/",
    "Disallow: /dashboard/",
    "Disallow: /settings/",
    "Allow: /",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
