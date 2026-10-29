import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.tnndesigns.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/admin/*",
          "/api/admin",
          "/api/admin/*",
          "/api/auth/*",
        ],
      },
      // Welcoming AI Search & Generative Engine Crawlers
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Google-Extended",
          "CCBot",
          "Applebot-Extended",
          "cohere-ai",
        ],
        allow: [
          "/",
          "/work",
          "/services",
          "/reviews",
          "/blog",
          "/blog/*",
          "/faq",
          "/contact",
          "/llms.txt",
          "/api/mcp",
          "/_api/mcp",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/admin/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
