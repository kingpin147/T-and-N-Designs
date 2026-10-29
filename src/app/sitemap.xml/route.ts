export const dynamic = "force-dynamic";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" generatedBy="WIX">
  <sitemap>
    <loc>https://www.tnndesigns.com/blog-posts-sitemap.xml</loc>
    <lastmod>2026-10-28</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.tnndesigns.com/blog-categories-sitemap.xml</loc>
    <lastmod>2026-10-28</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.tnndesigns.com/pages-sitemap.xml</loc>
    <lastmod>2026-10-28</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

