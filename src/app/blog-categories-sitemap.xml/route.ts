export const dynamic = "force-dynamic";

export async function GET() {
  const categories = [
    "agentic-ai",
    "nextjs-fullstack",
    "cloud-infrastructure",
    "saas-growth",
    "cybersecurity",
    "latest-advancements-in-ai",
    "ai",
    "digital-marketing",
    "web-development",
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tnndesigns.com/blog</loc>
    <lastmod>2026-11-02</lastmod>
  </url>
${categories
  .map(
    (cat) => `  <url>
    <loc>https://www.tnndesigns.com/blog/categories/${cat}</loc>
    <lastmod>2026-11-02</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

