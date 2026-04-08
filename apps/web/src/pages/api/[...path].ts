export const prerender = false;

import { logger } from "@/lib/runtime/logger";

// Dev proxy so browser requests can use same-origin `/api/*`
// and include cookies without CORS headaches.
export async function ALL({ request, params }: { request: Request; params: { path?: string } }) {
  const base = import.meta.env.APP_BASE_URL || "http://127.0.0.1:8080";
  const url = new URL(request.url);
  const tail = params?.path ? `/${params.path}` : "";

  const target = new URL(`/api${tail}${url.search}`, base);

  const incoming = new Headers(request.headers);
  // Let upstream handle host, and avoid leaking local origin.
  incoming.delete("host");
  incoming.delete("origin");

  let resp: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    resp = await fetch(target.toString(), {
      method: request.method,
      headers: incoming,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      redirect: "manual",
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    logger.error("api_proxy_unavailable", {
      module: "web-proxy",
      action: "forward",
      path: `/api${tail}`,
      target: target.toString(),
    });
    // If API isn't up yet (common during dev startup), don't crash Astro.
    return new Response(JSON.stringify({ error: { code: "bad_gateway", message: "upstream api unavailable" } }), {
      status: 502,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  const headers = new Headers(resp.headers);
  // Ensure cookies work in browser (Astro dev server domain)
  // and don't inherit upstream CORS headers.
  headers.delete("access-control-allow-origin");
  headers.delete("access-control-allow-credentials");
  headers.set("cache-control", "no-store");

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  });
}
