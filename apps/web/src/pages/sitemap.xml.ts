import type { APIRoute } from "astro";
import { fetchPublishedPosts } from "@/lib/blog";
import { defaultLocale } from "@/lib/i18n";

export const prerender = false;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const GET: APIRoute = async ({ request }) => {
  const origin = new URL(request.url).origin;
  const now = new Date().toISOString();

  const staticEntries = ["/", "/about", "/contact", "/blog", "/terms", "/privacy"].map((path) => ({
    loc: `${origin}${path}`,
    lastmod: now,
  }));

  const posts = await fetchPublishedPosts(defaultLocale).catch(() => []);
  const blogEntries = posts.map((post) => ({
    loc: `${origin}/blog/${post.slug}`,
    lastmod: post.published_at || post.updated_at || post.created_at || now,
  }));

  const uniqueEntries = new Map<string, { loc: string; lastmod: string }>();
  for (const entry of [...staticEntries, ...blogEntries]) {
    uniqueEntries.set(entry.loc, entry);
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    Array.from(uniqueEntries.values())
      .map((entry) => {
        return `  <url><loc>${escapeXml(entry.loc)}</loc><lastmod>${escapeXml(new Date(entry.lastmod).toISOString())}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`;
      })
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
