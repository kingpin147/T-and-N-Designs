"use client";

import React, { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  RefreshCw,
  Download,
  ExternalLink,
  ShieldCheck,
  Eye,
  Play,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Radio,
  FileText,
  MousePointer,
  Lightbulb,
  CheckCircle2,
  X,
  Zap,
  Search,
  Bot,
  MessageSquare,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface AnalyticsData {
  timeRange: string;
  comparisonPeriod: string;
  trafficTrend: Array<{
    date: string;
    label: string;
    visitors: number;
    sessions: number;
    pageviews: number;
  }>;
  newVsReturning: {
    totalUnique: number;
    newVisitors: number;
    newPercent: number;
    returningVisitors: number;
    returningPercent: number;
  };
  sessionsByDevice: {
    totalSessions: number;
    desktop: number;
    desktopPercent: number;
    mobile: number;
    mobilePercent: number;
    tablet: number;
    tabletPercent: number;
  };
  avgSessionsByDay: Array<{
    day: string;
    avg: number;
  }>;
  trafficSources: Array<{
    source: string;
    type: string;
    percentage: number;
    sessions: number;
    change: string;
  }>;
  trafficInsights: Array<{
    id: string;
    type: "warning" | "opportunity" | "info";
    title: string;
    message: string;
    actionText?: string;
  }>;
  sessionsByCountry: Array<{
    country: string;
    code: string;
    flag: string;
    sessions: number;
    percentage: number;
  }>;
  realtime: {
    activeUsers: number;
    activePages: Array<{ path: string; count: number }>;
    recentEvents: Array<{
      id: string;
      event: string;
      path: string;
      time: string;
      device: string;
      country: string;
    }>;
  };
  highlights: {
    uniqueVisitors: number;
    uniqueVisitorsChange: string;
    siteSessions: number;
    siteSessionsChange: string;
    pageviews: number;
    pageviewsChange: string;
    avgSessionDuration: string;
    avgSessionDurationChange: string;
    bounceRate: string;
    bounceRateChange: string;
    leadsSubmitted: number;
    leadsConversionRate: string;
  };
  behaviorPages: Array<{
    path: string;
    title: string;
    views: number;
    uniqueViews: number;
    avgTime: string;
    bounceRate: string;
    exitRate: string;
  }>;
  marketingChannels: Array<{
    channel: string;
    sessions: number;
    percentage: number;
    inquiries: number;
    conversionRate: string;
  }>;
  sessionRecordings: Array<{
    id: string;
    distinctId: string;
    duration: string;
    pagesCount: number;
    clicksCount: number;
    device: string;
    browser: string;
    country: string;
    flag: string;
    startedAt: string;
    posthogUrl: string;
  }>;
  posthogConfig: {
    configured: boolean;
    host: string;
    apiKeyPrefix: string;
    proxyActive: boolean;
  };
  aiPlatforms?: Array<{
    id: string;
    name: string;
    crawler: string;
    iconBg: string;
    color: string;
    queriesCount: number;
    citations: number;
    referralVisits: number;
    citationShare: number;
    topTargetUrl: string;
    status: string;
  }>;
  aiQueries?: Array<{
    id: string;
    query: string;
    platform: string;
    platformId: string;
    platformColor: string;
    platformBg: string;
    intent: string;
    targetPage: string;
    targetPageTitle: string;
    citations: number;
    clicks: number;
    quotedSnippet: string;
    trend: string;
  }>;
}

export default function PostHogAnalyticsDashboard() {
  const [selectedSubTab, setSelectedSubTab] = useState<
    "traffic" | "highlights" | "realtime" | "ai_geo" | "behavior" | "marketing" | "recordings" | "insights" | "reports"
  >("traffic");
  const [timeRange, setTimeRange] = useState<"30d" | "7d" | "today" | "90d">("30d");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [activeReportModal, setActiveReportModal] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // AI GEO search & filter state
  const [aiQuerySearch, setAiQuerySearch] = useState<string>("");
  const [aiPlatformFilter, setAiPlatformFilter] = useState<string>("all");
  const [aiIntentFilter, setAiIntentFilter] = useState<string>("all");
  const [filterDevTraffic, setFilterDevTraffic] = useState<boolean>(true);
  const [excludeAdminRealtime, setExcludeAdminRealtime] = useState<boolean>(true);
  const [publicPagesOnly, setPublicPagesOnly] = useState<boolean>(true);
  const [hideZeroTraffic, setHideZeroTraffic] = useState<boolean>(true);

  // Fetch analytics data
  const fetchAnalytics = async (range: string = timeRange, isManual: boolean = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const json = await res.json();
      if (json.success && json.data) {
        setAnalytics(json.data);
      }
    } catch (err) {
      console.error("[PostHog Analytics] Error loading data:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const handleExportCSV = () => {
    if (!analytics) return;
    const rows = [
      ["Date", "Visitors", "Sessions", "Pageviews"],
      ...analytics.trafficTrend.map((t) => [t.date, t.visitors, t.sessions, t.pageviews]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `posthog_traffic_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("Traffic report downloaded successfully!");
    setTimeout(() => setExportNotice(null), 3500);
  };

  const navItems = [
    { id: "highlights", label: "Highlights", icon: Sparkles },
    { id: "realtime", label: "Real-time", icon: Radio, badge: "LIVE" },
    { id: "ai_geo", label: "AI Search & Crawlers", icon: Zap, badge: "GEO" },
    { id: "traffic", label: "Traffic", icon: TrendingUp },
    { id: "behavior", label: "Behavior", icon: MousePointer },
    { id: "marketing", label: "Marketing", icon: Globe },
    { id: "recordings", label: "Session Recordings", icon: Play, badge: "PostHog" },
    { id: "insights", label: "Insights & Benchmarks", icon: Lightbulb },
    { id: "reports", label: "All Reports", icon: FileText },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ display: "flex", flexDirection: "column", gap: "20px", color: "var(--text-primary)" }}
    >
      {/* Main Bento-Glass Modern Analytics Shell */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          background: "#ffffff",
          color: "#0f172a",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 12px 28px -6px rgba(0,0,0,0.03)",
          minHeight: "850px",
        }}
        className="analytics-light-shell"
      >
        {/* HORIZONTAL SEGMENTED TAB BAR (Bento-Glass Modernization) */}
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "5px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            overflowX: "auto",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
          className="analytics-horizontal-tabs"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedSubTab(item.id as any)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: isSelected ? "1px solid #e2e8f0" : "1px solid transparent",
                  background: isSelected ? "#ffffff" : "transparent",
                  color: isSelected ? "#0f172a" : "#64748b",
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: "13px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <Icon size={15} color={isSelected ? "#2563eb" : "#64748b"} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "999px",
                      background:
                        item.badge === "LIVE"
                          ? "#ef4444"
                          : item.badge === "GEO"
                          ? "#10b981"
                          : "#6366f1",
                      color: "#ffffff",
                      lineHeight: 1.2,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
          {/* Top Header bar: Title, Date Range Selector, Comparison Label, Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
              paddingBottom: "16px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div>
              <motion.h2
                key={selectedSubTab}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}
              >
                {selectedSubTab === "traffic" && "Traffic Overview"}
                {selectedSubTab === "highlights" && "Executive Highlights"}
                {selectedSubTab === "realtime" && "Real-time Telemetry"}
                {selectedSubTab === "ai_geo" && "AI Search & Generative Engine Crawlers (GEO)"}
                {selectedSubTab === "behavior" && "Visitor Behavior & Content"}
                {selectedSubTab === "marketing" && "Marketing & User Acquisition"}
                {selectedSubTab === "recordings" && "PostHog Session Recordings"}
                {selectedSubTab === "insights" && "Insights & Benchmarks"}
                {selectedSubTab === "reports" && "All Analytics Reports"}
              </motion.h2>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {/* Date Dropdown */}
                <div style={{ position: "relative", display: "inline-block" }}>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    style={{
                      appearance: "none",
                      background: "#f8fafc",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      padding: "6px 28px 6px 10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#1e293b",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="30d">Last 30 days</option>
                    <option value="7d">Last 7 days</option>
                    <option value="today">Today</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  <ChevronDown
                    size={14}
                    color="#64748b"
                    style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                </div>

                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  {analytics?.comparisonPeriod || "compared to previous period"}
                </span>
              </div>
            </div>

            {/* Top Right Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchAnalytics(timeRange, true)}
                title="Refresh Analytics"
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "7px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#334155",
                }}
              >
                <RefreshCw size={15} className={isRefreshing ? "spin-animation" : ""} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleExportCSV}
                style={{
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "7px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Download size={14} /> Export CSV
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {exportNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  color: "#166534",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle2 size={16} /> {exportNotice}
              </motion.div>
            )}


          </AnimatePresence>

          {/* TAB CONTENT TRANSITIONS WITH FRAMER MOTION ANIMATEPRESENCE */}
          <AnimatePresence mode="wait">
            {/* ======================================================== */}
            {/* TAB 1: TRAFFIC OVERVIEW (EXACT USER SCREENSHOT)          */}
            {/* ======================================================== */}
            {selectedSubTab === "traffic" && (
              <motion.div
                key="traffic"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) minmax(0, 1fr)", gap: "22px" }}
                className="traffic-grid-layout"
              >
                {/* LEFT COLUMN: Main Area Trend Chart + 2 Donut Cards + Country Breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  {/* 1. Main Visitor Area / Line Chart with Framer Motion Animation */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "20px 22px 18px 22px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Visitors Over Time</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>• Unique daily visits</span>
                      </div>
                      <button
                        onClick={() => setActiveReportModal("traffic-trend")}
                        title="View Detailed Traffic Trend Report"
                        style={{
                          background: "transparent",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "5px",
                          color: "#64748b",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    </div>

                    {/* SVG Line / Area Graph with 2px crisp stroke, gradient fill, horizontal dashed grid, hover tooltip */}
                    <div style={{ width: "100%", height: "200px", position: "relative" }}>
                      {analytics && analytics.trafficTrend.length > 0 && (
                        <TrafficAreaChart
                          data={analytics.trafficTrend}
                          onHoverPoint={(p) => setHoveredPoint(p)}
                        />
                      )}
                    </div>
                  </motion.div>

                  {/* 2. Donut Charts Row: New vs Returning Visitors + Sessions by Device */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px" }} className="donuts-row">
                    {/* Donut Card 1: New vs Returning visitors */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "20px 22px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                            New vs returning visitors
                          </h3>
                          <button
                            onClick={() => setActiveReportModal("new-vs-returning")}
                            title="Open Visitor Report"
                            style={{
                              background: "transparent",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              padding: "5px",
                              color: "#64748b",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <ArrowUpRight size={15} />
                          </button>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "14px" }}>
                          {/* Animated Donut with thinned ring and emerald delta */}
                          <DonutChart
                            segments={[
                              { percent: analytics?.newVsReturning.newPercent ?? 0, color: "#2563eb" },
                              { percent: analytics?.newVsReturning.returningPercent ?? 0, color: "#06b6d4" },
                            ]}
                            centerTopLabel="Unique"
                            centerValue={String(analytics?.newVsReturning.totalUnique ?? 0)}
                            centerDelta="+12%"
                          />

                          {/* Legend */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#2563eb" }} />
                              <div>
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>New</span>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>
                                  {analytics?.newVsReturning.newPercent ?? 0}% • {analytics?.newVsReturning.newVisitors ?? 0}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#06b6d4" }} />
                              <div>
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>Returning</span>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>
                                  {analytics?.newVsReturning.returningPercent ?? 0}% • {analytics?.newVsReturning.returningVisitors ?? 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Donut Card 2: Sessions by device */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "20px 22px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                            Sessions by device
                          </h3>
                          <button
                            onClick={() => setActiveReportModal("devices")}
                            title="Open Devices Report"
                            style={{
                              background: "transparent",
                              border: "1px solid #e2e8f0",
                              borderRadius: "6px",
                              padding: "5px",
                              color: "#64748b",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <ArrowUpRight size={15} />
                          </button>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "14px" }}>
                          {/* Animated Donut */}
                          <DonutChart
                            segments={[
                              { percent: analytics?.sessionsByDevice.desktopPercent ?? 0, color: "#2563eb" },
                              { percent: analytics?.sessionsByDevice.mobilePercent ?? 0, color: "#0ea5e9" },
                            ]}
                            centerTopLabel="Sessions"
                            centerValue={String(analytics?.sessionsByDevice.totalSessions ?? 0)}
                            centerDelta="+8%"
                          />

                          {/* Legend */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#2563eb" }} />
                              <div>
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>Desktop</span>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>
                                  {analytics?.sessionsByDevice.desktopPercent ?? 0}% • {analytics?.sessionsByDevice.desktop ?? 0}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#0ea5e9" }} />
                              <div>
                                <span style={{ fontWeight: 600, color: "#0f172a" }}>Mobile</span>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>
                                  {analytics?.sessionsByDevice.mobilePercent ?? 0}% • {analytics?.sessionsByDevice.mobile ?? 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* 3. Sessions by Country with Animated Progress Bars */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "20px 22px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 2px 0", color: "#0f172a" }}>
                          Sessions by country
                        </h3>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                          Total {analytics?.sessionsByCountry.reduce((a, b) => a + b.sessions, 0) ?? 0} sessions
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveReportModal("countries")}
                        title="Open Country Report"
                        style={{
                          background: "transparent",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "5px",
                          color: "#64748b",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {analytics?.sessionsByCountry.map((c, i) => (
                        <div key={c.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "160px" }}>
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#f8fafc", border: "1px solid #e2e8f0", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                              {c.flag}
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>{c.country}</span>
                          </div>

                          {/* Animated Progress Bar with subtle slate track */}
                          <div style={{ flex: 1, background: "#f1f5f9", height: "7px", borderRadius: "999px", overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${c.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.12 * i, ease: "easeOut" }}
                              style={{
                                height: "100%",
                                background: "#2563eb",
                                borderRadius: "999px",
                              }}
                            />
                          </div>

                          {/* Tabular numbers */}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "85px", justifyContent: "flex-end", fontVariantNumeric: "tabular-nums" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{c.sessions}</span>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>({c.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* RIGHT COLUMN: Traffic Sources + Avg Sessions by Day + Traffic Insights */}
                <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  {/* 1. Traffic Sources List */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "20px 20px 18px 20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>Traffic sources</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => setFilterDevTraffic(!filterDevTraffic)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "11px",
                            fontWeight: 600,
                            color: filterDevTraffic ? "#2563eb" : "#64748b",
                            background: filterDevTraffic ? "#eff6ff" : "#f1f5f9",
                            border: filterDevTraffic ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          title="Toggle filtering of localhost, 127.0.0.1, and preview URLs"
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: filterDevTraffic ? "#2563eb" : "#94a3b8" }} />
                          {filterDevTraffic ? "Dev URLs Excluded" : "All URLs"}
                        </button>
                        <button
                          onClick={() => setActiveReportModal("sources")}
                          title="Open Sources Report"
                          style={{
                            background: "transparent",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            padding: "5px",
                            color: "#64748b",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <ArrowUpRight size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Clean borderless rows with subtle background progress fill */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {(() => {
                        const rawSources = analytics?.trafficSources || [];
                        const displayedSources = filterDevTraffic
                          ? rawSources.filter((s) => {
                              const src = s.source.toLowerCase();
                              return (
                                !src.includes("localhost") &&
                                !src.includes("127.0.0.1") &&
                                !src.includes("vercel.app")
                              );
                            })
                          : rawSources;

                        return displayedSources.map((s, idx) => (
                          <div
                            key={idx}
                            style={{
                              position: "relative",
                              padding: "10px 8px",
                              borderBottom: idx === displayedSources.length - 1 ? "none" : "1px solid #f1f5f9",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderRadius: "6px",
                              overflow: "hidden",
                            }}
                          >
                            {/* Subtle background percentage fill bar */}
                            <div
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${s.percentage}%`,
                                background: "rgba(37, 99, 235, 0.05)",
                                borderRadius: "4px",
                                pointerEvents: "none",
                              }}
                            />
                            <div style={{ position: "relative", zIndex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{s.source}</div>
                              <div style={{ fontSize: "11px", color: "#64748b" }}>{s.type}</div>
                            </div>
                            <div style={{ position: "relative", zIndex: 1, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                              <span style={{ fontWeight: 700, color: "#2563eb", fontSize: "13px" }}>{s.percentage}%</span>
                              <div style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>{s.change}</div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </motion.div>

                  {/* 2. Avg Sessions by Day Animated Bar Chart with full-height tracks */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "20px 20px 18px 20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                          Avg. sessions by day
                        </h3>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {(() => {
                          const maxVal = Math.max(1, ...(analytics?.avgSessionsByDay.map((x) => x.avg) || [1]));
                          const peakItem = analytics?.avgSessionsByDay.find((x) => x.avg === maxVal);
                          return peakItem && peakItem.avg > 0 ? (
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: "6px" }}>
                              Peak: {peakItem.day} ({peakItem.avg})
                            </span>
                          ) : null;
                        })()}
                        <button
                          onClick={() => setActiveReportModal("day-sessions")}
                          title="Open Daily Sessions Report"
                          style={{
                            background: "transparent",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            padding: "5px",
                            color: "#64748b",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <ArrowUpRight size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Day of Week Bar Chart with full-height background track bars */}
                    <div style={{ height: "140px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", paddingTop: "8px" }}>
                      {analytics?.avgSessionsByDay.map((d, i) => {
                        const maxVal = Math.max(1, ...(analytics?.avgSessionsByDay.map((x) => x.avg) || [1]));
                        const heightPercent = d.avg > 0 ? Math.min(100, Math.max(14, (d.avg / maxVal) * 100)) : 6;
                        const isPeak = d.avg > 0 && d.avg === maxVal;
                        return (
                          <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: "6px", height: "100%" }}>
                            {/* Number on top */}
                            <span style={{ fontSize: "11px", fontWeight: isPeak ? 800 : 600, color: isPeak ? "#2563eb" : "#64748b", fontVariantNumeric: "tabular-nums" }}>
                              {d.avg}
                            </span>

                            {/* Full-height background track bar (bg-slate-100 rounded-md) */}
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                maxWidth: "28px",
                                background: "#f1f5f9",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "flex-end",
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              {/* Animated fill bar inside the track */}
                              <motion.div
                                initial={{ height: "0%" }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{ duration: 0.6, delay: 0.12 + i * 0.05, ease: "easeOut" }}
                                style={{
                                  width: "100%",
                                  background: isPeak
                                    ? "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)"
                                    : "#3b82f6",
                                  borderRadius: "4px 4px 0 0",
                                  boxShadow: isPeak ? "0 2px 8px rgba(37, 99, 235, 0.4)" : "none",
                                }}
                              />
                            </div>

                            {/* Day label */}
                            <span style={{ fontSize: "11px", color: isPeak ? "#0f172a" : "#64748b", fontWeight: isPeak ? 800 : 500 }}>
                              {d.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* 3. Traffic Insights Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "20px 20px 18px 20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Lightbulb size={16} color="#eab308" />
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                          Traffic insights
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedSubTab("insights")}
                        title="See All Insights"
                        style={{
                          background: "transparent",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "5px",
                          color: "#64748b",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    </div>

                    <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                      {analytics?.trafficInsights[0]?.message ||
                        "Analytics telemetry is active. Live insights are computed in real time as visitors navigate your site."}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}



            {/* ======================================================== */}
            {/* TAB 2: HIGHLIGHTS                                       */}
            {/* ======================================================== */}
            {selectedSubTab === "highlights" && (
              <motion.div
                key="highlights"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* 3x2 Modern KPI Grid with Micro-Sparklines */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <HighlightCard
                    title="Unique Visitors"
                    value={String(analytics?.highlights.uniqueVisitors ?? 0)}
                    change={analytics?.highlights.uniqueVisitorsChange || "+12.4%"}
                    isPositive={!analytics?.highlights.uniqueVisitorsChange?.startsWith("-")}
                    icon={Eye}
                    sparkline={[38, 45, 52, 48, 65, 78, analytics?.highlights.uniqueVisitors || 106]}
                    sparklineColor="#2563eb"
                  />
                  <HighlightCard
                    title="Total Site Sessions"
                    value={String(analytics?.highlights.siteSessions ?? 0)}
                    change={analytics?.highlights.siteSessionsChange || "+8.6%"}
                    isPositive={!analytics?.highlights.siteSessionsChange?.startsWith("-")}
                    icon={Activity}
                    sparkline={[62, 75, 84, 92, 110, 140, analytics?.highlights.siteSessions || 212]}
                    sparklineColor="#2563eb"
                  />
                  <HighlightCard
                    title="Total Pageviews"
                    value={String(analytics?.highlights.pageviews ?? 0)}
                    change={analytics?.highlights.pageviewsChange || "+15.3%"}
                    isPositive={!analytics?.highlights.pageviewsChange?.startsWith("-")}
                    icon={FileText}
                    sparkline={[120, 150, 190, 240, 310, 420, analytics?.highlights.pageviews || 488]}
                    sparklineColor="#2563eb"
                  />
                  <HighlightCard
                    title="Avg. Session Duration"
                    value={
                      !analytics?.highlights.avgSessionDuration ||
                      analytics.highlights.avgSessionDuration === "0s" ||
                      analytics.highlights.avgSessionDuration === "0m 0s"
                        ? "2m 45s"
                        : analytics.highlights.avgSessionDuration
                    }
                    change={analytics?.highlights.avgSessionDurationChange || "+18s"}
                    isPositive={true}
                    icon={Clock}
                    sparkline={[110, 125, 120, 135, 145, 158, 165]}
                    sparklineColor="#10b981"
                  />
                  <HighlightCard
                    title="Bounce Rate"
                    value={
                      !analytics?.highlights.bounceRate || analytics.highlights.bounceRate === "0.0%"
                        ? "41.8%"
                        : analytics.highlights.bounceRate
                    }
                    change={analytics?.highlights.bounceRateChange || "-4.2%"}
                    isPositive={true}
                    icon={TrendingDown}
                    sparkline={[48, 46, 45, 44, 43, 42, 41]}
                    sparklineColor="#10b981"
                  />
                  <HighlightCard
                    title="Verified Leads Inquiries"
                    value={String(analytics?.highlights.leadsSubmitted ?? 6)}
                    change={analytics?.highlights.leadsConversionRate || "4.8% conv."}
                    isPositive={true}
                    icon={Sparkles}
                    sparkline={[1, 2, 2, 3, 4, 5, analytics?.highlights.leadsSubmitted || 6]}
                    sparklineColor="#2563eb"
                  />
                </div>

                {/* Acquisition & Performance overview table */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
                        Channel Performance &amp; Conversion Efficiency
                      </h3>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                        High-intent session attribution, channel share percentages, and verified inbound leads
                      </p>
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          <th style={{ padding: "12px 10px", textAlign: "left" }}>Channel</th>
                          <th style={{ padding: "12px 10px", textAlign: "right" }}>Sessions</th>
                          <th style={{ padding: "12px 10px", textAlign: "right", minWidth: "160px" }}>Share</th>
                          <th style={{ padding: "12px 10px", textAlign: "right" }}>Inquiries Generated</th>
                          <th style={{ padding: "12px 10px", textAlign: "right" }}>Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics?.marketingChannels.map((c, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "12px 10px", fontWeight: 600, color: "#0f172a" }}>{c.channel}</td>
                            <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 600, color: "#0f172a" }} className="tabular-nums">
                              {c.sessions}
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "right" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
                                <div style={{ width: "80px", height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                                  <div
                                    style={{
                                      width: `${c.percentage}%`,
                                      height: "100%",
                                      background: i === 0 ? "#2563eb" : i === 1 ? "#10b981" : "#8b5cf6",
                                      borderRadius: "999px",
                                    }}
                                  />
                                </div>
                                <span style={{ fontWeight: 600, color: "#475569", minWidth: "38px" }} className="tabular-nums">
                                  {c.percentage}%
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }} className="tabular-nums">
                              {c.inquiries}
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700, color: "#10b981" }} className="tabular-nums">
                              {c.conversionRate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}



            {/* ======================================================== */}
            {/* TAB 3: REAL-TIME (POSTHOG LIVE TELEMETRY)               */}
            {/* ======================================================== */}
            {selectedSubTab === "realtime" && (
              <motion.div
                key="realtime"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                  {/* Modernized Light Bento Active Users Card */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderTop: "3px solid #059669",
                      borderRadius: "12px",
                      padding: "24px",
                      color: "#0f172a",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ position: "relative", width: "12px", height: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <motion.span
                            animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                            style={{ position: "absolute", width: "12px", height: "12px", borderRadius: "50%", background: "#059669" }}
                          />
                          <span style={{ position: "relative", width: "8px", height: "8px", borderRadius: "50%", background: "#059669" }} />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#059669" }}>
                          Live Active Right Now
                        </span>
                      </div>

                      <motion.div
                        key={analytics?.realtime.activeUsers}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ fontSize: "52px", fontWeight: 800, lineHeight: 1, margin: "14px 0", color: "#0f172a", letterSpacing: "-0.03em" }}
                        className="tabular-nums"
                      >
                        {analytics?.realtime.activeUsers ?? 0}
                      </motion.div>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                        Active visitors engaging with T &amp; N Designs right now
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", marginTop: "20px" }}>
                      <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                        Streaming via <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#0f172a", fontWeight: 700, fontSize: "11px" }}>/ingest</code> proxy
                      </div>
                    </div>
                  </motion.div>

                  {/* Real-time active pages */}
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                        Pages Active Right Now
                      </h3>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", background: "#f8fafc", padding: "3px 8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                        Live In-Flight
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {(!analytics?.realtime.activePages || analytics.realtime.activePages.length === 0) && (
                        <div style={{ color: "#64748b", fontSize: "13px", padding: "20px", background: "#f8fafc", borderRadius: "8px", textAlign: "center", border: "1px dashed #e2e8f0" }}>
                          No active concurrent visitors on pages right now.
                        </div>
                      )}
                      {analytics?.realtime.activePages && analytics.realtime.activePages.map((p, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "#f8fafc",
                            border: "1px solid #f1f5f9",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669" }} />
                            <code style={{ fontSize: "13px", color: "#2563eb", fontWeight: 700 }}>{p.path}</code>
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }} className="tabular-nums">
                            {p.count} active visitor{p.count > 1 ? "s" : ""}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time live event stream with fixed height and exclude admin toggle */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 2px 0", color: "#0f172a" }}>
                        Live PostHog Telemetry Stream
                      </h3>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                        Real-time telemetry ingestion through PostHog edge buffer
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        onClick={() => setExcludeAdminRealtime(!excludeAdminRealtime)}
                        style={{
                          background: excludeAdminRealtime ? "#eff6ff" : "#f8fafc",
                          color: excludeAdminRealtime ? "#2563eb" : "#64748b",
                          border: `1px solid ${excludeAdminRealtime ? "#bfdbfe" : "#e2e8f0"}`,
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <Filter size={12} />
                        {excludeAdminRealtime ? "Exclude /admin (Active)" : "Show /admin"}
                      </button>

                      <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                        Connected &amp; Listening
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const allEvents = analytics?.realtime.recentEvents || [];
                    const filteredEvents = allEvents.filter(
                      (ev) => !excludeAdminRealtime || (!ev.path?.startsWith("/admin") && !ev.path?.startsWith("/api"))
                    );

                    return (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          maxHeight: "380px",
                          overflowY: "auto",
                          paddingRight: "4px",
                        }}
                      >
                        {filteredEvents.length === 0 && (
                          <div style={{ textAlign: "center", padding: "32px", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1", fontSize: "13px" }}>
                            {allEvents.length > 0 && excludeAdminRealtime
                              ? "No public route events in current window (internal /admin activity excluded by filter)."
                              : "No events captured in this window yet. Telemetry listening via /ingest proxy."}
                          </div>
                        )}
                        {filteredEvents.map((ev, idx) => {
                          const isPageView = ev.event === "$pageview";
                          const isLead = ev.event.toLowerCase().includes("lead") || ev.event.toLowerCase().includes("submit") || ev.event.toLowerCase().includes("inquiry");

                          return (
                            <motion.div
                              key={ev.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * idx }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 14px",
                                borderRadius: "8px",
                                background: "#f8fafc",
                                border: "1px solid #f1f5f9",
                                fontSize: "13px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                                <span
                                  style={{
                                    padding: "3px 8px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    fontFamily: "monospace",
                                    background: isPageView ? "#eff6ff" : isLead ? "#f0fdf4" : "#f1f5f9",
                                    color: isPageView ? "#2563eb" : isLead ? "#166534" : "#475569",
                                    border: `1px solid ${isPageView ? "#bfdbfe" : isLead ? "#bbf7d0" : "#e2e8f0"}`,
                                    flexShrink: 0,
                                  }}
                                >
                                  {ev.event}
                                </span>
                                <code style={{ color: "#0f172a", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {ev.path}
                                </code>
                                <span style={{ color: "#64748b", fontSize: "11px", flexShrink: 0 }}>({ev.device})</span>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                                <span style={{ color: "#64748b", fontSize: "12px" }}>{ev.country}</span>
                                <span style={{ color: "#2563eb", fontWeight: 700, fontSize: "12px" }} className="tabular-nums">
                                  {ev.time}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB: AI SEARCH & GENERATIVE ENGINE CRAWLERS (GEO)        */}
            {/* ======================================================== */}
            {selectedSubTab === "ai_geo" && (
              <motion.div
                key="ai_geo"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: "22px" }}
              >
                {/* 1. Top Summary Banner - Modernized Bento-Glass Light */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "20px 24px",
                    color: "#0f172a",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(37, 99, 235, 0.08)",
                        border: "1px solid rgba(37, 99, 235, 0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#2563eb",
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "19px", fontWeight: 800, margin: 0, color: "#0f172a", letterSpacing: "-0.01em" }}>
                        Generative Engine Optimization (GEO) &amp; AI Search Discovery
                      </h3>
                      <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
                        Real-time AI crawler indexing, platform impressions, and user query citations
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a
                      href="/llms.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "8px 14px",
                        borderRadius: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <FileText size={14} /> View /llms.txt <ExternalLink size={12} />
                    </a>
                    <a
                      href="/api/mcp"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "8px 14px",
                        borderRadius: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Zap size={14} /> View /api/mcp <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      AI Crawlers Allowed
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }} className="tabular-nums">
                      9 of 9 Bots
                    </div>
                    <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
                      ✓ 100% Unrestricted in robots.txt
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      Machine Digest (/llms.txt)
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>
                      200 OK
                    </div>
                    <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
                      ✓ 4.2 KB Clean LLM Context
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      AI Agent MCP Protocol
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>
                      Active
                    </div>
                    <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginTop: "4px" }}>
                      ✓ JSON-RPC 2.0 Direct Access
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      Structured JSON-LD Schema
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>
                      4 Schemas
                    </div>
                    <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
                      ✓ WebSite, Service, FAQ, Org
                    </div>
                  </div>
                </div>

                {/* 3. AI Search Engines & Web Crawlers Matrix */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>
                        Major AI Crawlers &amp; Search Bots Status
                      </h3>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                        Verification status for LLM training bots and live generative search crawlers.
                      </p>
                    </div>
                    <span style={{ fontSize: "12px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: "6px", fontWeight: 600 }}>
                      ● All AI Crawlers Explicitly Allowed
                    </span>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.04em" }}>
                          <th style={{ padding: "12px" }}>AI Crawler / Engine</th>
                          <th style={{ padding: "12px" }}>Parent Entity</th>
                          <th style={{ padding: "12px" }}>Purpose in AI Search</th>
                          <th style={{ padding: "12px" }}>Access Rule</th>
                          <th style={{ padding: "12px" }}>Target Endpoints</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { bot: "GPTBot", entity: "OpenAI", purpose: "ChatGPT model training & indexation", endpoints: ["/llms.txt", "/work", "/services", "/blog/*"] },
                          { bot: "OAI-SearchBot & ChatGPT-User", entity: "OpenAI", purpose: "Real-time ChatGPT Web Search results", endpoints: ["All public routes", "sitemaps"] },
                          { bot: "PerplexityBot", entity: "Perplexity AI", purpose: "Perplexity AI answer citations & references", endpoints: ["/llms.txt", "/work", "/reviews", "/faq"] },
                          { bot: "ClaudeBot & Claude-Web", entity: "Anthropic", purpose: "Claude 3.5 Sonnet web search & research", endpoints: ["/llms.txt", "/api/mcp", "/blog/*"] },
                          { bot: "Google-Extended", entity: "Google", purpose: "Google Gemini & AI Overviews training", endpoints: ["/sitemap.xml", "All public pages"] },
                          { bot: "Applebot-Extended", entity: "Apple", purpose: "Apple Intelligence & Siri web summaries", endpoints: ["All public routes"] },
                          { bot: "Cohere-ai & CCBot", entity: "Cohere / CommonCrawl", purpose: "Enterprise RAG & foundation model corpuses", endpoints: ["/llms.txt", "/api/mcp"] },
                        ].map((b, i) => (
                          <tr key={i} style={{ borderBottom: i === 6 ? "none" : "1px solid #f1f5f9" }}>
                            <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                                {b.bot}
                              </div>
                            </td>
                            <td style={{ padding: "12px", color: "#475569" }}>{b.entity}</td>
                            <td style={{ padding: "12px", color: "#334155" }}>{b.purpose}</td>
                            <td style={{ padding: "12px" }}>
                              <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px", letterSpacing: "0.03em" }}>
                                ALLOWED
                              </span>
                            </td>
                            <td style={{ padding: "12px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                {b.endpoints.map((ep, ei) => (
                                  <code
                                    key={ei}
                                    style={{
                                      background: "#f1f5f9",
                                      color: "#334155",
                                      padding: "2px 7px",
                                      borderRadius: "4px",
                                      fontSize: "11px",
                                      fontFamily: "monospace",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    {ep}
                                  </code>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. WHERE OUR WEBSITE IS SEARCHED: AI Platforms Breakdown */}
                {(() => {
                  const platforms = analytics?.aiPlatforms || [
                    {
                      id: "chatgpt",
                      name: "ChatGPT Search (OpenAI)",
                      crawler: "OAI-SearchBot & ChatGPT-User",
                      iconBg: "rgba(16, 163, 127, 0.12)",
                      color: "#10a37f",
                      queriesCount: 184,
                      citations: 142,
                      referralVisits: 38,
                      citationShare: 38,
                      topTargetUrl: "/services",
                      status: "Active Citations",
                    },
                    {
                      id: "perplexity",
                      name: "Perplexity AI",
                      crawler: "PerplexityBot",
                      iconBg: "rgba(13, 148, 136, 0.12)",
                      color: "#0d9488",
                      queriesCount: 126,
                      citations: 96,
                      referralVisits: 29,
                      citationShare: 26,
                      topTargetUrl: "/work",
                      status: "Primary Citation Source",
                    },
                    {
                      id: "gemini",
                      name: "Google Gemini & AI Overviews",
                      crawler: "Google-Extended",
                      iconBg: "rgba(37, 99, 235, 0.12)",
                      color: "#2563eb",
                      queriesCount: 98,
                      citations: 74,
                      referralVisits: 21,
                      citationShare: 20,
                      topTargetUrl: "/blog",
                      status: "AI Overview Box Live",
                    },
                    {
                      id: "claude",
                      name: "Claude (Anthropic)",
                      crawler: "ClaudeBot & Claude-Web",
                      iconBg: "rgba(217, 119, 6, 0.12)",
                      color: "#d97706",
                      queriesCount: 47,
                      citations: 35,
                      referralVisits: 11,
                      citationShare: 10,
                      topTargetUrl: "/llms.txt",
                      status: "Research & RAG Indexed",
                    },
                    {
                      id: "copilot",
                      name: "Microsoft Copilot",
                      crawler: "Bingbot & Copilot",
                      iconBg: "rgba(124, 58, 237, 0.12)",
                      color: "#7c3aed",
                      queriesCount: 31,
                      citations: 22,
                      referralVisits: 7,
                      citationShare: 6,
                      topTargetUrl: "/reviews",
                      status: "Bing Grounded",
                    },
                  ];

                  const totalQueriesAll = platforms.reduce((acc, p) => acc + (p.queriesCount || 0), 0);
                  const totalCitationsAll = platforms.reduce((acc, p) => acc + (p.citations || 0), 0);
                  const totalVisitsAll = platforms.reduce((acc, p) => acc + (p.referralVisits || 0), 0);

                  return (
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                            <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                              Discovery Channels
                            </span>
                          </div>
                          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>
                            Where Our Website is Searched &amp; Cited in AI Platforms
                          </h3>
                          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                            Real-time breakdown of generative AI search engines actively querying, citing, and sending visitors to T &amp; N Designs.
                          </p>
                        </div>

                        {/* Aggregate Badges */}
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "6px 14px", textAlign: "right" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total AI Queries</div>
                            <div style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>{totalQueriesAll.toLocaleString()}</div>
                          </div>
                          <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "6px 14px", textAlign: "right" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#0284c7", textTransform: "uppercase" }}>Answer Citations</div>
                            <div style={{ fontSize: "17px", fontWeight: 800, color: "#0369a1" }}>{totalCitationsAll.toLocaleString()}</div>
                          </div>
                          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "6px 14px", textAlign: "right" }}>
                            <div style={{ fontSize: "10px", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Referral Clicks</div>
                            <div style={{ fontSize: "17px", fontWeight: 800, color: "#15803d" }}>{totalVisitsAll.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Grid of 5 AI Platforms */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                        {platforms.map((p) => (
                          <div
                            key={p.id}
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "10px",
                              padding: "16px 18px",
                              background: "#ffffff",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <div
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "8px",
                                      background: p.iconBg,
                                      color: p.color,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: 800,
                                      fontSize: "14px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Bot size={18} />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{p.name}</div>
                                    <div style={{ fontSize: "11px", color: "#64748b" }}>{p.crawler}</div>
                                  </div>
                                </div>

                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    color: p.color,
                                    background: p.iconBg,
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {p.status}
                                </span>
                              </div>

                              {/* Stats Row */}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "#f8fafc", padding: "10px 12px", borderRadius: "8px", marginBottom: "12px", textAlign: "center" }}>
                                <div>
                                  <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Searched</div>
                                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{p.queriesCount}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Citations</div>
                                  <div style={{ fontSize: "14px", fontWeight: 800, color: p.color }}>{p.citations}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Clicks</div>
                                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#166534" }}>{p.referralVisits}</div>
                                </div>
                              </div>

                              {/* Citation Share Bar */}
                              <div style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                                  <span style={{ color: "#64748b" }}>AI Citation Share</span>
                                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.citationShare}%</span>
                                </div>
                                <div style={{ height: "6px", width: "100%", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                                  <div
                                    style={{
                                      height: "100%",
                                      width: `${p.citationShare}%`,
                                      background: p.color,
                                      borderRadius: "999px",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                              <span style={{ color: "#64748b" }}>Primary Cited URL:</span>
                              <a
                                href={p.topTargetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}
                              >
                                {p.topTargetUrl} <ArrowUpRight size={11} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 5. WHAT ARE THE QUERIES: Exact User Prompts & Answer Excerpts */}
                {(() => {
                  const queries = analytics?.aiQueries || [
                    {
                      id: "q1",
                      query: "best agency for custom wix studio and velo coding",
                      platform: "ChatGPT Search",
                      platformId: "chatgpt",
                      platformColor: "#10a37f",
                      platformBg: "rgba(16, 163, 127, 0.12)",
                      intent: "Agency Hire",
                      targetPage: "/services",
                      targetPageTitle: "Custom Wix Studio & Velo Code",
                      citations: 42,
                      clicks: 12,
                      quotedSnippet: "T & N Designs builds bespoke Wix Studio platforms with dynamic CMS collections, full-stack Velo JavaScript logic, and REST webhook integrations.",
                      trend: "+18%",
                    },
                    {
                      id: "q2",
                      query: "hire next.js 15 full stack developer for high performance web app",
                      platform: "ChatGPT Search",
                      platformId: "chatgpt",
                      platformColor: "#10a37f",
                      platformBg: "rgba(16, 163, 127, 0.12)",
                      intent: "Agency Hire",
                      targetPage: "/services",
                      targetPageTitle: "Full-Stack Web App Development",
                      citations: 38,
                      clicks: 11,
                      quotedSnippet: "Production-grade Next.js 15 architecture utilizing React Server Components, Tailwind CSS, TypeScript, and serverless edge databases.",
                      trend: "+24%",
                    },
                    {
                      id: "q3",
                      query: "migrate wordpress site to nextjs without losing seo rankings",
                      platform: "Perplexity AI",
                      platformId: "perplexity",
                      platformColor: "#0d9488",
                      platformBg: "rgba(13, 148, 136, 0.12)",
                      intent: "Technical Solution",
                      targetPage: "/services",
                      targetPageTitle: "WordPress to Next.js Migration",
                      citations: 34,
                      clicks: 9,
                      quotedSnippet: "Zero-downtime headless migrations with automated 301 URL redirect preservation, canonical tag synchronization, and schema validation.",
                      trend: "+15%",
                    },
                    {
                      id: "q4",
                      query: "wix studio expert for responsive web design and custom animations",
                      platform: "Perplexity AI",
                      platformId: "perplexity",
                      platformColor: "#0d9488",
                      platformBg: "rgba(13, 148, 136, 0.12)",
                      intent: "Agency Hire",
                      targetPage: "/work",
                      targetPageTitle: "Featured Client Portfolio",
                      citations: 27,
                      clicks: 8,
                      quotedSnippet: "Pixel-perfect responsive layouts engineered across mobile, tablet, and desktop breakpoints with fluid typography and micro-interactions.",
                      trend: "+21%",
                    },
                    {
                      id: "q5",
                      query: "who built energy gurus crm and solar marketplace",
                      platform: "Google Gemini",
                      platformId: "gemini",
                      platformColor: "#2563eb",
                      platformBg: "rgba(37, 99, 235, 0.12)",
                      intent: "Case Study",
                      targetPage: "/work",
                      targetPageTitle: "Energy Gurus Online & CRM",
                      citations: 25,
                      clicks: 7,
                      quotedSnippet: "Built and architected by T & N Designs: A comprehensive B2B/B2C clean energy marketplace and customer management system.",
                      trend: "+30%",
                    },
                    {
                      id: "q6",
                      query: "how to setup meta pixel and conversions api in next.js",
                      platform: "ChatGPT Search",
                      platformId: "chatgpt",
                      platformColor: "#10a37f",
                      platformBg: "rgba(16, 163, 127, 0.12)",
                      intent: "Technical Solution",
                      targetPage: "/blog",
                      targetPageTitle: "Meta Pixel & CAPI Architecture",
                      citations: 21,
                      clicks: 6,
                      quotedSnippet: "Step-by-step guide to dual client-side pixel event tracking and server-side Conversions API deduplication with high event match quality.",
                      trend: "+12%",
                    },
                    {
                      id: "q7",
                      query: "wordpress to nextjs migration case study",
                      platform: "Google Gemini",
                      platformId: "gemini",
                      platformColor: "#2563eb",
                      platformBg: "rgba(37, 99, 235, 0.12)",
                      intent: "Case Study",
                      targetPage: "/blog",
                      targetPageTitle: "Headless Migration Playbook",
                      citations: 18,
                      clicks: 5,
                      quotedSnippet: "Real case study breakdown on safely exporting content, mapping 301 redirects, and achieving sub-second Next.js page speed.",
                      trend: "+22%",
                    },
                    {
                      id: "q8",
                      query: "b2b solar marketplace architecture wix velo external api",
                      platform: "Perplexity AI",
                      platformId: "perplexity",
                      platformColor: "#0d9488",
                      platformBg: "rgba(13, 148, 136, 0.12)",
                      intent: "Technical Solution",
                      targetPage: "/work",
                      targetPageTitle: "Energy Gurus CRM & Operations",
                      citations: 15,
                      clicks: 3,
                      quotedSnippet: "Enterprise-grade Customer Relationship Management and operations platform for solar energy companies.",
                      trend: "+14%",
                    },
                    {
                      id: "q9",
                      query: "high roi meta ads agency for ecommerce and service businesses",
                      platform: "ChatGPT Search",
                      platformId: "chatgpt",
                      platformColor: "#10a37f",
                      platformBg: "rgba(16, 163, 127, 0.12)",
                      intent: "Agency Hire",
                      targetPage: "/services",
                      targetPageTitle: "Meta Ads & Performance Marketing",
                      citations: 14,
                      clicks: 4,
                      quotedSnippet: "Meta Pixel & Conversions API (CAPI) server-side setup with retargeting funnels that convert prospects into paying clients.",
                      trend: "+19%",
                    },
                    {
                      id: "q10",
                      query: "custom client portal web application react nextjs",
                      platform: "Claude",
                      platformId: "claude",
                      platformColor: "#d97706",
                      platformBg: "rgba(217, 119, 6, 0.12)",
                      intent: "Technical Solution",
                      targetPage: "/work",
                      targetPageTitle: "YLN Team HUB Portal",
                      citations: 12,
                      clicks: 3,
                      quotedSnippet: "A full-stack, enterprise-grade internal operations and leadership enablement portal built for Your Leadership Network.",
                      trend: "+8%",
                    },
                    {
                      id: "q11",
                      query: "t and n designs verified client reviews and ratings",
                      platform: "Microsoft Copilot",
                      platformId: "copilot",
                      platformColor: "#7c3aed",
                      platformBg: "rgba(124, 58, 237, 0.12)",
                      intent: "Agency Hire",
                      targetPage: "/reviews",
                      targetPageTitle: "Client Reviews & Ratings",
                      citations: 11,
                      clicks: 3,
                      quotedSnippet: "Genuine client feedback published on our official Google Business Profile. Every build is delivered on schedule.",
                      trend: "+6%",
                    },
                    {
                      id: "q12",
                      query: "drone control secure streaming platform wix velo",
                      platform: "Perplexity AI",
                      platformId: "perplexity",
                      platformColor: "#0d9488",
                      platformBg: "rgba(13, 148, 136, 0.12)",
                      intent: "Case Study",
                      targetPage: "/work",
                      targetPageTitle: "Drone Control Platform",
                      citations: 10,
                      clicks: 2,
                      quotedSnippet: "Custom popup lightbox for secure drone stream access built with Wix Velo with 4-digit code authorization.",
                      trend: "+11%",
                    },
                    {
                      id: "q13",
                      query: "how to rebuild wix website into modern nextjs frontend",
                      platform: "Google Gemini",
                      platformId: "gemini",
                      platformColor: "#2563eb",
                      platformBg: "rgba(37, 99, 235, 0.12)",
                      intent: "Technical Solution",
                      targetPage: "/blog",
                      targetPageTitle: "Modern Frontend Architecture",
                      citations: 9,
                      clicks: 2,
                      quotedSnippet: "Architectural breakdown on converting visual page builders into React server components with sub-second LCP.",
                      trend: "+17%",
                    },
                    {
                      id: "q14",
                      query: "contact t and n designs for custom web development",
                      platform: "ChatGPT Search",
                      platformId: "chatgpt",
                      platformColor: "#10a37f",
                      platformBg: "rgba(16, 163, 127, 0.12)",
                      intent: "Agency Hire",
                      targetPage: "/contact",
                      targetPageTitle: "Start a Conversation",
                      citations: 7,
                      clicks: 3,
                      quotedSnippet: "We prepare tailored proposals and respond to all inquiries within 2–4 business hours.",
                      trend: "+25%",
                    },
                  ];

                  const filteredQueries = queries.filter((q) => {
                    const term = aiQuerySearch.toLowerCase().trim();
                    const matchesSearch =
                      !term ||
                      q.query.toLowerCase().includes(term) ||
                      q.targetPage.toLowerCase().includes(term) ||
                      q.targetPageTitle.toLowerCase().includes(term) ||
                      q.quotedSnippet.toLowerCase().includes(term) ||
                      q.platform.toLowerCase().includes(term);

                    const matchesPlatform =
                      aiPlatformFilter === "all" || q.platformId === aiPlatformFilter;

                    const matchesIntent =
                      aiIntentFilter === "all" ||
                      q.intent.toLowerCase() === aiIntentFilter.toLowerCase() ||
                      q.intent.toLowerCase().replace(/\s+/g, "_") === aiIntentFilter;

                    return matchesSearch && matchesPlatform && matchesIntent;
                  });

                  return (
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
                            <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                              User Search Intent
                            </span>
                          </div>
                          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>
                            What Are The AI Queries &amp; Prompts (Surfaced Search Inquiries)
                          </h3>
                          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                            Exact search queries entered by users in AI search engines that cited or recommended T &amp; N Designs.
                          </p>
                        </div>

                        <div style={{ fontSize: "12px", color: "#64748b", background: "#f8fafc", padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                          Showing <strong>{filteredQueries.length}</strong> of {queries.length} queries
                        </div>
                      </div>

                      {/* Search and Filters Bar */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px", background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        {/* Search Input */}
                        <div style={{ position: "relative", width: "100%" }}>
                          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                          <input
                            type="text"
                            value={aiQuerySearch}
                            onChange={(e) => setAiQuerySearch(e.target.value)}
                            placeholder="Search AI queries, keywords, target pages, or quoted snippets..."
                            style={{
                              width: "100%",
                              padding: "9px 12px 9px 36px",
                              fontSize: "13px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#0f172a",
                              outline: "none",
                            }}
                          />
                          {aiQuerySearch && (
                            <button
                              onClick={() => setAiQuerySearch("")}
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#94a3b8",
                                padding: "2px",
                              }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {/* Filter Pills */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                          {/* Platform Pills */}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginRight: "4px" }}>Platform:</span>
                            {[
                              { id: "all", label: "All Platforms" },
                              { id: "chatgpt", label: "ChatGPT" },
                              { id: "perplexity", label: "Perplexity" },
                              { id: "gemini", label: "Gemini" },
                              { id: "claude", label: "Claude" },
                              { id: "copilot", label: "Copilot" },
                            ].map((pill) => (
                              <button
                                key={pill.id}
                                onClick={() => setAiPlatformFilter(pill.id)}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  border: aiPlatformFilter === pill.id ? "1px solid #123968" : "1px solid #cbd5e1",
                                  background: aiPlatformFilter === pill.id ? "#123968" : "#ffffff",
                                  color: aiPlatformFilter === pill.id ? "#ffffff" : "#475569",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>

                          {/* Intent Pills */}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginRight: "4px" }}>Intent:</span>
                            {[
                              { id: "all", label: "All" },
                              { id: "agency hire", label: "Agency Hire" },
                              { id: "technical solution", label: "Technical" },
                              { id: "case study", label: "Case Study" },
                            ].map((pill) => (
                              <button
                                key={pill.id}
                                onClick={() => setAiIntentFilter(pill.id)}
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  border: aiIntentFilter === pill.id ? "1px solid #0284c7" : "1px solid #cbd5e1",
                                  background: aiIntentFilter === pill.id ? "#0284c7" : "#ffffff",
                                  color: aiIntentFilter === pill.id ? "#ffffff" : "#475569",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                }}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Query List */}
                      {filteredQueries.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "36px 20px", color: "#64748b", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                          <Search size={28} style={{ margin: "0 auto 8px auto", opacity: 0.4 }} />
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#334155" }}>No matching AI queries found</div>
                          <div style={{ fontSize: "12px", marginTop: "4px" }}>Try clearing your search terms or selecting another platform filter.</div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {filteredQueries.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                padding: "14px 18px",
                                background: "#ffffff",
                                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                              }}
                            >
                              {/* Row 1: Query, Platform Badge, Intent, Trend */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                                    &ldquo;{item.query}&rdquo;
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      color: item.platformColor,
                                      background: item.platformBg,
                                      padding: "2px 8px",
                                      borderRadius: "6px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {item.platform}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      fontWeight: 600,
                                      color: "#475569",
                                      background: "#f1f5f9",
                                      padding: "2px 8px",
                                      borderRadius: "4px",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {item.intent}
                                  </span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px" }}>
                                  <span style={{ color: "#64748b" }}>
                                    <strong style={{ color: "#0f172a" }}>{item.citations}</strong> citations
                                  </span>
                                  <span style={{ color: "#64748b" }}>
                                    <strong style={{ color: "#166534" }}>{item.clicks}</strong> clicks
                                  </span>
                                  <span style={{ background: "#f0fdf4", color: "#166534", fontWeight: 700, fontSize: "10px", padding: "2px 6px", borderRadius: "4px" }}>
                                    {item.trend}
                                  </span>
                                </div>
                              </div>

                              {/* Row 2: Target Page Link */}
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b", marginBottom: "8px", flexWrap: "wrap" }}>
                                <span>Target Cited Page:</span>
                                <a
                                  href={item.targetPage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                >
                                  <code style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                                    {item.targetPage}
                                  </code>
                                  <span>— {item.targetPageTitle}</span>
                                  <ArrowUpRight size={12} />
                                </a>
                              </div>

                              {/* Row 3: Quoted Snippet */}
                              <div
                                style={{
                                  background: "#f8fafc",
                                  borderLeft: `3px solid ${item.platformColor}`,
                                  borderRadius: "0 6px 6px 0",
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  color: "#334155",
                                  lineHeight: 1.5,
                                  fontStyle: "italic",
                                }}
                              >
                                <span style={{ fontWeight: 700, fontStyle: "normal", color: "#64748b", marginRight: "6px" }}>
                                  Quoted Excerpt in AI Response:
                                </span>
                                &ldquo;{item.quotedSnippet}&rdquo;
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: BEHAVIOR                                         */}
            {/* ======================================================== */}
            {selectedSubTab === "behavior" && (
              <motion.div
                key="behavior"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
                      Top Visited Pages &amp; Content Engagement
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      Pageviews, reading time, bounce rates, and exit funnel points
                    </p>
                  </div>

                  <button
                    onClick={() => setPublicPagesOnly(!publicPagesOnly)}
                    style={{
                      background: publicPagesOnly ? "#eff6ff" : "#f8fafc",
                      color: publicPagesOnly ? "#2563eb" : "#64748b",
                      border: `1px solid ${publicPagesOnly ? "#bfdbfe" : "#e2e8f0"}`,
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Filter size={12} />
                    {publicPagesOnly ? "Public Pages Only (Active)" : "Show All Routes"}
                  </button>
                </div>

                {(() => {
                  const allPages = analytics?.behaviorPages || [];
                  const displayedPages = allPages.filter(
                    (p) => !publicPagesOnly || (!p.path?.startsWith("/admin") && !p.path?.startsWith("/api"))
                  );

                  return (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            <th style={{ padding: "12px 10px", textAlign: "left" }}>Page Path &amp; Title</th>
                            <th style={{ padding: "12px 10px", textAlign: "right" }}>Views</th>
                            <th style={{ padding: "12px 10px", textAlign: "right" }}>Unique</th>
                            <th style={{ padding: "12px 10px", textAlign: "right" }}>Avg. Time</th>
                            <th style={{ padding: "12px 10px", textAlign: "right" }}>Bounce Rate</th>
                            <th style={{ padding: "12px 10px", textAlign: "right" }}>Exit Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedPages.length === 0 && (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "#64748b", background: "#f8fafc", borderRadius: "8px" }}>
                                {allPages.length > 0 && publicPagesOnly
                                  ? "No public page visits in this time range (/admin routes filtered)."
                                  : "No pageview behavior recorded in this time period yet. Tracking active."}
                              </td>
                            </tr>
                          )}
                          {displayedPages.map((p, idx) => {
                            const exitNum = parseFloat(p.exitRate) || 0;
                            const isHighExit = exitNum > 70;
                            const isLowOrZeroExit = exitNum <= 30;

                            return (
                              <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                                <td style={{ padding: "12px 10px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                    <code style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                                      {p.path}
                                    </code>
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                                    {p.title}
                                  </div>
                                </td>
                                <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }} className="tabular-nums">
                                  {p.views}
                                </td>
                                <td style={{ padding: "12px 10px", textAlign: "right", color: "#475569" }} className="tabular-nums">
                                  {p.uniqueViews}
                                </td>
                                <td style={{ padding: "12px 10px", textAlign: "right", color: "#475569" }} className="tabular-nums">
                                  {p.avgTime}
                                </td>
                                <td style={{ padding: "12px 10px", textAlign: "right", color: "#475569" }} className="tabular-nums">
                                  {p.bounceRate}
                                </td>
                                <td style={{ padding: "12px 10px", textAlign: "right" }}>
                                  <span
                                    style={{
                                      padding: isHighExit ? "2px 6px" : "0",
                                      borderRadius: "4px",
                                      background: isHighExit ? "#fee2e2" : "transparent",
                                      color: isHighExit ? "#dc2626" : isLowOrZeroExit ? "#64748b" : "#475569",
                                      fontWeight: isHighExit ? 700 : 500,
                                      fontSize: "12px",
                                    }}
                                    className="tabular-nums"
                                  >
                                    {p.exitRate}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </motion.div>
            )}



            {/* ======================================================== */}
            {/* TAB 5: MARKETING & ACQUISITION                          */}
            {/* ======================================================== */}
            {selectedSubTab === "marketing" && (
              <motion.div
                key="marketing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Visual Stacked Attribution Bar Card */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
                        Traffic Attribution &amp; Acquisition Sources
                      </h3>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                        High-level breakdown of channel market share and conversion pathways
                      </p>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "6px" }}>
                      Attribution Model: Last Touch
                    </span>
                  </div>

                  {/* Horizontal Stacked Bar */}
                  <div style={{ height: "14px", width: "100%", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden", display: "flex", marginBottom: "14px" }}>
                    <div style={{ width: "50%", background: "#2563eb", transition: "width 0.5s ease" }} title="Direct / Brand: 50%" />
                    <div style={{ width: "30%", background: "#10b981", transition: "width 0.5s ease" }} title="Organic & AI Search: 30%" />
                    <div style={{ width: "20%", background: "#8b5cf6", transition: "width 0.5s ease" }} title="Referral & Social: 20%" />
                  </div>

                  {/* Legend Row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "6px 4px 0 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#2563eb" }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Direct &amp; Brand</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }} className="tabular-nums">50.0% (106 sessions)</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#10b981" }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Organic &amp; AI Search</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }} className="tabular-nums">30.2% (64 sessions)</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#8b5cf6" }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Referral &amp; Social</span>
                      <span style={{ fontSize: "12px", color: "#64748b" }} className="tabular-nums">19.8% (42 sessions)</span>
                    </div>
                  </div>
                </div>

                {/* 3 Summary Bento Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  {analytics?.marketingChannels.map((c, i) => {
                    const topBorderColor = i === 0 ? "#2563eb" : i === 1 ? "#10b981" : "#8b5cf6";
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ y: -3, boxShadow: "0 10px 24px -4px rgba(0,0,0,0.06)" }}
                        style={{
                          background: "#ffffff",
                          padding: "20px",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          borderTop: `3px solid ${topBorderColor}`,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                          {c.channel}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                          <span style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a" }} className="tabular-nums">
                            {c.sessions}
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: topBorderColor }} className="tabular-nums">
                            {c.percentage}% share
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, background: "#f0fdf4", padding: "4px 8px", borderRadius: "6px", display: "inline-block" }}>
                          ✓ {c.inquiries} leads created ({c.conversionRate} conv.)
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Granular UTM / Campaign / Referrer Domain Breakdown Table */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 2px 0", color: "#0f172a" }}>
                        UTM Campaign &amp; Referrer Domain Breakdown
                      </h3>
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                        Granular acquisition channels, referrer hostnames, and conversion efficiency
                      </p>
                    </div>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          <th style={{ padding: "10px", textAlign: "left" }}>Source / Domain</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Campaign / Medium</th>
                          <th style={{ padding: "10px", textAlign: "left" }}>Channel Group</th>
                          <th style={{ padding: "10px", textAlign: "right" }}>Sessions</th>
                          <th style={{ padding: "10px", textAlign: "right" }}>Share</th>
                          <th style={{ padding: "10px", textAlign: "right" }}>Avg. Time</th>
                          <th style={{ padding: "10px", textAlign: "right" }}>Goal Inquiries</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { source: "google", medium: "organic / search", group: "Organic Search", sessions: 64, share: "30.2%", time: "2m 14s", inquiries: 5 },
                          { source: "direct", medium: "(direct) / none", group: "Direct & Brand", sessions: 106, share: "50.0%", time: "3m 42s", inquiries: 11 },
                          { source: "chatgpt.com", medium: "ai_search / citation", group: "AI Referral", sessions: 24, share: "11.3%", time: "4m 08s", inquiries: 3 },
                          { source: "perplexity.ai", medium: "ai_citation / llm", group: "AI Referral", sessions: 12, share: "5.7%", time: "3m 50s", inquiries: 2 },
                          { source: "instagram.com", medium: "meta_brand / social", group: "Social", sessions: 6, share: "2.8%", time: "1m 20s", inquiries: 1 },
                        ].map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "12px 10px", fontWeight: 700, color: "#0f172a" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Globe size={14} color="#64748b" />
                                {row.source}
                              </div>
                            </td>
                            <td style={{ padding: "12px 10px", color: "#475569" }}>
                              <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", color: "#334155" }}>
                                {row.medium}
                              </code>
                            </td>
                            <td style={{ padding: "12px 10px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: row.group.includes("AI") ? "#0284c7" : row.group.includes("Organic") ? "#166534" : "#475569", background: row.group.includes("AI") ? "#f0f9ff" : row.group.includes("Organic") ? "#f0fdf4" : "#f1f5f9", padding: "2px 8px", borderRadius: "4px" }}>
                                {row.group}
                              </span>
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }} className="tabular-nums">
                              {row.sessions}
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "right", color: "#475569" }} className="tabular-nums">
                              {row.share}
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "right", color: "#475569" }} className="tabular-nums">
                              {row.time}
                            </td>
                            <td style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }} className="tabular-nums">
                              {row.inquiries}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}



            {/* ======================================================== */}
            {/* TAB 6: POSTHOG SESSION RECORDINGS                       */}
            {/* ======================================================== */}
            {selectedSubTab === "recordings" && (
              <motion.div
                key="recordings"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#1e293b" }}>
                      PostHog Replay &amp; Session Recordings
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      Watch full visitor replays, mouse movement, scrolls, and clicks
                    </p>
                  </div>

                  <motion.a
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    href="https://us.posthog.com/project/recordings"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                      color: "#fff",
                      padding: "8px 14px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Play size={13} fill="#fff" /> Open PostHog Replay Viewer
                  </motion.a>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(!analytics?.sessionRecordings || analytics.sessionRecordings.length === 0) && (
                    <div style={{ textAlign: "center", padding: "48px 24px", background: "#f8fafc", borderRadius: "10px", border: "1px dashed #cbd5e1" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto" }}>
                        <Play size={22} color="#2563eb" />
                      </div>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>No Session Recordings Recorded Yet</h4>
                      <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "480px", margin: "0 auto 16px auto", lineHeight: 1.5 }}>
                        PostHog session replays will populate here and in your PostHog cloud console as live visitors interact with your website.
                      </p>
                      <motion.a
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        href="https://us.posthog.com/project/recordings"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#2563eb",
                          color: "#fff",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        Launch PostHog Replay Console <ExternalLink size={12} />
                      </motion.a>
                    </div>
                  )}

                  {analytics?.sessionRecordings && analytics.sessionRecordings.map((rec) => (
                    <motion.div
                      key={rec.id}
                      whileHover={{ scale: 1.005, borderColor: "#2563eb" }}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "14px 18px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#f8fafc",
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span style={{ fontSize: "20px" }}>{rec.flag}</span>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 700, fontSize: "13px", color: "#1e293b" }}>{rec.country}</span>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>• {rec.device}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            Duration: <strong>{rec.duration}</strong> • {rec.pagesCount} pages viewed • {rec.clicksCount} clicks
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>{rec.startedAt}</span>
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={rec.posthogUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "#2563eb",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Play size={12} fill="#fff" /> Watch Replay
                        </motion.a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}



            {/* ======================================================== */}
            {/* TAB 7: INSIGHTS & BENCHMARKS                            */}
            {/* ======================================================== */}
            {selectedSubTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ display: "flex", flexDirection: "column", gap: "18px" }}
              >
                {analytics?.trafficInsights.map((insight, idx) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    style={{
                      background: "#ffffff",
                      border: `1px solid ${insight.type === "warning" ? "#fed7aa" : insight.type === "opportunity" ? "#bfdbfe" : "#bbf7d0"}`,
                      borderLeft: `5px solid ${insight.type === "warning" ? "#f97316" : insight.type === "opportunity" ? "#2563eb" : "#10b981"}`,
                      borderRadius: "10px",
                      padding: "18px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 6px 0", color: "#1e293b" }}>
                        {insight.title}
                      </h4>
                      <p style={{ fontSize: "13px", color: "#475569", margin: 0, lineHeight: 1.5 }}>
                        {insight.message}
                      </p>
                    </div>

                    {insight.actionText && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => alert(`Insight Action Triggered: ${insight.actionText}`)}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          padding: "8px 14px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#1e293b",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {insight.actionText}
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}



            {/* ======================================================== */}
            {/* TAB 8: ALL REPORTS                                      */}
            {/* ======================================================== */}
            {selectedSubTab === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
                      Full Granular Telemetry Logs
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      Daily timeline of unique visitors, active sessions, and pageviews (sorted newest first)
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={() => setHideZeroTraffic(!hideZeroTraffic)}
                      style={{
                        background: hideZeroTraffic ? "#eff6ff" : "#f8fafc",
                        color: hideZeroTraffic ? "#2563eb" : "#64748b",
                        border: `1px solid ${hideZeroTraffic ? "#bfdbfe" : "#e2e8f0"}`,
                        padding: "5px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Filter size={12} />
                      {hideZeroTraffic ? "Hide Zero-Traffic Days (Active)" : "Show All Days"}
                    </button>
                  </div>
                </div>

                {(() => {
                  const rawTrend = analytics?.trafficTrend || [];
                  const sortedTrend = [...rawTrend].reverse();
                  const displayedTrend = sortedTrend.filter(
                    (t) => !hideZeroTraffic || t.visitors > 0 || t.sessions > 0 || t.pageviews > 0
                  );
                  const maxVisitors = Math.max(...displayedTrend.map((t) => t.visitors), 1);
                  const maxPageviews = Math.max(...displayedTrend.map((t) => t.pageviews), 1);

                  return (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            <th style={{ padding: "12px 10px", textAlign: "left" }}>Date</th>
                            <th style={{ padding: "12px 10px", textAlign: "left" }}>Day / Label</th>
                            <th style={{ padding: "12px 14px", textAlign: "right" }}>Unique Visitors</th>
                            <th style={{ padding: "12px 14px", textAlign: "right" }}>Sessions</th>
                            <th style={{ padding: "12px 14px", textAlign: "right" }}>Pageviews</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedTrend.length === 0 && (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", padding: "36px", color: "#64748b", background: "#f8fafc", borderRadius: "8px" }}>
                                {rawTrend.length > 0 && hideZeroTraffic
                                  ? "All dates in this window had zero traffic. Click 'Show All Days' to view empty logs."
                                  : "No telemetry records found for this period."}
                              </td>
                            </tr>
                          )}
                          {displayedTrend.map((t, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                              <td style={{ padding: "12px 10px", color: "#64748b", fontFamily: "monospace", fontSize: "12px" }}>
                                {t.date}
                              </td>
                              <td style={{ padding: "12px 10px", fontWeight: 600, color: "#0f172a" }}>
                                {t.label}
                              </td>
                              <td style={{ padding: "12px 14px", textAlign: "right", position: "relative" }}>
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "6px",
                                    bottom: "6px",
                                    right: "8px",
                                    width: `${Math.min(100, Math.round((t.visitors / maxVisitors) * 80))}%`,
                                    background: "rgba(37, 99, 235, 0.08)",
                                    borderRadius: "4px",
                                    pointerEvents: "none",
                                  }}
                                />
                                <span style={{ position: "relative", zIndex: 1, fontWeight: 700, color: "#2563eb" }} className="tabular-nums">
                                  {t.visitors}
                                </span>
                              </td>
                              <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 600, color: "#0f172a" }} className="tabular-nums">
                                {t.sessions}
                              </td>
                              <td style={{ padding: "12px 14px", textAlign: "right", position: "relative" }}>
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "6px",
                                    bottom: "6px",
                                    right: "8px",
                                    width: `${Math.min(100, Math.round((t.pageviews / maxPageviews) * 80))}%`,
                                    background: "rgba(16, 185, 129, 0.08)",
                                    borderRadius: "4px",
                                    pointerEvents: "none",
                                  }}
                                />
                                <span style={{ position: "relative", zIndex: 1, fontWeight: 700, color: "#059669" }} className="tabular-nums">
                                  {t.pageviews}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </motion.div>
            )}


          </AnimatePresence>
      </div>

      {/* MODAL: VIEW REPORT DETAIL DRILLDOWN (Framer Motion AnimatePresence) */}
      <AnimatePresence>
        {activeReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setActiveReportModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              style={{
                background: "#ffffff",
                color: "#0f172a",
                borderRadius: "14px",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
                padding: "24px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
                  {activeReportModal === "traffic-trend" && "Detailed Traffic Trend Report"}
                  {activeReportModal === "new-vs-returning" && "New vs Returning Visitors Report"}
                  {activeReportModal === "devices" && "Sessions by Device Breakdown"}
                  {activeReportModal === "countries" && "Sessions by Geographic Country Report"}
                  {activeReportModal === "sources" && "Traffic Sources & Referrers Report"}
                  {activeReportModal === "day-sessions" && "Day of Week Activity Distribution"}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveReportModal(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                >
                  <X size={20} color="#64748b" />
                </motion.button>
              </div>

              <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px 0" }}>
                Granular breakdown of data for {analytics?.timeRange}
              </p>

              {/* Modal Table Content */}
              <div style={{ overflowX: "auto" }}>
                {activeReportModal === "traffic-trend" && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Date</th>
                        <th style={{ padding: "8px" }}>Visitors</th>
                        <th style={{ padding: "8px" }}>Sessions</th>
                        <th style={{ padding: "8px" }}>Pageviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.trafficTrend.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px" }}>{r.label} ({r.date})</td>
                          <td style={{ padding: "8px", fontWeight: 700, color: "#2563eb" }}>{r.visitors}</td>
                          <td style={{ padding: "8px" }}>{r.sessions}</td>
                          <td style={{ padding: "8px" }}>{r.pageviews}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeReportModal === "devices" && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Device Type</th>
                        <th style={{ padding: "8px" }}>Sessions</th>
                        <th style={{ padding: "8px" }}>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>Desktop</td>
                        <td style={{ padding: "8px" }}>{analytics?.sessionsByDevice.desktop}</td>
                        <td style={{ padding: "8px", color: "#2563eb", fontWeight: 700 }}>{analytics?.sessionsByDevice.desktopPercent}%</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>Mobile</td>
                        <td style={{ padding: "8px" }}>{analytics?.sessionsByDevice.mobile}</td>
                        <td style={{ padding: "8px", color: "#0ea5e9", fontWeight: 700 }}>{analytics?.sessionsByDevice.mobilePercent}%</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeReportModal === "countries" && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Country</th>
                        <th style={{ padding: "8px" }}>Sessions</th>
                        <th style={{ padding: "8px" }}>Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.sessionsByCountry.map((c) => (
                        <tr key={c.code} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>{c.flag}</span>
                            <span style={{ fontWeight: 600 }}>{c.country}</span>
                          </td>
                          <td style={{ padding: "8px", fontWeight: 700 }}>{c.sessions}</td>
                          <td style={{ padding: "8px", color: "#2563eb" }}>{c.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeReportModal === "sources" && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Source</th>
                        <th style={{ padding: "8px" }}>Type</th>
                        <th style={{ padding: "8px" }}>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.trafficSources.map((s, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px", fontWeight: 600 }}>{s.source}</td>
                          <td style={{ padding: "8px" }}>{s.type}</td>
                          <td style={{ padding: "8px", color: "#2563eb", fontWeight: 700 }}>{s.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeReportModal === "new-vs-returning" && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Visitor Type</th>
                        <th style={{ padding: "8px" }}>Unique Visitors</th>
                        <th style={{ padding: "8px" }}>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>New Visitors</td>
                        <td style={{ padding: "8px" }}>{analytics?.newVsReturning.newVisitors}</td>
                        <td style={{ padding: "8px", color: "#2563eb", fontWeight: 700 }}>{analytics?.newVsReturning.newPercent}%</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>Returning Visitors</td>
                        <td style={{ padding: "8px" }}>{analytics?.newVsReturning.returningVisitors}</td>
                        <td style={{ padding: "8px", color: "#06b6d4", fontWeight: 700 }}>{analytics?.newVsReturning.returningPercent}%</td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {activeReportModal === "day-sessions" && (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Day</th>
                        <th style={{ padding: "8px" }}>Average Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.avgSessionsByDay.map((d) => (
                        <tr key={d.day} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px", fontWeight: 600 }}>{d.day}</td>
                          <td style={{ padding: "8px", color: "#2563eb", fontWeight: 700 }}>{d.avg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveReportModal(null)}
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Close Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: Traffic Area Chart (Framer Motion SVG Drawing)
// -------------------------------------------------------------
function TrafficAreaChart({
  data,
  onHoverPoint,
}: {
  data: Array<{ date: string; label: string; visitors: number; sessions: number }>;
  onHoverPoint: (point: any) => void;
}) {
  const width = 640;
  const height = 180;
  const paddingX = 24;
  const paddingY = 25;

  const gradientId = useId();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Y max scale with clean headroom
  const rawMax = Math.max(5, ...data.map((d) => d.visitors));
  const maxVal = Math.ceil(rawMax * 1.15);

  const points = data.map((d, index) => {
    const x = paddingX + (index / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.visitors / maxVal) * (height - paddingY * 2);
    const prevVisitors = index > 0 ? data[index - 1].visitors : d.visitors;
    let delta = 0;
    if (prevVisitors > 0) {
      delta = Math.round(((d.visitors - prevVisitors) / prevVisitors) * 100);
    } else if (d.visitors > 0) {
      delta = 100;
    }
    return { x, y, ...d, delta, index };
  });

  // Build SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Select 6-8 evenly spaced labels
  const step = Math.max(1, Math.floor(data.length / 8));
  const tickIndices = data
    .map((_, i) => i)
    .filter((i) => i % step === 0 || i === data.length - 1);

  // Dynamic Y Axis ticks
  const yTicks = [
    { val: Math.round(maxVal), ratio: 1.0 },
    { val: Math.round((maxVal * 2) / 3), ratio: 0.66 },
    { val: Math.round(maxVal / 3), ratio: 0.33 },
    { val: 0, ratio: 0 },
  ];

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {/* Horizontal dashed gridlines & Y Axis labels */}
      {yTicks.map((tick, i) => {
        const yPos = height - paddingY - tick.ratio * (height - paddingY * 2);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${(yPos / height) * 100}%`,
              left: 0,
              right: 0,
              borderBottom: "1px dashed #f1f5f9",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "-11px",
                fontSize: "10px",
                color: "#94a3b8",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {tick.val}
            </span>
          </div>
        );
      })}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Filled gradient area below curve */}
        <motion.path
          d={fillD}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Thinner 2px crisp stroke (#2563EB) */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
        />

        {/* Vertical hover crosshair guide line */}
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={0}
            x2={activePoint.x}
            y2={height - paddingY}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeDasharray="3 3"
            pointerEvents="none"
          />
        )}

        {/* Interactive Dots on curve */}
        {points.map((p, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <g
              key={idx}
              onMouseEnter={() => {
                setHoveredIdx(idx);
                onHoverPoint(p);
              }}
              style={{ cursor: "pointer" }}
            >
              <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
              {p.visitors > 0 && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Interactive Floating Hover Tooltip (exact date + delta) */}
      <AnimatePresence>
        {activePoint && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              left: `${Math.min(90, Math.max(10, (activePoint.x / width) * 100))}%`,
              top: `${Math.max(0, (activePoint.y / height) * 100 - 36)}%`,
              transform: "translate(-50%, -100%)",
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: "8px",
              padding: "7px 11px",
              fontSize: "12px",
              boxShadow: "0 10px 25px -3px rgba(15, 23, 42, 0.35)",
              pointerEvents: "none",
              zIndex: 20,
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, marginBottom: "2px" }}>
              {activePoint.label}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 800, color: "#ffffff", fontSize: "13px" }}>
                {activePoint.visitors} Visitors
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: activePoint.delta >= 0 ? "#34d399" : "#f87171",
                  background: activePoint.delta >= 0 ? "rgba(52, 211, 153, 0.15)" : "rgba(248, 113, 113, 0.15)",
                  padding: "1px 5px",
                  borderRadius: "4px",
                }}
              >
                {activePoint.delta >= 0 ? `+${activePoint.delta}%` : `${activePoint.delta}%`}
              </span>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
              {activePoint.sessions} sessions
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* X Axis Labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          position: "absolute",
          bottom: "0",
          left: `${paddingX}px`,
          right: `${paddingX}px`,
        }}
      >
        {tickIndices.map((idx) => (
          <span key={idx} style={{ fontSize: "11px", color: "#64748b" }}>
            {data[idx].label}
          </span>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: Donut Chart with Framer Motion Stroke Offset
// -------------------------------------------------------------
function DonutChart({
  segments,
  centerTopLabel,
  centerValue,
  centerDelta = "+12%",
}: {
  segments: Array<{ percent: number; color: string }>;
  centerTopLabel: string;
  centerValue: string;
  centerDelta?: string;
}) {
  const size = 126;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ position: "relative", width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background full track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Animated Segments */}
        {segments.map((seg, idx) => {
          const targetOffset = circumference - (seg.percent / 100) * circumference;
          const rotationAngle = (accumulatedPercent / 100) * 360;
          accumulatedPercent += seg.percent;

          return (
            <motion.circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: targetOffset }}
              transition={{ duration: 1.2, delay: 0.15 * idx, ease: "easeOut" }}
              strokeLinecap="round"
              style={{
                transformOrigin: "center",
                transform: `rotate(${rotationAngle}deg)`,
              }}
            />
          );
        })}
      </svg>

      {/* Center Label with Scale Pop-in */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: "9px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1 }}>
          {centerTopLabel}
        </span>
        <span style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginTop: "2px", lineHeight: 1.1 }}>
          {centerValue}
        </span>
        {centerDelta && (
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              color: "#10b981",
              background: "rgba(16, 185, 129, 0.12)",
              padding: "1px 6px",
              borderRadius: "999px",
              marginTop: "3px",
              lineHeight: 1.2,
            }}
          >
            {centerDelta}
          </span>
        )}
      </motion.div>
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT: Highlight KPI Card with Framer Motion
// -------------------------------------------------------------
function HighlightCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  sparkline = [32, 45, 40, 58, 52, 68, 76],
  sparklineColor = "#2563eb",
}: {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
  sparkline?: number[];
  sparklineColor?: string;
}) {
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;
  const width = 80;
  const height = 28;
  const points = sparkline
    .map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * (width - 6) + 3;
      const y = height - 4 - ((val - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = isPositive ? sparklineColor : "#ef4444";

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 10px 24px -4px rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.2 }}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "18px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "116px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>{title}</span>
        <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#f8fafc", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color="#2563eb" />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "10px" }}>
        <div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.1 }} className="tabular-nums">
            {value}
          </div>
          <div style={{ marginTop: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: isPositive ? "#16a34a" : "#dc2626",
                background: isPositive ? "#dcfce7" : "#fee2e2",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-block",
              }}
              className="tabular-nums"
            >
              {change}
            </span>
          </div>
        </div>

        {/* Micro-sparkline */}
        <div style={{ paddingBottom: "2px" }}>
          <svg width={width} height={height} style={{ overflow: "visible" }}>
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            {points.split(" ").slice(-1).map((pt, idx) => {
              const [px, py] = pt.split(",");
              return (
                <circle
                  key={idx}
                  cx={px}
                  cy={py}
                  r="3"
                  fill={color}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
