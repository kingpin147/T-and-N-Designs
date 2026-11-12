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
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import type { GA4OverviewData } from "@/lib/ga4";

interface GA4OverviewDashboardProps {
  data: GA4OverviewData | null;
  loading?: boolean;
  onRefresh?: () => void;
  onOpenSetupModal?: () => void;
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
  loading = false,
  onRefresh,
  onOpenSetupModal,
}: GA4OverviewDashboardProps) {
  const [timelineRange, setTimelineRange] = useState<"7d" | "14d" | "30d">("30d");
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    views: number;
    users: number;
    sessions: number;
  } | null>(null);
  const [locationTab, setLocationTab] = useState<"cities" | "provinces" | "countries">("cities");

  // Fallback if data is null or empty
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
        path: "Homepage (/)",
        title: "Professional Web Design Agency | Custom Websites | T & N Designs",
        views: 73,
        users: 41,
        engagementRate: "21.7%",
        avgTime: "2s",
        progressPercent: 100,
      },
      {
        rank: 2,
        path: "Homepage (/)",
        title: "T & N Designs | Professional Web Design, Wix Studio & Digital Growth Agency",
        views: 70,
        users: 36,
        engagementRate: "44.2%",
        avgTime: "7s",
        progressPercent: 96,
      },
    ],
    locations: {
      cities: [
        { name: "Lahore", visitors: 14, views: 265 },
        { name: "Council Bluffs", visitors: 22, views: 23 },
        { name: "Ashburn", visitors: 19, views: 19 },
        { name: "Vogelenzang", visitors: 1, views: 10 },
      ],
      provinces: [
        { name: "Punjab", visitors: 16, views: 274 },
        { name: "Iowa", visitors: 23, views: 24 },
        { name: "Virginia", visitors: 20, views: 20 },
        { name: "Colorado", visitors: 16, views: 16 },
      ],
      countries: [
        { name: "Pakistan", code: "PK", visitors: 16, views: 274 },
        { name: "United States", code: "US", visitors: 80, views: 82 },
        { name: "Netherlands", code: "NL", visitors: 8, views: 26 },
        { name: "Singapore", code: "SG", visitors: 2, views: 2 },
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

  // Slice timeline based on selected timeframe
  const rawTimeline = ga4.timeline || [];
  const daysSlice = timelineRange === "7d" ? 7 : timelineRange === "14d" ? 14 : 30;
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

  // SVG Chart Layout calculations
  const svgWidth = 1000;
  const svgHeight = 280;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(
    ...activeTimeline.map((t) => Math.max(t.views, t.users)),
    10
  );
  // Round up max for nice axis ticks
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* 1. TRAFFIC TIMELINE CARD */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
          padding: "24px 28px",
          position: "relative",
        }}
      >
        {/* Card Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "inline-block",
                  boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.2)",
                }}
              />
              <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Traffic Timeline
              </h2>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
              Daily telemetry:{" "}
              <strong style={{ color: "#0f172a" }}>{periodViews.toLocaleString()}</strong> views ·{" "}
              <strong style={{ color: "#0f172a" }}>{periodUsers.toLocaleString()}</strong> users in
              selected period
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#f59e0b",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "#334155", fontWeight: 600 }}>Views</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#0f766e",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: "#334155", fontWeight: 600 }}>Users</span>
              </div>
            </div>

            {/* Timeframe Pill Switcher */}
            <div
              style={{
                display: "inline-flex",
                background: "#f1f5f9",
                padding: "3px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}
            >
              {[
                { key: "7d", label: "7 Days" },
                { key: "14d", label: "14 Days" },
                { key: "30d", label: "30 Days" },
              ].map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => setTimelineRange(pill.key as any)}
                  style={{
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    background: timelineRange === pill.key ? "#ffffff" : "transparent",
                    color: timelineRange === pill.key ? "#0f172a" : "#64748b",
                    boxShadow:
                      timelineRange === pill.key
                        ? "0 1px 3px rgba(0, 0, 0, 0.08)"
                        : "none",
                  }}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dual Spline Area SVG Chart */}
        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <defs>
              <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="usersAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f766e" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
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
            <text
              x={paddingLeft - 10}
              y={paddingTop + 4}
              fontSize="11"
              fill="#94a3b8"
              textAnchor="end"
              fontFamily="monospace"
            >
              {niceMax}
            </text>
            <text
              x={paddingLeft - 10}
              y={paddingTop + chartHeight / 2 + 4}
              fontSize="11"
              fill="#94a3b8"
              textAnchor="end"
              fontFamily="monospace"
            >
              {midVal}
            </text>
            <text
              x={paddingLeft - 10}
              y={paddingTop + chartHeight + 4}
              fontSize="11"
              fill="#94a3b8"
              textAnchor="end"
              fontFamily="monospace"
            >
              0
            </text>

            {/* Area Fills */}
            {viewsAreaPath && <path d={viewsAreaPath} fill="url(#viewsAreaGrad)" />}
            {usersAreaPath && <path d={usersAreaPath} fill="url(#usersAreaGrad)" />}

            {/* Spline Strokes */}
            {viewsLinePath && (
              <path
                d={viewsLinePath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.75"
                strokeLinecap="round"
              />
            )}
            {usersLinePath && (
              <path
                d={usersLinePath}
                fill="none"
                stroke="#0f766e"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
            )}

            {/* Interactive Data Points and X-Axis Labels */}
            {viewsPoints.map((pt, i) => {
              // Show label every N items to prevent crowding
              const step = activeTimeline.length > 20 ? 3 : activeTimeline.length > 10 ? 2 : 1;
              const showLabel = i % step === 0 || i === activeTimeline.length - 1;

              return (
                <g key={i}>
                  {showLabel && (
                    <text
                      x={pt.x}
                      y={paddingTop + chartHeight + 22}
                      fontSize="11"
                      fill="#64748b"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {pt.data.dayNum}
                    </text>
                  )}

                  {/* Invisible hit target for smooth hover */}
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

            {/* Active Hover Marker Line and Dots */}
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
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                position: "absolute",
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: "16px",
                transform: "translateX(-50%)",
                background: "#0f172a",
                color: "#ffffff",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                pointerEvents: "none",
                zIndex: 10,
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ fontWeight: 700, color: "#94a3b8", marginBottom: "4px" }}>
                {hoveredPoint.label}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ color: "#fbbf24" }}>
                  <strong>{hoveredPoint.views}</strong> views
                </span>
                <span style={{ color: "#2dd4bf" }}>
                  <strong>{hoveredPoint.users}</strong> users
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 4 PRIMARY KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "18px",
        }}
      >
        {/* ACTIVE USERS */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            borderTop: "3px solid #f59e0b",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Active Users
              </span>
              <Users size={16} color="#f59e0b" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  fontFamily: "monospace",
                }}
              >
                {ga4.kpis.activeUsers}
              </div>
              {/* Micro-sparkline SVG */}
              <svg width="64" height="24" viewBox="0 0 64 24">
                <path
                  d="M 2 18 Q 16 2, 28 14 T 48 6 T 62 10"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid #f1f5f9",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "#64748b" }}>
              {ga4.kpis.activeUsersTotal} total · {ga4.bounceRate} bounce
            </span>
            <span
              style={{
                background: "#ecfdf5",
                color: "#059669",
                fontWeight: 700,
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "999px",
              }}
            >
              ↗ {ga4.kpis.activeUsersChange}
            </span>
          </div>
        </div>

        {/* PAGE VIEWS */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            borderTop: "3px solid #0f172a",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Page Views
              </span>
              <Eye size={16} color="#0f172a" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  fontFamily: "monospace",
                }}
              >
                {ga4.kpis.pageviews.toLocaleString()}
              </div>
              {/* Micro-sparkline SVG */}
              <svg width="64" height="24" viewBox="0 0 64 24">
                <path
                  d="M 2 20 L 14 14 L 26 18 L 38 6 L 50 12 L 62 4"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid #f1f5f9",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "#64748b" }}>Directory views (30d)</span>
            <span
              style={{
                background: "#ecfdf5",
                color: "#059669",
                fontWeight: 700,
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "999px",
              }}
            >
              ↗ {ga4.kpis.pageviewsChange}
            </span>
          </div>
        </div>

        {/* TOTAL SESSIONS */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            borderTop: "3px solid #d97706",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Total Sessions
              </span>
              <Send size={16} color="#d97706" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  fontFamily: "monospace",
                }}
              >
                {ga4.kpis.sessions}
              </div>
              {/* Micro-sparkline SVG */}
              <svg width="64" height="24" viewBox="0 0 64 24">
                <path
                  d="M 2 16 Q 16 20, 26 10 T 44 8 T 62 14"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid #f1f5f9",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "#64748b" }}>
              Visits · {ga4.engagementRate} engaged
            </span>
            <span
              style={{
                background: "#ecfdf5",
                color: "#059669",
                fontWeight: 700,
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "999px",
              }}
            >
              ↗ {ga4.kpis.sessionsChange}
            </span>
          </div>
        </div>

        {/* AVG ENGAGEMENT */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            borderTop: "3px solid #059669",
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  color: "#64748b",
                  textTransform: "uppercase",
                }}
              >
                Avg Engagement
              </span>
              <Clock size={16} color="#059669" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  fontFamily: "monospace",
                }}
              >
                {ga4.avgSessionDuration}
              </div>
              {/* Micro-sparkline wave SVG */}
              <svg width="64" height="24" viewBox="0 0 64 24">
                <path
                  d="M 2 12 Q 10 2, 18 12 T 34 12 T 50 12 T 62 12"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid #f1f5f9",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "#64748b" }}>{ga4.avgSessionDuration} / visit</span>
            <span
              style={{
                background: "#ecfdf5",
                color: "#059669",
                fontWeight: 700,
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "999px",
              }}
            >
              ↗ {ga4.kpis.avgEngagementChange}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MULTI-CHANNEL ACQUISITION TRAFFIC */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Share2 size={18} color="#d97706" />
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Multi-Channel Acquisition Traffic
            </h3>
            <span
              style={{
                background: "#fef3c7",
                color: "#92400e",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "6px",
              }}
            >
              Last 30 Days
            </span>
          </div>

          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Direct referral and search telemetry via Google Analytics 4
          </div>
        </div>

        {/* 6 Horizontal Channel Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "14px",
          }}
        >
          {/* 1. Search Engine (Google) */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  background: "#fef3c7",
                  color: "#b45309",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                Search Engine
              </span>
              {/* Google 'G' Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12c0 2.02.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              Google (Search &amp; Ads)
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#64748b",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span>
                VISITORS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.google.visitors}</strong>
              </span>
              <span>
                SESSIONS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.google.sessions}</strong>
              </span>
            </div>
          </div>

          {/* 2. Meta Social */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                Meta Social
              </span>
              {/* Facebook Icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              Facebook &amp; Instagram
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#64748b",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span>
                VISITORS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.meta.visitors}</strong>
              </span>
              <span>
                SESSIONS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.meta.sessions}</strong>
              </span>
            </div>
          </div>

          {/* 3. Short Video Feed (TikTok) */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  background: "#f1f5f9",
                  color: "#334155",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                Short Video Feed
              </span>
              {/* TikTok Icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#000000">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              TikTok Traffic
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#64748b",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span>
                VISITORS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.tiktok.visitors}</strong>
              </span>
              <span>
                SESSIONS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.tiktok.sessions}</strong>
              </span>
            </div>
          </div>

          {/* 4. B2B Professional (LinkedIn) */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  background: "#e0f2fe",
                  color: "#0369a1",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                B2B Professional
              </span>
              {/* LinkedIn Icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              LinkedIn Network
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#64748b",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span>
                VISITORS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.linkedin.visitors}</strong>
              </span>
              <span>
                SESSIONS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.linkedin.sessions}</strong>
              </span>
            </div>
          </div>

          {/* 5. Video Platform (YouTube) */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                Video Platform
              </span>
              {/* YouTube Icon */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#FF0000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              YouTube Traffic
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#64748b",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span>
                VISITORS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.youtube.visitors}</strong>
              </span>
              <span>
                SESSIONS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.youtube.sessions}</strong>
              </span>
            </div>
          </div>

          {/* 6. Direct Visits */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  background: "#ecfdf5",
                  color: "#047857",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                }}
              >
                Direct Visits
              </span>
              <Compass size={16} color="#059669" />
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
              Direct / Bookmarks
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "#64748b",
                paddingTop: "6px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <span>
                VISITORS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.direct.visitors}</strong>
              </span>
              <span>
                SESSIONS:{" "}
                <strong style={{ color: "#0f172a" }}>{ga4.multiChannel.direct.sessions}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LOWER TWO-COLUMN LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: TOP VIEWED PAGES & PROFILES */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
            padding: "24px 28px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Layers size={18} color="#d97706" />
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Top Viewed Pages &amp; Profiles
              </h3>
              <span
                style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "6px",
                }}
              >
                Last 30 Days
              </span>
            </div>

            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 600,
                background: "#f1f5f9",
                padding: "3px 8px",
                borderRadius: "6px",
              }}
            >
              {ga4.topPages.length} Pages
            </span>
          </div>

          {/* Ranked Rows #1 to #10 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {ga4.topPages.map((page) => (
              <div key={page.rank} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  {/* Left: Rank & Title/Path */}
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        fontWeight: 700,
                        minWidth: "22px",
                        paddingTop: "2px",
                      }}
                    >
                      #{page.rank}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {page.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                        {page.path}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badges, Users, and Big Bold Views */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "#ecfdf5",
                        color: "#047857",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "6px",
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "#059669",
                        }}
                      />
                      {page.engagementRate} Engaged
                    </span>

                    <span
                      style={{
                        background: "#f1f5f9",
                        color: "#475569",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {page.avgTime}
                    </span>

                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {page.users} users
                    </span>

                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#0f172a",
                        minWidth: "40px",
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {page.views}
                    </span>
                  </div>
                </div>

                {/* Orange Horizontal Progress Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "5px",
                    background: "#f1f5f9",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${page.progressPercent}%`,
                      height: "100%",
                      background: "#f59e0b",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (3 Cards) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* CARD 1: AUDIENCE LOCATIONS */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
              padding: "24px 28px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe size={18} color="#0d9488" />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Audience Locations
                </h3>
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Last 30 Days
                </span>
              </div>

              {/* Tabs [ Cities | Provinces | Countries ] */}
              <div
                style={{
                  display: "inline-flex",
                  background: "#f1f5f9",
                  padding: "3px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                {(["cities", "provinces", "countries"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLocationTab(tab)}
                    style={{
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      textTransform: "capitalize",
                      background: locationTab === tab ? "#ffffff" : "transparent",
                      color: locationTab === tab ? "#0f172a" : "#64748b",
                      boxShadow: locationTab === tab ? "0 1px 2px rgba(0, 0, 0, 0.06)" : "none",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {((locationTab === "cities"
                ? ga4.locations.cities
                : locationTab === "provinces"
                ? ga4.locations.provinces
                : ga4.locations.countries) || []
              ).map((loc, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={15} color="#d97706" />
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{loc.name}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>
                      {loc.visitors} visitors
                    </span>
                    <span
                      style={{
                        fontWeight: 800,
                        color: "#0f172a",
                        minWidth: "48px",
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {loc.views} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: DEVICE & PLATFORM DISTRIBUTION */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
              padding: "24px 28px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Monitor size={18} color="#2563eb" />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Device &amp; Platform Distribution
                </h3>
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Last 30 Days
                </span>
              </div>

              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: 600,
                  background: "#f1f5f9",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                {ga4.devices.totalSessions} Sessions
              </span>
            </div>

            {/* Desktop vs Mobile Two Boxes */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "14px",
              }}
            >
              {/* Desktop Box */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Monitor size={22} color="#0f172a" />
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Desktop</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    {ga4.devices.desktop.percent}%{" "}
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                      ({ga4.devices.desktop.count})
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Box */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Smartphone size={22} color="#d97706" />
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Mobile</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                    {ga4.devices.mobile.percent}%{" "}
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                      ({ga4.devices.mobile.count})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dual Segment Progress Bar */}
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#f1f5f9",
                borderRadius: "999px",
                overflow: "hidden",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: `${ga4.devices.desktop.percent}%`,
                  height: "100%",
                  background: "#0f172a",
                }}
              />
              <div
                style={{
                  width: `${ga4.devices.mobile.percent}%`,
                  height: "100%",
                  background: "#f59e0b",
                }}
              />
            </div>
          </div>

          {/* CARD 3: TRAFFIC SOURCES & ACQUISITION CHANNELS */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
              padding: "24px 28px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Share2 size={18} color="#d97706" />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Traffic Sources &amp; Acquisition Channels
                </h3>
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Last 30 Days
                </span>
              </div>

              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  fontWeight: 600,
                  background: "#f1f5f9",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                {ga4.channels.length} Channels
              </span>
            </div>

            {/* Channels List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {ga4.channels.map((chan, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "10px",
                    borderBottom:
                      idx < ga4.channels.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "#fffbeb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {chan.name.toLowerCase().includes("direct") ? (
                        <Compass size={14} color="#d97706" />
                      ) : chan.name.toLowerCase().includes("search") ? (
                        <Search size={14} color="#d97706" />
                      ) : (
                        <Share2 size={14} color="#d97706" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                        {chan.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        {chan.activeUsers} active users
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "#047857",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {chan.engagementRate} Engaged
                    </span>

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#0f172a",
                        minWidth: "75px",
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {chan.sessions} sessions
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

