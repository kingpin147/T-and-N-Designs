import { fetchPosts } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PostSitemapItem {
  slug: string;
  lastmod: string;
  imageLoc: string;
  imageTitle?: string;
}

const HISTORICAL_POSTS: PostSitemapItem[] = [
  {
    slug: "the-latest-in-ai-innovations-challenges-trends",
    lastmod: "2025-07-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_7cf6a5857a8c4cb5830b31ce483d71e2~mv2.jpg",
  },
  {
    slug: "latest-advancements-in-ai-in-june-2025",
    lastmod: "2025-09-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_97fa3baa6e0a458f9f45d70de5e1570d~mv2.png",
  },
  {
    slug: "latest-ai-advancements-july-2025",
    lastmod: "2025-09-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_6b9d4241366e49709fa327c145b21394~mv2.png",
    imageTitle: "🚀 Latest AI Advancements — July 2025",
  },
  {
    slug: "boost-your-business-with-digital-marketing-strategies",
    lastmod: "2025-09-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_39a776d391d0407e863af537ff6cbd52~mv2.png",
  },
  {
    slug: "september-2025-ai-s-hottest-breakthroughs-the-month-that-supercharged-everything",
    lastmod: "2025-10-06",
    imageLoc: "https://static.wixstatic.com/media/c5af70_48d63aa32acd4c9791c7e9a8ecca80f8~mv2.png",
    imageTitle: "September 2025: AI's Hottest Breakthroughs – The Month That Supercharged Everything!",
  },
  {
    slug: "top-online-ai-trends-of-the-year",
    lastmod: "2025-09-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_9499316cd34f4bb7b159126289af2bfc~mv2.png",
  },
  {
    slug: "discover-top-online-marketing-strategies-for-growth",
    lastmod: "2025-09-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_fb5a3125819d46e8b5eeda2fdb719097~mv2.png",
  },
  {
    slug: "artificial-intelligence-revolutionizing-online-services",
    lastmod: "2025-09-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_610f79c589204099bc6d14b77e0a93fa~mv2.png",
  },
  {
    slug: "deepseek-surpasses-chatgpt-a-new-ai-leader-emerges",
    lastmod: "2025-02-03",
    imageLoc: "https://static.wixstatic.com/media/c5af70_6ac48f36f3da4341b793b6c3a11e14ac~mv2.jpeg",
  },
  {
    slug: "effective-digital-marketing-strategies-to-grow-your-business",
    lastmod: "2025-09-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_155fa3e0de394e3aa0d0d97d30a92af0~mv2.png",
  },
  {
    slug: "latest-ai-trends-transforming-the-market",
    lastmod: "2025-09-22",
    imageLoc: "https://static.wixstatic.com/media/c5af70_b571d48aab934acd93c5b2ba20afd46b~mv2.png",
  },
  {
    slug: "the-future-of-ai-big-wins-in-august-2025",
    lastmod: "2025-08-26",
    imageLoc: "https://static.wixstatic.com/media/c5af70_e07eb3da8f844794b63723886e2a597b~mv2.png",
  },
  {
    slug: "openai-unveils-deep-research-a-game-changer-for-online-research",
    lastmod: "2025-02-03",
    imageLoc: "https://static.wixstatic.com/media/c5af70_68aee5f1a0b24a899c56531810f7e1ac~mv2.webp",
  },
  {
    slug: "the-latest-advancements-and-challenges-in-artificial-intelligence",
    lastmod: "2025-07-12",
    imageLoc: "https://static.wixstatic.com/media/c5af70_b5652389c0514583a5fe9ab6c7382cee~mv2.png",
  },
  {
    slug: "digital-marketing-solutions-for-small-businesses",
    lastmod: "2025-09-29",
    imageLoc: "https://static.wixstatic.com/media/c5af70_e5cbec8ab84e4b109afcea9f7f04dbbf~mv2.png",
  },
];

export async function GET() {
  const baseUrl = "https://www.tnndesigns.com";

  // Build map of items
  const postMap = new Map<string, PostSitemapItem>();
  for (const item of HISTORICAL_POSTS) {
    postMap.set(item.slug, item);
  }

  // Merge any dynamic posts from DB
  try {
    const dbPosts = await fetchPosts();
    for (const p of dbPosts) {
      if (!postMap.has(p.slug)) {
        const lastmod = p.publishedAt ? new Date(p.publishedAt).toISOString().split("T")[0] : "2026-10-28";
        const imageLoc = p.coverImageUrl?.startsWith("http")
          ? p.coverImageUrl
          : `${baseUrl}${p.coverImageUrl || "/og-image.png"}`;
        postMap.set(p.slug, {
          slug: p.slug,
          lastmod,
          imageLoc,
          imageTitle: p.title,
        });
      }
    }
  } catch (e) {
    console.error("Failed to merge DB posts into blog sitemap:", e);
  }

  const items = Array.from(postMap.values());

  const urlsXml = items
    .map((item) => {
      const escapeXml = (str: string) =>
        str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      return `  <url>
    <loc>${baseUrl}/post/${escapeXml(item.slug)}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <image:image>
      <image:loc>${escapeXml(item.imageLoc)}</image:loc>${
        item.imageTitle ? `\n      <image:title>${escapeXml(item.imageTitle)}</image:title>` : ""
      }
    </image:image>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" generatedBy="WIX">
${urlsXml}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

