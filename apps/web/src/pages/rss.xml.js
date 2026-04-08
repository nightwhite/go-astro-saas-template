import rss from "@astrojs/rss";
import { fetchPublishedPosts, selectTranslation } from "@/lib/blog";
import { defaultLocale } from "@/lib/i18n";

export const prerender = false;

export async function GET(context) {
  const posts = await fetchPublishedPosts(defaultLocale).catch(() => []);
  const items = posts
    .map((post) => {
      const translation = selectTranslation(post, defaultLocale);
      if (!translation) return null;
      return {
        title: translation.title,
        description: translation.excerpt || "",
        pubDate: post.published_at ? new Date(post.published_at) : new Date(post.created_at),
        link: `/blog/${post.slug}`,
      };
    })
    .filter(Boolean);

  return rss({
    title: "Blog",
    description: "Latest blog posts",
    site: context.site ?? new URL(context.request.url).origin,
    items,
  });
}
