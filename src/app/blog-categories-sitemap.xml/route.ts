export const dynamic = "force-dynamic";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" generatedBy="WIX">
  <url>
    <loc>https://www.tnndesigns.com/blog</loc>
    <lastmod>2025-10-06</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/blog/categories/latest-advancements-in-ai</loc>
    <lastmod>2026-06-03</lastmod>
  </url>
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

