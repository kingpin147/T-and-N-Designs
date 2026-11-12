import crypto from "node:crypto";

export interface GA4OverviewData {
  connected: boolean;
  propertyId: string;
  realtimeUsers: number;
  activeUsers: number;
  sessions: number;
  pageviews: number;
  bounceRate: string;
  avgSessionDuration: string;
  sources: Array<{ name: string; sessions: number; percentage: number }>;
  pages: Array<{ path: string; title: string; views: number; avgTime: string }>;
  countries: Array<{ country: string; code: string; sessions: number; percentage: number }>;
  devices: { desktop: number; mobile: number; tablet: number };
  dailyTrend: Array<{ date: string; label: string; visitors: number; sessions: number; pageviews: number }>;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

export async function getGA4AccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    return null;
  }

  // Return cached token if valid for at least 5 more minutes
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > now + 300) {
    return cachedToken.token;
  }

  try {
    const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = base64url(
      JSON.stringify({
        iss: clientEmail,
        sub: clientEmail,
        aud: "https://oauth2.googleapis.com/token",
        scope: "https://www.googleapis.com/auth/analytics.readonly",
        iat: now,
        exp: now + 3600,
      })
    );

    const signer = crypto.createSign("RSA-SHA256");
    signer.update(`${header}.${payload}`);
    const signature = signer.sign(privateKey, "base64url");
    const jwt = `${header}.${payload}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      console.error("[GA4 Auth Error]", errJson);
      return null;
    }

    const data = await res.json();
    cachedToken = {
      token: data.access_token,
      expiresAt: now + (data.expires_in || 3600),
    };
    return cachedToken.token;
  } catch (err) {
    console.error("[GA4 Token Exception]", err);
    return null;
  }
}

export async function fetchGA4Data(range: "30d" | "7d" | "today" | "90d" = "30d"): Promise<GA4OverviewData | null> {
  const propertyId = process.env.GA4_PROPERTY_ID || "476125385";
  const token = await getGA4AccessToken();

  if (!token || !propertyId) {
    return null;
  }

  const startDate =
    range === "today"
      ? "today"
      : range === "7d"
      ? "7daysAgo"
      : range === "90d"
      ? "90daysAgo"
      : "30daysAgo";

  try {
    // 1. Run Realtime Active Users Report
    const realtimePromise = fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
      }
    ).then((r) => r.json()).catch(() => ({}));

    // 2. Run Main Summary Report
    const summaryPromise = fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
          ],
        }),
      }
    ).then((r) => r.json()).catch(() => ({}));

    // 3. Run Traffic Sources Report
    const sourcesPromise = fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 10,
        }),
      }
    ).then((r) => r.json()).catch(() => ({}));

    // 4. Run Top Pages Report
    const pagesPromise = fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
          metrics: [{ name: "screenPageViews" }, { name: "userEngagementDuration" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 15,
        }),
      }
    ).then((r) => r.json()).catch(() => ({}));

    // 5. Run Daily Trend Timeline
    const trendPromise = fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
          orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
        }),
      }
    ).then((r) => r.json()).catch(() => ({}));

    // 6. Run Device Category Report
    const devicesPromise = fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "sessions" }],
        }),
      }
    ).then((r) => r.json()).catch(() => ({}));

    // 7. Run Countries Report
    const countriesPromise = fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "country" }, { name: "countryId" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 8,
        }),
      }
    ).then((r) => r.json()).catch(() => ({}));

    const [realtimeRes, summaryRes, sourcesRes, pagesRes, trendRes, devicesRes, countriesRes] =
      await Promise.all([
        realtimePromise,
        summaryPromise,
        sourcesPromise,
        pagesPromise,
        trendPromise,
        devicesPromise,
        countriesPromise,
      ]);

    // Parse Realtime
    const realtimeUsers = parseInt(realtimeRes.rows?.[0]?.metricValues?.[0]?.value || "0", 10);

    // Parse Summary
    const summaryRow = summaryRes.rows?.[0]?.metricValues || [];
    const activeUsers = parseInt(summaryRow[0]?.value || "0", 10);
    const sessions = parseInt(summaryRow[1]?.value || "0", 10);
    const pageviews = parseInt(summaryRow[2]?.value || "0", 10);
    const rawBounce = parseFloat(summaryRow[3]?.value || "0.42");
    const bounceRate = `${(rawBounce * 100).toFixed(1)}%`;
    const avgSec = Math.round(parseFloat(summaryRow[4]?.value || "0"));
    const avgMin = Math.floor(avgSec / 60);
    const remSec = avgSec % 60;
    const avgSessionDuration = `${avgMin}m ${remSec}s`;

    // Parse Sources
    const totalSourceSessions = (sourcesRes.rows || []).reduce(
      (acc: number, r: any) => acc + parseInt(r.metricValues?.[0]?.value || "0", 10),
      0
    ) || sessions || 1;

    const sources = (sourcesRes.rows || []).map((r: any) => {
      const name = r.dimensionValues?.[0]?.value || "Direct";
      const sCount = parseInt(r.metricValues?.[0]?.value || "0", 10);
      return {
        name,
        sessions: sCount,
        percentage: parseFloat(((sCount / totalSourceSessions) * 100).toFixed(1)),
      };
    });

    // Parse Pages
    const pages = (pagesRes.rows || []).map((r: any) => {
      const path = r.dimensionValues?.[0]?.value || "/";
      const title = r.dimensionValues?.[1]?.value || path;
      const views = parseInt(r.metricValues?.[0]?.value || "0", 10);
      const durSec = Math.round(parseFloat(r.metricValues?.[1]?.value || "0") / (views || 1));
      const pMin = Math.floor(durSec / 60);
      const pSec = durSec % 60;
      return {
        path,
        title,
        views,
        avgTime: `${pMin}m ${pSec}s`,
      };
    });

    // Parse Trend
    const dailyTrend = (trendRes.rows || []).map((r: any) => {
      const rawDate = r.dimensionValues?.[0]?.value || ""; // "YYYYMMDD"
      let formattedDate = rawDate;
      let label = rawDate;
      if (rawDate.length === 8) {
        const y = rawDate.slice(0, 4);
        const m = rawDate.slice(4, 6);
        const d = rawDate.slice(6, 8);
        const dt = new Date(`${y}-${m}-${d}T00:00:00Z`);
        formattedDate = `${m}/${d}`;
        label = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      }
      return {
        date: formattedDate,
        label,
        visitors: parseInt(r.metricValues?.[0]?.value || "0", 10),
        sessions: parseInt(r.metricValues?.[1]?.value || "0", 10),
        pageviews: parseInt(r.metricValues?.[2]?.value || "0", 10),
      };
    });

    // Parse Devices
    let desktop = 0;
    let mobile = 0;
    let tablet = 0;
    (devicesRes.rows || []).forEach((r: any) => {
      const cat = (r.dimensionValues?.[0]?.value || "").toLowerCase();
      const count = parseInt(r.metricValues?.[0]?.value || "0", 10);
      if (cat.includes("desktop")) desktop += count;
      else if (cat.includes("mobile")) mobile += count;
      else if (cat.includes("tablet")) tablet += count;
    });

    // Parse Countries
    const totalCountrySessions = (countriesRes.rows || []).reduce(
      (acc: number, r: any) => acc + parseInt(r.metricValues?.[0]?.value || "0", 10),
      0
    ) || sessions || 1;

    const countries = (countriesRes.rows || []).map((r: any) => {
      const country = r.dimensionValues?.[0]?.value || "Unknown";
      const code = r.dimensionValues?.[1]?.value || "UN";
      const sCount = parseInt(r.metricValues?.[0]?.value || "0", 10);
      return {
        country,
        code,
        sessions: sCount,
        percentage: parseFloat(((sCount / totalCountrySessions) * 100).toFixed(1)),
      };
    });

    return {
      connected: true,
      propertyId,
      realtimeUsers,
      activeUsers,
      sessions,
      pageviews,
      bounceRate,
      avgSessionDuration,
      sources,
      pages,
      countries,
      devices: { desktop, mobile, tablet },
      dailyTrend,
    };
  } catch (err) {
    console.error("[GA4 fetchGA4Data Error]", err);
    return null;
  }
}
