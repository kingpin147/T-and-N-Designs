export const dynamic = "force-dynamic";

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" generatedBy="WIX">
  <url>
    <loc>https://www.tnndesigns.com</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/about</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/careers</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/our-works</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/our-works-1</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/work</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/services</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/process</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/reviews</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/faq</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/contact</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
  <url>
    <loc>https://www.tnndesigns.com/blog</loc>
    <lastmod>2026-10-28</lastmod>
  </url>
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

