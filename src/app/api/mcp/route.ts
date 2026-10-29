import { NextRequest, NextResponse } from "next/server";
import { fetchProjects, fetchPosts } from "@/lib/db";

// Model Context Protocol (MCP) Endpoint for Agentic AI Access
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tool = searchParams.get("tool");
  const query = searchParams.get("searchTerm") || searchParams.get("query") || "";

  if (tool === "GetBusinessDetails" || !tool) {
    return NextResponse.json({
      name: "T & N Designs",
      tagline: "Professional Web Architecture & Digital Growth Agency",
      description: "T & N Designs specializes in bespoke Wix Studio platforms, high-velocity Next.js web applications, WordPress migrations, and high-ROI Meta Ads campaigns.",
      url: "https://www.tnndesigns.com",
      email: "contact@tnndesigns.com",
      location: {
        address: "Defence Rd, Phase Block M, DHA Rahbar Phase 2",
        city: "Lahore",
        country: "Pakistan",
        coverage: "Global delivery (US, UK, Canada, Australia, Worldwide)",
        timezone: "UTC+5 (PKT) with 24/7 client response coverage",
      },
      services: [
        "Custom Wix Studio Design & Velo JavaScript Engineering",
        "Next.js Full-Stack Web Applications",
        "WordPress to Wix Studio & Next.js Migrations",
        "Meta Ads Performance Marketing & Media Buying",
        "Conversion Rate Optimization (CRO) & UI/UX Audit",
        "Custom Database CMS & Third-Party API Integrations",
      ],
      metrics: {
        completedProjects: 85,
        rating: "5.0 ★ Google Verified",
        responseTime: "2–4 business hours guaranteed",
      },
      mcpTools: [
        { name: "GetBusinessDetails", description: "Get agency contact, capabilities, and location details." },
        { name: "SearchInSite", description: "Search portfolio projects, services, and articles." },
        { name: "GenerateVisitorToken", description: "Creates a visitor token for lead inquiry submissions." },
        { name: "CallWixSiteAPI", description: "Submit lead inquiries or call agency APIs." },
      ],
    });
  }

  if (tool === "SearchInSite") {
    try {
      const [projects, posts] = await Promise.all([fetchProjects(), fetchPosts()]);
      const lowerQuery = query.toLowerCase();

      const matchedProjects = projects
        .filter(
          (p) =>
            p.title.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.tags?.some((t) => t.toLowerCase().includes(lowerQuery)) ||
            p.fullDescription?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 8)
        .map((p) => ({
          title: p.title,
          category: p.category,
          description: p.shortDescription || p.fullDescription?.slice(0, 180),
          url: p.projectUrl || `https://www.tnndesigns.com/work`,
          coverImageUrl: p.coverImageUrl,
        }));

      const matchedPosts = posts
        .filter(
          (post) =>
            post.title.toLowerCase().includes(lowerQuery) ||
            post.content?.toLowerCase().includes(lowerQuery) ||
            post.excerpt?.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 5)
        .map((post) => ({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          url: `https://www.tnndesigns.com/blog/${post.slug}`,
          readTime: `${post.readTime} min read`,
        }));

      return NextResponse.json({
        query,
        projectMatches: matchedProjects,
        articleMatches: matchedPosts,
      });
    } catch {
      return NextResponse.json({ error: "Failed to search site content" }, { status: 500 });
    }
  }

  if (tool === "GenerateVisitorToken") {
    const token = `tnn_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return NextResponse.json({
      success: true,
      visitorToken: token,
      expiresIn: 3600,
    });
  }

  return NextResponse.json({
    error: `Tool ${tool} not recognized. Available tools: GetBusinessDetails, SearchInSite, GenerateVisitorToken, CallWixSiteAPI`,
  }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, searchTerm, visitorToken } = body;

    if (tool === "GenerateVisitorToken") {
      const token = `tnn_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return NextResponse.json({ success: true, visitorToken: token });
    }

    if (tool === "SearchInSite") {
      const projects = await fetchProjects();
      const lower = (searchTerm || "").toLowerCase();
      const matches = projects.filter((p) => p.title.toLowerCase().includes(lower)).slice(0, 5);
      return NextResponse.json({ success: true, results: matches });
    }

    if (tool === "CallWixSiteAPI") {
      return NextResponse.json({
        success: true,
        message: "Endpoint ready for automated inquiry forwarding to CRM.",
      });
    }

    return NextResponse.json({
      success: true,
      mcpVersion: "1.0",
      agency: "T & N Designs",
    });
  } catch {
    return NextResponse.json({ error: "Invalid MCP request" }, { status: 400 });
  }
}
