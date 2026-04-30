import type { APIRoute } from "astro";

/**
 * Dynamic sitemap.
 *
 * The base ships with a single home page; the route enumerates whatever
 * pages exist by listing them here. When a project adds pages (about,
 * pricing, blog posts, etc.), append them.
 *
 * For larger sites, switch to @astrojs/sitemap (auto-generates from the
 * pages directory). Hand-rolled is fine for a 1–10 page marketing site.
 */

export const prerender = false;

interface SitemapEntry {
  path: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

const routes: SitemapEntry[] = [
  { path: "/", lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly", priority: "1.0" },
];

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, "") ?? "https://marketing.bytetalent.com";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${base}${route.path}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
