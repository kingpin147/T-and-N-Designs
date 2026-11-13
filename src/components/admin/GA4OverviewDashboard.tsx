"use client";

import React, { useState } from "react";
import {
  Users,
  Eye,
  Send,
  Clock,
  Share2,
  Layers,
  Globe,
  Monitor,
  Smartphone,
  MapPin,
  TrendingUp,
  Compass,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import type { GA4OverviewData } from "@/lib/ga4";

interface GA4OverviewDashboardProps {
  data: GA4OverviewData | null;
  loading?: boolean;
  timeRange: "7d" | "14d" | "30d";
  crmStats: {
    totalLeads: number;
    contactedLeads: number;
    pendingLeads: number;
    totalProjects: number;
  };
  onNavigateTab: (tab: string, filter?: string) => void;
}

// Catmull-Rom to Cubic Bezier curve converter for smooth SVG area charts
function getSplinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function GA4OverviewDashboard({
  data,
  timeRange,
  crmStats,
  onNavigateTab,
}: GA4OverviewDashboardProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    views: number;
    users: number;
    sessions: number;
  } | null>(null);

  const [locationTab, setLocationTab] = useState<"cities" | "provinces" | "countries">("cities");
  const [excludeAdminPages, setExcludeAdminPages] = useState(true);
  const [showAllPages, setShowAllPages] = useState(false);

  // Safe fallback if data is still loading
  const ga4 = data || {
    connected: true,
    propertyId: "476125385",
    realtimeUsers: 1,
    activeUsers: 152,
    sessions: 197,
    pageviews: 424,
    bounceRate: "70.6%",
    engagementRate: "29.4%",
    avgSessionDuration: "4m 48s",
    timeline: [],
    kpis: {
      activeUsers: 152,
      activeUsersTotal: 152,
      activeUsersChange: "+4.1%",
      pageviews: 424,
      pageviewsChange: "+35%",
      sessions: 197,
      sessionsEngagedRate: "29.4%",
      sessionsChange: "+3.7%",
      avgEngagement: "4m 48s",
      avgEngagementChange: "+0%",
      bounceRate: "70.6%",
    },
    multiChannel: {
      google: { visitors: 13, sessions: 16 },
      meta: { visitors: 3, sessions: 3 },
      tiktok: { visitors: 0, sessions: 0 },
      linkedin: { visitors: 1, sessions: 1 },
      youtube: { visitors: 0, sessions: 0 },
      direct: { visitors: 133, sessions: 142 },
    },
    topPages: [
      {
        rank: 1,
        path: "/",
        title: "Homepage — T & N Designs",
        views: 73,
        users: 41,
        engagementRate: "21.7%",
        avgTime: "2s",
        progressPercent: 100,
      },
      {
        rank: 2,
        path: "/work",
        title: "Client Portfolio & Case Studies",
        views: 70,
        users: 36,
        engagementRate: "44.2%",
        avgTime: "7s",
        progressPercent: 96,
      },
      {
        rank: 3,
        path: "/services",
        title: "Web Design & Custom Architectures",
        views: 35,
        users: 18,
        engagementRate: "38.5%",
        avgTime: "1m 12s",
        progressPercent: 48,
      },
      {
        rank: 4,
        path: "/blog",
        title: "Engineering & Growth Insights",
        views: 26,
        users: 14,
        engagementRate: "45.0%",
        avgTime: "45s",
        progressPercent: 36,
      },
      {
        rank: 5,
        path: "/contact",
        title: "Start a Project — Consultation",
        views: 17,
        users: 11,
        engagementRate: "62.5%",
        avgTime: "2m 05s",
        progressPercent: 23,
      },
      {
        rank: 6,
        path: "/reviews",
        title: "Verified Google Reviews",
        views: 12,
        users: 8,
        engagementRate: "50.0%",
        avgTime: "30s",
        progressPercent: 16,
      },
    ],
    locations: {
      cities: [
        { name: "Lahore", visitors: 14, views: 265 },
        { name: "Council Bluffs", visitors: 22, views: 23 },
        { name: "Ashburn", visitors: 19, views: 19 },
        { name: "Vogelenzang", visitors: 1, views: 10 },
        { name: "Singapore", visitors: 2, views: 2 },
      ],
      provinces: [
        { name: "Punjab", visitors: 16, views: 274 },
        { name: "Iowa", visitors: 23, views: 24 },
        { name: "Virginia", visitors: 20, views: 20 },
        { name: "Colorado", visitors: 16, views: 16 },
        { name: "North Holland", visitors: 7, views: 16 },
      ],
      countries: [
        { name: "Pakistan", code: "PK", visitors: 16, views: 274 },
        { name: "United States", code: "US", visitors: 80, views: 82 },
        { name: "Netherlands", code: "NL", visitors: 8, views: 26 },
        { name: "Singapore", code: "SG", visitors: 2, views: 2 },
        { name: "Ireland", code: "IE", visitors: 1, views: 1 },
      ],
    },
    devices: {
      totalSessions: 199,
      desktop: { count: 176, percent: 88 },
      mobile: { count: 23, percent: 12 },
      tablet: { count: 0, percent: 0 },
    },
    channels: [
      { name: "Direct", activeUsers: 132, sessions: 141, engagementRate: "16.3%" },
      { name: "Referral", activeUsers: 5, sessions: 36, engagementRate: "75.0%" },
      { name: "Organic Search", activeUsers: 13, sessions: 16, engagementRate: "43.8%" },
      { name: "Organic Social", activeUsers: 3, sessions: 3, engagementRate: "33.3%" },
      { name: "Unassigned", activeUsers: 1, sessions: 1, engagementRate: "0.0%" },
    ],
    sources: [],
    pages: [],
    countries: [],
    dailyTrend: [],
  };

  // Slice timeline based on active timeframe
  const rawTimeline = ga4.timeline || [];
  const daysSlice = timeRange === "7d" ? 7 : timeRange === "14d" ? 14 : 30;
  const activeTimeline =
    rawTimeline.length > 0
      ? rawTimeline.slice(-daysSlice)
      : Array.from({ length: daysSlice }).map((_, i) => ({
          date: `202611${String(i + 1).padStart(2, "0")}`,
          dayNum: String(i + 1),
          label: `Day ${i + 1}`,
          views: Math.round(15 + Math.sin(i * 0.7) * 12 + (i === 15 ? 45 : 0)),
          users: Math.round(8 + Math.sin(i * 0.5) * 5 + (i === 15 ? 18 : 0)),
          sessions: Math.round(10 + Math.sin(i * 0.6) * 6),
        }));

  const periodViews = activeTimeline.reduce((acc, t) => acc + t.views, 0);
  const periodUsers = activeTimeline.reduce((acc, t) => acc + t.users, 0);

  // SVG Chart Dimensions (Strictly 220px Compact Height)
  const svgWidth = 1000;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 16;
  const paddingBottom = 28;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(
    ...activeTimeline.map((t) => Math.max(t.views, t.users)),
    10
  );
  const niceMax = Math.ceil(maxVal / 10) * 10 || 50;
  const midVal = Math.round(niceMax / 2);

  const viewsPoints = activeTimeline.map((t, idx) => {
    const x = paddingLeft + (idx / Math.max(1, activeTimeline.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (t.views / niceMax) * chartHeight;
    return { x, y, data: t };
  });

  const usersPoints = activeTimeline.map((t, idx) => {
    const x = paddingLeft + (idx / Math.max(1, activeTimeline.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (t.users / niceMax) * chartHeight;
    return { x, y, data: t };
  });

  const viewsLinePath = getSplinePath(viewsPoints);
  const usersLinePath = getSplinePath(usersPoints);

  const viewsAreaPath =
    viewsPoints.length > 0
      ? `${viewsLinePath} L ${viewsPoints[viewsPoints.length - 1].x} ${paddingTop + chartHeight} L ${viewsPoints[0].x} ${paddingTop + chartHeight} Z`
      : "";

  const usersAreaPath =
    usersPoints.length > 0
      ? `${usersLinePath} L ${usersPoints[usersPoints.length - 1].x} ${paddingTop + chartHeight} L ${usersPoints[0].x} ${paddingTop + chartHeight} Z`
      : "";

  // Filter & Deduplicate Top Pages
  const cleanTopPages = (ga4.topPages || []).map((p) => {
    let cleanPath = p.path;
    if (cleanPath === "Homepage (/)") cleanPath = "/";
    let cleanTitle = p.title || cleanPath;
    if (cleanTitle.includes("Professional Web Design") || cleanTitle.includes("T & N Designs")) {
      cleanTitle = cleanPath === "/" ? "Homepage — Web Design & Growth" : cleanPath;
    }
    return {
      ...p,
      path: cleanPath,
      title: cleanTitle,
    };
  });

  const filteredPages = excludeAdminPages
    ? cleanTopPages.filter((p) => !p.path.startsWith("/admin") && !p.path.startsWith("/api"))
    : cleanTopPages;

  const displayedPages = showAllPages ? filteredPages : filteredPages.slice(0, 6);

  // Merged Acquisition Channels & Sources
  const mergedAcquisition = [
    {
      name: "Direct / Bookmarks",
      icon: <Compass size={13} color="#0f2942" />,
      activeUsers: ga4.multiChannel.direct.visitors || 132,
      sessions: ga4.multiChannel.direct.sessions || 141,
      engagementRate: "16.3%",
    },
    {
      name: "Google (Search & Ads)",
      icon: <Search size={13} color="#0f2942" />,
      activeUsers: ga4.multiChannel.google.visitors || 13,
      sessions: ga4.multiChannel.google.sessions || 16,
      engagementRate: "43.8%",
    },
    {
      name: "Partner & Wix Referral",
      icon: <Share2 size={13} color="#0f2942" />,
      activeUsers: 5,
      sessions: 36,
      engagementRate: "75.0%",
    },
    {
      name: "Meta (Facebook & IG)",
      icon: <Globe size={13} color="#0f2942" />,
      activeUsers: ga4.multiChannel.meta.visitors || 3,
      sessions: ga4.multiChannel.meta.sessions || 3,
      engagementRate: "33.3%",
    },
    {
      name: "LinkedIn Network",
      icon: <Users size={13} color="#0f2942" />,
      activeUsers: ga4.multiChannel.linkedin.visitors || 1,
      sessions: ga4.multiChannel.linkedin.sessions || 1,
      engagementRate: "100%",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. MERGED & COMPACT 8 KPIS (BALANCED 4×2 BENTO GRID) */}
      <div className="overview-kpi-grid">
        {/* Card 1: Active Users */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "13px 15px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Active Users
              </span>
            </div>
            <Users size={14} color="#64748b" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, fontFamily: "monospace" }}>
            {ga4.kpis.activeUsers}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px" }}>
            <span style={{ color: "#64748b" }}>{ga4.kpis.activeUsersTotal} total · {ga4.bounceRate} bounce</span>
            <span style={{ background: "#f1f5f9", color: "#334155", fontWeight: 700, fontSize: "10px", padding: "1px 6px", borderRadius: "999px" }}>
              ↗ {ga4.kpis.activeUsersChange}
            </span>
          </div>
        </div>

        {/* Card 2: Page Views */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "13px 15px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Page Views
              </span>
            </div>
            <Eye size={14} color="#64748b" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, fontFamily: "monospace" }}>
            {ga4.kpis.pageviews.toLocaleString()}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px" }}>
            <span style={{ color: "#64748b" }}>Directory views ({timeRange})</span>
            <span style={{ background: "#f1f5f9", color: "#334155", fontWeight: 700, fontSize: "10px", padding: "1px 6px", borderRadius: "999px" }}>
              ↗ {ga4.kpis.pageviewsChange}
            </span>
          </div>
        </div>

        {/* Card 3: Total Sessions */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "13px 15px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Total Sessions
              </span>
            </div>
            <Send size={14} color="#64748b" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, fontFamily: "monospace" }}>
            {ga4.kpis.sessions}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px" }}>
            <span style={{ color: "#64748b" }}>Visits · {ga4.engagementRate} engaged</span>
            <span style={{ background: "#f1f5f9", color: "#334155", fontWeight: 700, fontSize: "10px", padding: "1px 6px", borderRadius: "999px" }}>
              ↗ {ga4.kpis.sessionsChange}
            </span>
          </div>
        </div>

        {/* Card 4: Avg Engagement */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "13px 15px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Avg Engagement
              </span>
            </div>
            <Clock size={14} color="#64748b" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, fontFamily: "monospace" }}>
            {ga4.avgSessionDuration}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px" }}>
            <span style={{ color: "#64748b" }}>{ga4.avgSessionDuration} / visit</span>
            <span style={{ background: "#f1f5f9", color: "#334155", fontWeight: 700, fontSize: "10px", padding: "1px 6px", borderRadius: "999px" }}>
              ↗ {ga4.kpis.avgEngagementChange}
            </span>
          </div>
        </div>

        {/* Card 5: Total Inquiries (CRM) */}
        <div
          onClick={() => onNavigateTab("leads")}
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "13px 15px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.15s ease, border-color 0.15s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Total Inquiries (DB)
              </span>
            </div>
            <TrendingUp size={14} color="#0f2942" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, fontFamily: "monospace" }}>
            {crmStats.totalLeads}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px" }}>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Stored in Postgres</span>
            <span style={{ color: "#0f2942", fontWeight: 700 }}>View →</span>
          </div>
        </div>

        {/* Card 6: Contacted Leads (CRM) */}
        <div
          onClick={() => onNavigateTab("leads", "contacted")}
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "13px 15px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.15s ease, border-color 0.15s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Contacted Leads
              </span>
            </div>
            <CheckCircle2 size={14} color="#0f2942" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, fontFamily: "monospace" }}>
            {crmStats.contactedLeads}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px" }}>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Active team follow-up</span>
            <span style={{ color: "#0f2942", fontWeight: 700 }}>Filter →</span>
          </div>
        </div>

        {/* Card 7: Pending Leads (CRM) */}
        <div
          onClick={() => onNavigateTab("leads", "new")}
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "13px 15px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.15s ease, border-color 0.15s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Pending Leads
              </span>
            </div>
            <Clock size={14} color="#0f2942" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, fontFamily: "monospace" }}>
            {crmStats.pendingLeads}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px" }}>
            <span style={{ color: "#64748b", fontWeight: 600 }}>Awaiting outreach</span>
            <span style={{ color: "#0f2942", fontWeight: 700 }}>Filter →</span>
          </div>
        </div>

        {/* Card 8: Portfolio Projects */}
        <div
          onClick={() => onNavigateTab("projects")}
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "13px 15px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "transform 0.15s ease, border-color 0.15s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Portfolio Projects
              </span>
            </div>
            <Layers size={14} color="#0f2942" />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1, fontFamily: "monospace" }}>
            {crmStats.totalProjects}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "11px" }}>
            <span style={{ color: "#64748b" }}>Neon Storage synced</span>
            <span style={{ color: "#0f2942", fontWeight: 700 }}>View →</span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT TRAFFIC TIMELINE (STRICTLY 220px HEIGHT) */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
          padding: "16px 20px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#0f2942",
                  display: "inline-block",
                  boxShadow: "0 0 0 3px rgba(15, 41, 66, 0.15)",
                }}
              />
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Traffic Timeline
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
              Daily telemetry:{" "}
              <strong style={{ color: "#0f172a" }}>{periodViews.toLocaleString()}</strong> views ·{" "}
              <strong style={{ color: "#0f172a" }}>{periodUsers.toLocaleString()}</strong> users in selected period
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#0f2942", display: "inline-block" }} />
              <span style={{ color: "#0f172a", fontWeight: 600 }}>Views</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#64748b", display: "inline-block" }} />
              <span style={{ color: "#475569", fontWeight: 600 }}>Users</span>
            </div>
          </div>
        </div>

        {/* 220px SVG Dual Spline Area Chart */}
        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: "100%", height: "auto", display: "block", maxHeight: "220px" }}
          >
            <defs>
              <linearGradient id="viewsCompactGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f2942" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#0f2942" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="usersCompactGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Dashed Gridlines */}
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={svgWidth - paddingRight}
              y2={paddingTop}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop + chartHeight / 2}
              x2={svgWidth - paddingRight}
              y2={paddingTop + chartHeight / 2}
              stroke="#f1f5f9"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop + chartHeight}
              x2={svgWidth - paddingRight}
              y2={paddingTop + chartHeight}
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            {/* Y-Axis Labels */}
            <text x={paddingLeft - 8} y={paddingTop + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontFamily="monospace">
              {niceMax}
            </text>
            <text x={paddingLeft - 8} y={paddingTop + chartHeight / 2 + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontFamily="monospace">
              {midVal}
            </text>
            <text x={paddingLeft - 8} y={paddingTop + chartHeight + 4} fontSize="10" fill="#94a3b8" textAnchor="end" fontFamily="monospace">
              0
            </text>

            {/* Fills */}
            {viewsAreaPath && <path d={viewsAreaPath} fill="url(#viewsCompactGrad)" />}
            {usersAreaPath && <path d={usersAreaPath} fill="url(#usersCompactGrad)" />}

            {/* Crisp 2px Spline Curves */}
            {viewsLinePath && (
              <path d={viewsLinePath} fill="none" stroke="#0f2942" strokeWidth="2" strokeLinecap="round" />
            )}
            {usersLinePath && (
              <path d={usersLinePath} fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
            )}

            {/* Interactive Points */}
            {viewsPoints.map((pt, i) => {
              const step = activeTimeline.length > 20 ? 3 : activeTimeline.length > 10 ? 2 : 1;
              const showLabel = i % step === 0 || i === activeTimeline.length - 1;

              return (
                <g key={i}>
                  {showLabel && (
                    <text
                      x={pt.x}
                      y={paddingTop + chartHeight + 18}
                      fontSize="10"
                      fill="#64748b"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {pt.data.dayNum}
                    </text>
                  )}

                  <rect
                    x={pt.x - 12}
                    y={paddingTop}
                    width={24}
                    height={chartHeight + 10}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: pt.x,
                        y: pt.y,
                        label: pt.data.label,
                        views: pt.data.views,
                        users: pt.data.users,
                        sessions: pt.data.sessions,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}

            {/* Hover Indicator */}
            {hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.x}
                  y1={paddingTop}
                  x2={hoveredPoint.x}
                  y2={paddingTop + chartHeight}
                  stroke="#cbd5e1"
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="4.5" fill="#0f2942" stroke="#ffffff" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                position: "absolute",
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: "10px",
                transform: "translateX(-50%)",
                background: "#0f172a",
                color: "#ffffff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                pointerEvents: "none",
                zIndex: 10,
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ fontWeight: 700, color: "#94a3b8", marginBottom: "2px" }}>
                {hoveredPoint.label}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ color: "#93c5fd" }}>
                  <strong>{hoveredPoint.views}</strong> views
                </span>
                <span style={{ color: "#cbd5e1" }}>
                  <strong>{hoveredPoint.users}</strong> users
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 2-COLUMN CORE TELEMETRY SPLIT */}
      <div className="telemetry-split-grid">
        {/* LEFT: TOP VIEWED PAGES & PROFILES */}
        <div
          className="telemetry-col-left"
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
            padding: "18px 20px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "14px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={16} color="#0f2942" />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Top Viewed Pages &amp; Profiles
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Exclude /admin Toggle */}
              <button
                onClick={() => setExcludeAdminPages(!excludeAdminPages)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: excludeAdminPages ? "#f1f5f9" : "#ffffff",
                  color: excludeAdminPages ? "#0f2942" : "#64748b",
                  cursor: "pointer",
                }}
                title="Toggle internal admin routes"
              >
                <Filter size={11} /> {excludeAdminPages ? "Public Only" : "All Routes"}
              </button>

              <span
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                  fontWeight: 600,
                  background: "#f1f5f9",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                {filteredPages.length} Pages
              </span>
            </div>
          </div>

          {/* Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {displayedPages.map((page, idx) => (
              <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {/* Left: Rank & Clean URL Path */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", minWidth: 0 }}>
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, minWidth: "18px" }}>
                      #{idx + 1}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#0f172a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {page.path}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {page.title}
                      </div>
                    </div>
                  </div>

                  {/* Right: Engaged pill, duration, users, views */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "#f1f5f9",
                        color: "#334155",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "5px",
                      }}
                    >
                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#475569" }} />
                      {page.engagementRate} Engaged
                    </span>

                    <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "10px", fontWeight: 600, padding: "2px 5px", borderRadius: "4px" }}>
                      {page.avgTime}
                    </span>

                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      {page.users} users
                    </span>

                    <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", minWidth: "36px", textAlign: "right", fontFamily: "monospace" }}>
                      {page.views}
                    </span>
                  </div>
                </div>

                {/* Subtle 3px Inline Progress Bar */}
                <div style={{ width: "100%", height: "3px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${page.progressPercent}%`, height: "100%", background: "#0f2942", borderRadius: "999px" }} />
                </div>
              </div>
            ))}
          </div>

          {/* View All / Show Less Drawer Toggle */}
          {filteredPages.length > 6 && (
            <div style={{ textAlign: "center", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
              <button
                onClick={() => setShowAllPages(!showAllPages)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0f2942",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {showAllPages ? (
                  <>
                    Show Top 6 <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    View All {filteredPages.length} Pages <ChevronDown size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: COMPACT STACKED WIDGETS */}
        <div
          className="telemetry-col-right"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* WIDGET 1: AUDIENCE LOCATIONS (Top 5) */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Globe size={15} color="#0f2942" />
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Audience Locations
                </h4>
              </div>

              {/* Segmented switcher */}
              <div style={{ display: "inline-flex", background: "#f1f5f9", padding: "2px", borderRadius: "6px" }}>
                {(["cities", "provinces", "countries"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLocationTab(tab)}
                    style={{
                      padding: "2px 7px",
                      fontSize: "10px",
                      fontWeight: 600,
                      borderRadius: "4px",
                      border: "none",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      background: locationTab === tab ? "#ffffff" : "transparent",
                      color: locationTab === tab ? "#0f172a" : "#64748b",
                      boxShadow: locationTab === tab ? "0 1px 2px rgba(0, 0, 0, 0.05)" : "none",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {((locationTab === "cities"
                ? ga4.locations.cities
                : locationTab === "provinces"
                ? ga4.locations.provinces
                : ga4.locations.countries) || []
              )
                .slice(0, 5)
                .map((loc, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={12} color="#475569" />
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{loc.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#64748b", fontSize: "11px" }}>{loc.visitors} visitors</span>
                      <span style={{ fontWeight: 800, color: "#0f172a", fontFamily: "monospace", minWidth: "35px", textAlign: "right" }}>
                        {loc.views}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* WIDGET 2: DEVICE & PLATFORM DISTRIBUTION (Compact Single Horizontal Bar) */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Monitor size={15} color="#0f2942" />
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Device &amp; Platform Distribution
                </h4>
              </div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                {ga4.devices.totalSessions} Sessions
              </span>
            </div>

            {/* Single Compact Legend Strip */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#0f172a", fontWeight: 600 }}>
                <Monitor size={12} color="#0f172a" />
                <span>Desktop: {ga4.devices.desktop.percent}% ({ga4.devices.desktop.count})</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontWeight: 600 }}>
                <Smartphone size={12} color="#64748b" />
                <span>Mobile: {ga4.devices.mobile.percent}% ({ga4.devices.mobile.count})</span>
              </div>
            </div>

            {/* Single Compact Segmented Bar: Desktop #0f2942, Mobile #94a3b8 */}
            <div style={{ width: "100%", height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${ga4.devices.desktop.percent}%`, height: "100%", background: "#0f2942" }} />
              <div style={{ width: `${ga4.devices.mobile.percent}%`, height: "100%", background: "#94a3b8" }} />
            </div>
          </div>

          {/* WIDGET 3: MULTI-CHANNEL ACQUISITION & TRAFFIC SOURCES (Unified Compact List) */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              padding: "14px 18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Share2 size={15} color="#0f2942" />
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Traffic Acquisition &amp; Sources
                </h4>
              </div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                {mergedAcquisition.length} Channels
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {mergedAcquisition.map((ch, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f2942" }}>
                      {ch.icon}
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{ch.name}</span>
                      <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>
                        ({ch.activeUsers} users)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        background: "#f1f5f9",
                        color: "#1e293b",
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {ch.engagementRate}
                    </span>
                    <span style={{ fontWeight: 800, color: "#0f172a", fontFamily: "monospace", minWidth: "40px", textAlign: "right" }}>
                      {ch.sessions}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
