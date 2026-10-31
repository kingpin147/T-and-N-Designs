import { NextRequest } from "next/server";
import { processContactInquiry } from "@/services/contact.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return (req as any).ip || "";
}

function resolveGeoFromHeaders(req: NextRequest): string | null {
  // 1. Vercel Edge Geolocation Headers (Native in Next.js production deployments)
  const vercelCityRaw = req.headers.get("x-vercel-ip-city");
  const vercelCountry = req.headers.get("x-vercel-ip-country");
  const vercelRegion = req.headers.get("x-vercel-ip-country-region");

  if (vercelCityRaw && vercelCountry) {
    try {
      const city = decodeURIComponent(vercelCityRaw);
      return `${city}${vercelRegion ? `, ${vercelRegion}` : ""}, ${vercelCountry}`;
    } catch {
      return `${vercelCityRaw}, ${vercelCountry}`;
    }
  } else if (vercelCountry) {
    return vercelCountry;
  }

  // 2. Cloudflare Geolocation Headers
  const cfCity = req.headers.get("cf-ipcity");
  const cfCountry = req.headers.get("cf-ipcountry");
  if (cfCity && cfCountry) {
    return `${cfCity}, ${cfCountry}`;
  } else if (cfCountry) {
    return cfCountry;
  }

  return null;
}

async function lookupIpFallback(ip: string): Promise<string | null> {
  if (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.")
  ) {
    return null;
  }
  try {
    const res = await fetch(`https://freeipapi.com/api/json/${ip}`, {
      signal: AbortSignal.timeout(1500),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cityName && data.countryName) {
        return `${data.cityName}, ${data.countryName}`;
      }
    }
  } catch {
    // Non-blocking fallback
  }
  return null;
}

/**
 * Contact & Lead Capture Controller with Auto-Location Detection
 * Layered architecture: extracts request payload & auto-detected geo, delegates to service, returns standardized response.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const detectedIp = extractClientIp(req);

    // Resolve location: Edge headers -> Client-side detection -> IP lookup fallback
    let location = resolveGeoFromHeaders(req);

    if (!location && rawBody.location && typeof rawBody.location === "string") {
      location = rawBody.location.trim();
    }

    if (!location && detectedIp) {
      location = await lookupIpFallback(detectedIp);
    }

    const payload = {
      ...rawBody,
      location: location || undefined,
      ipAddress: detectedIp || rawBody.ipAddress || undefined,
    };

    const result = await processContactInquiry(payload);

    return apiSuccess({
      message: "Thank you for reaching out! We will review your project and get back to you shortly.",
      inquiryId: result.inquiryId,
      emailDispatched: result.emailSent,
      location: location || null,
    });
  } catch (err: unknown) {
    return handleApiError(err, "We were unable to submit your message at this time. Please try again or email us directly.");
  }
}
