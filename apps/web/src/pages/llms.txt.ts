import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  const content = [
    "# SaaS Template (Go + Astro)",
    "",
    "Project homepage: /",
    "Blog index: /blog",
    "Dashboard: /dashboard",
    "Admin: /admin",
    "",
    "This file describes crawlable template endpoints.",
    "",
  ].join("\n");

  return new Response(content, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
