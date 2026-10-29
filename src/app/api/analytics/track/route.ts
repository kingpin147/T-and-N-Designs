import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

function parseUserAgent(ua: string) {
  let deviceType = "desktop";
  let browser = "Unknown Browser";
  let os = "Unknown OS";

  if (!ua) return { deviceType, browser, os };

  // Device detection
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    deviceType = "mobile";
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
    deviceType = "tablet";
  }

  // OS detection
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  // Browser detection
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/opr|opera/i.test(ua)) browser = "Opera";

  return { deviceType, browser, os };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      event = "$pageview",
      pathname = "/",
      referrer = "",
      session_id,
      distinct_id,
      device_type: clientDeviceType,
      browser: clientBrowser,
      os: clientOs,
      country: clientCountry,
      country_code: clientCountryCode,
      duration_seconds = 0,
      properties = {},
    } = body;

    const ua = req.headers.get("user-agent") || "";
    const parsedUa = parseUserAgent(ua);

    const deviceType = clientDeviceType || parsedUa.deviceType;
    const browser = clientBrowser || parsedUa.browser;
    const os = clientOs || parsedUa.os;

    // Resolve country from CDN headers or fallback to client detection
    const headerCountryCode =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      clientCountryCode ||
      "UN";

    const countryName = clientCountry || (headerCountryCode === "PK" ? "Pakistan" : headerCountryCode === "US" ? "United States" : headerCountryCode === "GB" ? "United Kingdom" : headerCountryCode === "CA" ? "Canada" : headerCountryCode === "AE" ? "United Arab Emirates" : "Local / Direct");

    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      try {
        const sql = neon(connectionString);
        await sql`
          INSERT INTO analytics_events (
            event_name,
            pathname,
            referrer,
            session_id,
            distinct_id,
            device_type,
            browser,
            os,
            country,
            country_code,
            duration_seconds,
            properties
          ) VALUES (
            ${event},
            ${pathname},
            ${referrer || null},
            ${session_id || null},
            ${distinct_id || null},
            ${deviceType},
            ${browser},
            ${os},
            ${countryName},
            ${headerCountryCode},
            ${Number(duration_seconds) || 0},
            ${JSON.stringify(properties)}::jsonb
          )
        `;
      } catch (dbErr) {
        console.warn("[Analytics Track] DB insert error:", dbErr);
      }
    }

    // Also forward directly to PostHog Ingestion API if key is present (with 4s timeout)
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (posthogKey) {
      try {
        fetch("https://us.i.posthog.com/capture/", {
          method: "POST",
          signal: AbortSignal.timeout(4000),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: posthogKey,
            event,
            properties: {
              distinct_id: distinct_id || session_id || "anonymous",
              $current_url: pathname,
              $referrer: referrer,
              $browser: browser,
              $os: os,
              $device_type: deviceType,
              $ip: getClientIp(req),
              ...properties,
            },
          }),
        }).catch(() => {});
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[Analytics Track Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to record analytics event" }, { status: 400 });
  }
}

