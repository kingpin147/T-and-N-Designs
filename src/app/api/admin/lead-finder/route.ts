import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30; // Allow sufficient time for Overpass & parallel audits

interface BusinessLead {
  id: string;
  name: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  niche: string;
  audit: {
    hasSSL: boolean;
    isMobileResponsive: boolean;
    cms: string;
    loadTimeMs: number;
    title: string;
    hasMetaDescription: boolean;
    opportunityScore: number;
    status: "healthy" | "needs_attention" | "critical_redesign";
    issues: string[];
  };
}

// Maps user-friendly niches to OpenStreetMap tags
const NICHE_TAGS: Record<string, { key: string; val: string }[]> = {
  plumber: [{ key: "craft", val: "plumber" }],
  electrician: [{ key: "craft", val: "electrician" }],
  roofing: [{ key: "craft", val: "roofer" }, { key: "craft", val: "roofing" }],
  dentist: [{ key: "amenity", val: "dentist" }],
  doctor: [{ key: "amenity", val: "doctors" }, { key: "amenity", val: "clinic" }],
  lawyer: [{ key: "office", val: "lawyer" }],
  restaurant: [{ key: "amenity", val: "restaurant" }, { key: "amenity", val: "cafe" }],
  real_estate: [{ key: "office", val: "estate_agent" }],
  architect: [{ key: "office", val: "architect" }],
  accountant: [{ key: "office", val: "accountant" }],
  solar: [{ key: "shop", val: "solar" }, { key: "craft", val: "photovoltaic" }],
  hvac: [{ key: "craft", val: "hvac" }],
};

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (!currentUser.permissions?.canManageLeads && currentUser.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const body = await req.json();
    const city = (body.city || "").trim();
    const niche = (body.niche || "plumber").toLowerCase().trim();

    if (!city) {
      return NextResponse.json({ error: "City or region name is required." }, { status: 400 });
    }

    // 1. Build Overpass Query
    const tags = NICHE_TAGS[niche] || [
      { key: "craft", val: niche },
      { key: "amenity", val: niche },
      { key: "office", val: niche },
    ];

    const tagQueries = tags
      .map(
        (t) => `
        node["${t.key}"="${t.val}"](area.searchArea);
        way["${t.key}"="${t.val}"](area.searchArea);
      `
      )
      .join("\n");

    const overpassQL = `
      [out:json][timeout:20];
      area["name"="${city}"]->.searchArea;
      (
        ${tagQueries}
      );
      out tags 60;
    `;

    // 2. Fetch from Overpass API (with mirror fallback)
    let rawElements: any[] = [];
    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://lz4.overpass-api.de/api/interpreter",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "TNNDesignsLeadProspector/1.0",
          },
          body: `data=${encodeURIComponent(overpassQL)}`,
          signal: AbortSignal.timeout(18000),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.elements)) {
            rawElements = data.elements;
            break;
          }
        }
      } catch (err) {
        console.warn(`[Overpass] Failed on ${endpoint}, trying fallback...`, err);
      }
    }

    // 3. Extract and sanitize discovered businesses
    const discovered = rawElements
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any) => {
        let url =
          el.tags.website ||
          el.tags["contact:website"] ||
          el.tags.url ||
          el.tags["contact:url"] ||
          "";

        if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }

        const phone =
          el.tags.phone ||
          el.tags["contact:phone"] ||
          el.tags["contact:mobile"] ||
          "N/A";

        const street = el.tags["addr:street"]
          ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}`.trim()
          : "";

        return {
          id: `osm-${el.id || Math.random().toString(36).substring(7)}`,
          name: el.tags.name,
          website: url,
          phone,
          address: street || city,
          city,
          niche,
        };
      })
      // Prioritize businesses with websites, then limit to top 16 for fast parallel auditing
      .sort((a, b) => (b.website ? 1 : 0) - (a.website ? 1 : 0))
      .slice(0, 16);

    if (discovered.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        leads: [],
        message: `No ${niche} listings with public records found in ${city}. Try expanding to a larger nearby metro or neighboring city.`,
      });
    }

    // 4. Run Fast Parallel Website Technical Audits
    const auditedLeads: BusinessLead[] = await Promise.all(
      discovered.map(async (lead) => {
        if (!lead.website) {
          return {
            ...lead,
            audit: {
              hasSSL: false,
              isMobileResponsive: false,
              cms: "No Website Found",
              loadTimeMs: 0,
              title: "No online presence registered",
              hasMetaDescription: false,
              opportunityScore: 95,
              status: "critical_redesign",
              issues: ["No Website", "Missing Online Presence", "Zero Digital Brand Identity"],
            },
          };
        }

        const auditResult = await auditTargetWebsite(lead.website);
        return {
          ...lead,
          audit: auditResult,
        };
      })
    );

    // Sort by highest opportunity score (greatest need for agency redesign)
    auditedLeads.sort((a, b) => b.audit.opportunityScore - a.audit.opportunityScore);

    return NextResponse.json({
      success: true,
      count: auditedLeads.length,
      leads: auditedLeads,
    });
  } catch (error: any) {
    console.error("Lead Finder error:", error);
    return NextResponse.json(
      { error: "Failed to scrape and audit leads", details: error.message },
      { status: 500 }
    );
  }
}

// Fast Server-Side Technical Auditor Function
async function auditTargetWebsite(targetUrl: string): Promise<BusinessLead["audit"]> {
  const issues: string[] = [];
  let hasSSL = targetUrl.startsWith("https://");
  let isMobileResponsive = true;
  let cms = "Custom / Modern";
  let loadTimeMs = 0;
  let title = "";
  let hasMetaDescription = false;
  let opportunityScore = 15; // baseline

  if (!hasSSL) {
    issues.push("Insecure (Missing HTTPS / SSL)");
    opportunityScore += 35;
  }

  const startTime = Date.now();
  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(4500),
      redirect: "follow",
    });

    loadTimeMs = Date.now() - startTime;
    const finalUrl = res.url || targetUrl;
    if (finalUrl.startsWith("https://")) {
      hasSSL = true;
    }

    if (!res.ok) {
      issues.push(`HTTP ${res.status} Error`);
      opportunityScore += 35;
    }

    const html = (await res.text()).slice(0, 150000); // Read first 150KB for fast analysis

    // 1. Mobile Viewport Check
    isMobileResponsive = html.toLowerCase().includes('name="viewport"');
    if (!isMobileResponsive) {
      issues.push("Not Mobile-Friendly (Broken Viewport)");
      opportunityScore += 30;
    }

    // 2. CMS & Tech Stack Detection
    const lowerHtml = html.toLowerCase();
    if (lowerHtml.includes("wp-content") || lowerHtml.includes("wp-includes") || lowerHtml.includes("wordpress")) {
      cms = "WordPress";
      issues.push("Monolithic CMS (High Maintenance)");
      opportunityScore += 12;
    } else if (lowerHtml.includes("wix.com") || lowerHtml.includes("wix-warmup-data") || lowerHtml.includes("wixsite")) {
      cms = "Wix";
      issues.push("Wix Platform (Candidate for Next.js Replatform)");
      opportunityScore += 15;
    } else if (lowerHtml.includes("squarespace.com")) {
      cms = "Squarespace";
      opportunityScore += 10;
    } else if (lowerHtml.includes("cdn.shopify.com") || lowerHtml.includes("shopify.com")) {
      cms = "Shopify";
    } else if (lowerHtml.includes("webflow.com")) {
      cms = "Webflow";
    } else if (lowerHtml.includes("joomla") || lowerHtml.includes("drupal")) {
      cms = "Legacy CMS (Joomla/Drupal)";
      issues.push("Outdated Legacy CMS");
      opportunityScore += 25;
    }

    // 3. Performance & Latency Check
    if (loadTimeMs > 2500) {
      issues.push(`Slow Load Time (${(loadTimeMs / 1000).toFixed(1)}s TTFB)`);
      opportunityScore += 15;
    }

    // 4. Meta & SEO Check
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = titleMatch ? titleMatch[1].trim() : "Untitled";
    hasMetaDescription = lowerHtml.includes('name="description"');
    if (!hasMetaDescription) {
      issues.push("Missing SEO Meta Description");
      opportunityScore += 8;
    }
  } catch (err: any) {
    loadTimeMs = Date.now() - startTime;
    issues.push("Unreachable or Timed Out");
    opportunityScore = 90;
    cms = "Down / Broken";
  }

  const finalScore = Math.min(opportunityScore, 98);
  const status: "healthy" | "needs_attention" | "critical_redesign" =
    finalScore >= 65 ? "critical_redesign" : finalScore >= 40 ? "needs_attention" : "healthy";

  return {
    hasSSL,
    isMobileResponsive,
    cms,
    loadTimeMs,
    title: title.slice(0, 80),
    hasMetaDescription,
    opportunityScore: finalScore,
    status,
    issues: issues.length > 0 ? issues : ["Modern / Responsive"],
  };
}
