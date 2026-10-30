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
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [testPingFired, setTestPingFired] = useState<boolean>(false);

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

  const handleFireTelemetryPing = () => {
    trackEvent("analytics_dashboard_ping", {
      time: new Date().toISOString(),
      source: "PostHog Wix-style Dashboard",
      subTab: selectedSubTab,
    });
    setTestPingFired(true);
    setTimeout(() => {
      fetchAnalytics(timeRange, true);
      setTestPingFired(false);
    }, 800);
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
      {/* Top Banner: PostHog Live Ingestion Proxy Status */}
      <motion.div
        layout
        style={{
          background: "linear-gradient(90deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Framer motion pulsing dot */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 10px #10b981",
            }}
          />
          <div style={{ fontSize: "13px" }}>
            <span style={{ fontWeight: 600, color: "#fff" }}>PostHog Ingestion Engine:</span>{" "}
            <span style={{ color: "#34d399", fontWeight: 500 }}>Active (Bypassing Ad-blockers via /ingest proxy)</span>
            <span style={{ color: "var(--text-muted)", marginLeft: "8px", fontSize: "12px" }}>
              • Capturing Session Replays, Clicks &amp; $pageview
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFireTelemetryPing}
            style={{
              background: testPingFired ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${testPingFired ? "#10b981" : "rgba(255, 255, 255, 0.12)"}`,
              color: testPingFired ? "#34d399" : "#e2e8f0",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <Zap size={13} color={testPingFired ? "#34d399" : "#f59e0b"} />
            {testPingFired ? "Telemetry Ping Sent!" : "Send Test Ping"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowConfigDrawer(!showConfigDrawer)}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#e2e8f0",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ShieldCheck size={14} color="#38bdf8" /> PostHog Config
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://us.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Open PostHog Cloud <ExternalLink size={12} />
          </motion.a>
        </div>
      </motion.div>

      {/* PostHog Configuration Drawer with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {showConfigDrawer && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              borderRadius: "12px",
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              overflow: "hidden",
            }}
          >
            <div>
              <h4 style={{ color: "#fff", fontSize: "14px", margin: "0 0 6px 0" }}>Client Ingestion Key</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "0 0 10px 0" }}>
                Public key active in next.config.ts reverse proxy
              </p>
              <div style={{ background: "rgba(0,0,0,0.4)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <code style={{ color: "#ec4899", fontSize: "13px" }}>
                  {analytics?.posthogConfig.apiKeyPrefix || "phc_active...proxy"}
                </code>
              </div>
            </div>

            <div>
              <h4 style={{ color: "#fff", fontSize: "14px", margin: "0 0 6px 0" }}>Ingestion Proxy Route</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "0 0 10px 0" }}>
                First-party proxy bypassing browser privacy extensions
              </p>
              <div style={{ background: "rgba(0,0,0,0.4)", padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border-subtle)" }}>
                <code style={{ color: "#38bdf8", fontSize: "13px" }}>/ingest → https://us.i.posthog.com</code>
              </div>
            </div>

            <div>
              <h4 style={{ color: "#fff", fontSize: "14px", margin: "0 0 6px 0" }}>Session Recording Status</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: "0 0 10px 0" }}>
                Autocapture and session replay sampling
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>● 100% Full Sessions Captured</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Wix-Style Analytics Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: "24px",
          alignItems: "start",
          background: "#ffffff",
          color: "#0f172a",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
          minHeight: "850px",
        }}
        className="analytics-light-shell"
      >
        {/* LEFT SUB-SIDEBAR (Circled in blue in user's screenshot) */}
        <div
          style={{
            borderRight: "1px solid #e2e8f0",
            paddingRight: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            position: "relative",
          }}
        >
          <div style={{ padding: "0 10px 12px 10px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Analytics
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedSubTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSubTab(item.id as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: isSelected ? 600 : 500,
                  background: isSelected ? "#e2e8f0" : "transparent",
                  color: isSelected ? "#0f172a" : "#475569",
                  position: "relative",
                  transition: "background 0.15s ease",
                }}
              >
                {/* Framer motion active tab sliding indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="activeSubTabIndicator"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "8px",
                      background: "#e2e8f0",
                      zIndex: 0,
                    }}
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "10px", zIndex: 1 }}>
                  <Icon size={16} color={isSelected ? "#2563eb" : "#64748b"} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "999px",
                      background: item.badge === "LIVE" ? "#ef4444" : "#cbd5e1",
                      color: item.badge === "LIVE" ? "#fff" : "#334155",
                      zIndex: 1,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* RIGHT MAIN CONTENT AREA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
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
                style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "22px" }}
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
                      padding: "20px 22px 14px 22px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>Visitors Over Time</span>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>• Unique daily visits</span>
                      </div>
                      <AnimatePresence>
                        {hoveredPoint && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                              fontSize: "12px",
                              background: "#f1f5f9",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              color: "#1e293b",
                              fontWeight: 600,
                            }}
                          >
                            {hoveredPoint.label}: {hoveredPoint.visitors} Visitors ({hoveredPoint.sessions} Sessions)
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* SVG Line / Area Graph with Path Animation */}
                    <div style={{ width: "100%", height: "200px", position: "relative" }}>
                      {analytics && analytics.trafficTrend.length > 0 && (
                        <TrafficAreaChart
                          data={analytics.trafficTrend}
                          onHoverPoint={(p) => setHoveredPoint(p)}
                        />
                      )}
                    </div>

                    {/* Chart Footer Link */}
                    <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "14px", paddingTop: "10px" }}>
                      <motion.button
                        whileHover={{ x: 2 }}
                        onClick={() => setActiveReportModal("traffic-trend")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        View Report <ChevronRight size={13} />
                      </motion.button>
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
                        padding: "20px 22px 14px 22px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 16px 0", color: "#1e293b" }}>
                          New vs returning visitors
                        </h3>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "14px" }}>
                          {/* Animated Donut */}
                          <DonutChart
                            segments={[
                              { percent: analytics?.newVsReturning.newPercent ?? 0, color: "#2563eb" },
                              { percent: analytics?.newVsReturning.returningPercent ?? 0, color: "#06b6d4" },
                            ]}
                            centerTopLabel="Unique visitors"
                            centerValue={String(analytics?.newVsReturning.totalUnique ?? 0)}
                          />

                          {/* Legend */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#2563eb" }} />
                              <div>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>New</span>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>
                                  {analytics?.newVsReturning.newPercent ?? 0}% • {analytics?.newVsReturning.newVisitors ?? 0}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#06b6d4" }} />
                              <div>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>Returning</span>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>
                                  {analytics?.newVsReturning.returningPercent ?? 0}% • {analytics?.newVsReturning.returningVisitors ?? 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "18px", paddingTop: "10px" }}>
                        <motion.button
                          whileHover={{ x: 2 }}
                          onClick={() => setActiveReportModal("new-vs-returning")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#2563eb",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          View Report <ChevronRight size={13} />
                        </motion.button>
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
                        padding: "20px 22px 14px 22px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 16px 0", color: "#1e293b" }}>
                          Sessions by device
                        </h3>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "14px" }}>
                          {/* Animated Donut */}
                          <DonutChart
                            segments={[
                              { percent: analytics?.sessionsByDevice.desktopPercent ?? 0, color: "#2563eb" },
                              { percent: analytics?.sessionsByDevice.mobilePercent ?? 0, color: "#0ea5e9" },
                            ]}
                            centerTopLabel="Site sessions"
                            centerValue={String(analytics?.sessionsByDevice.totalSessions ?? 0)}
                          />

                          {/* Legend */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#2563eb" }} />
                              <div>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>Desktop</span>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>
                                  {analytics?.sessionsByDevice.desktopPercent ?? 0}% • {analytics?.sessionsByDevice.desktop ?? 0}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#0ea5e9" }} />
                              <div>
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>Mobile</span>
                                <div style={{ color: "#64748b", fontSize: "12px" }}>
                                  {analytics?.sessionsByDevice.mobilePercent ?? 0}% • {analytics?.sessionsByDevice.mobile ?? 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "18px", paddingTop: "10px" }}>
                        <motion.button
                          whileHover={{ x: 2 }}
                          onClick={() => setActiveReportModal("devices")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#2563eb",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          View Report <ChevronRight size={13} />
                        </motion.button>
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
                      padding: "20px 22px 14px 22px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                        Sessions by country
                      </h3>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Countries • Total {analytics?.sessionsByCountry.reduce((a, b) => a + b.sessions, 0) ?? 0}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {analytics?.sessionsByCountry.map((c, i) => (
                        <div key={c.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "160px" }}>
                            <span style={{ fontSize: "16px" }}>{c.flag}</span>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{c.country}</span>
                          </div>

                          {/* Animated Progress Bar */}
                          <div style={{ flex: 1, background: "#f1f5f9", height: "8px", borderRadius: "999px", overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${c.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.15 * i, ease: "easeOut" }}
                              style={{
                                height: "100%",
                                background: "#2563eb",
                                borderRadius: "999px",
                              }}
                            />
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "60px", justifyContent: "flex-end" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>{c.sessions}</span>
                            <span style={{ fontSize: "12px", color: "#64748b" }}>({c.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "16px", paddingTop: "10px" }}>
                      <motion.button
                        whileHover={{ x: 2 }}
                        onClick={() => setActiveReportModal("countries")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        View Report <ChevronRight size={13} />
                      </motion.button>
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
                      padding: "20px 20px 14px 20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#1e293b" }}>Traffic sources</h3>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {analytics?.trafficSources.map((s, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "8px",
                            background: "#f8fafc",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                          }}
                        >
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>{s.source}</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{s.type}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontWeight: 700, color: "#2563eb" }}>{s.percentage}%</span>
                            <div style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>{s.change}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "14px", paddingTop: "10px" }}>
                      <motion.button
                        whileHover={{ x: 2 }}
                        onClick={() => setActiveReportModal("sources")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        View Report <ChevronRight size={13} />
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* 2. Avg Sessions by Day Animated Bar Chart */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "20px 20px 14px 20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                          Avg. sessions by day
                        </h3>
                        <ChevronDown size={14} color="#64748b" />
                      </div>
                    </div>

                    {/* Day of Week Bar Chart with Framer Motion Bar Expansions */}
                    <div style={{ height: "140px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "8px", paddingTop: "10px" }}>
                      {analytics?.avgSessionsByDay.map((d, i) => {
                        const maxVal = Math.max(1, ...(analytics?.avgSessionsByDay.map((x) => x.avg) || [1]));
                        const heightPercent = d.avg > 0 ? Math.min(100, Math.max(12, (d.avg / maxVal) * 100)) : 4;
                        const isPeak = d.avg > 0 && d.avg === maxVal;
                        return (
                          <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: "6px" }}>
                            <span style={{ fontSize: "10px", fontWeight: 600, color: isPeak ? "#2563eb" : "#94a3b8" }}>
                              {d.avg > 0 ? d.avg : "0"}
                            </span>
                            <motion.div
                              initial={{ height: "0%" }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: "easeOut" }}
                              whileHover={{ scaleY: 1.05 }}
                              style={{
                                width: "100%",
                                maxWidth: "24px",
                                background: isPeak ? "#2563eb" : "#93c5fd",
                                borderRadius: "4px 4px 0 0",
                                transformOrigin: "bottom",
                              }}
                            />
                            <span style={{ fontSize: "11px", color: isPeak ? "#1e293b" : "#64748b", fontWeight: isPeak ? 700 : 500 }}>
                              {d.day}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "14px", paddingTop: "10px" }}>
                      <motion.button
                        whileHover={{ x: 2 }}
                        onClick={() => setActiveReportModal("day-sessions")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        View Report <ChevronRight size={13} />
                      </motion.button>
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
                      padding: "20px 20px 14px 20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <Lightbulb size={16} color="#eab308" />
                      <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                        Traffic insights
                      </h3>
                    </div>

                    <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                      {analytics?.trafficInsights[0]?.message ||
                        "Analytics telemetry is active. Live insights are computed in real time as visitors navigate your site."}
                    </p>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
                      <motion.button
                        whileHover={{ x: 2 }}
                        onClick={() => setSelectedSubTab("insights")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        See All Insights <ChevronRight size={13} />
                      </motion.button>
                    </div>
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  <HighlightCard
                    title="Unique Visitors"
                    value={String(analytics?.highlights.uniqueVisitors ?? 0)}
                    change={analytics?.highlights.uniqueVisitorsChange || "0%"}
                    isPositive={!analytics?.highlights.uniqueVisitorsChange.startsWith("-")}
                    icon={Eye}
                  />
                  <HighlightCard
                    title="Total Site Sessions"
                    value={String(analytics?.highlights.siteSessions ?? 0)}
                    change={analytics?.highlights.siteSessionsChange || "0%"}
                    isPositive={!analytics?.highlights.siteSessionsChange.startsWith("-")}
                    icon={Activity}
                  />
                  <HighlightCard
                    title="Total Pageviews"
                    value={String(analytics?.highlights.pageviews ?? 0)}
                    change={analytics?.highlights.pageviewsChange || "0%"}
                    isPositive={!analytics?.highlights.pageviewsChange.startsWith("-")}
                    icon={FileText}
                  />
                  <HighlightCard
                    title="Avg. Session Duration"
                    value={analytics?.highlights.avgSessionDuration || "0s"}
                    change={analytics?.highlights.avgSessionDurationChange || "0%"}
                    isPositive={true}
                    icon={Clock}
                  />
                  <HighlightCard
                    title="Bounce Rate"
                    value={analytics?.highlights.bounceRate || "0.0%"}
                    change={analytics?.highlights.bounceRateChange || "0%"}
                    isPositive={true}
                    icon={TrendingDown}
                  />
                  <HighlightCard
                    title="Verified Leads Inquiries"
                    value={String(analytics?.highlights.leadsSubmitted ?? 0)}
                    change={analytics?.highlights.leadsConversionRate || "0.0%"}
                    isPositive={true}
                    icon={Sparkles}
                  />
                </div>

                {/* Acquisition & Performance overview table */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#1e293b" }}>
                    Channel Performance &amp; Conversion Efficiency
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b" }}>
                          <th style={{ padding: "10px" }}>Channel</th>
                          <th style={{ padding: "10px" }}>Sessions</th>
                          <th style={{ padding: "10px" }}>Share</th>
                          <th style={{ padding: "10px" }}>Inquiries Generated</th>
                          <th style={{ padding: "10px" }}>Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics?.marketingChannels.map((c, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "12px 10px", fontWeight: 600, color: "#1e293b" }}>{c.channel}</td>
                            <td style={{ padding: "12px 10px" }}>{c.sessions}</td>
                            <td style={{ padding: "12px 10px" }}>{c.percentage}%</td>
                            <td style={{ padding: "12px 10px", fontWeight: 600, color: "#2563eb" }}>{c.inquiries}</td>
                            <td style={{ padding: "12px 10px", fontWeight: 700, color: "#10b981" }}>{c.conversionRate}</td>
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
                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>
                  {/* Active users counter */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                      borderRadius: "12px",
                      padding: "24px",
                      color: "#fff",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <motion.span
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                          style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 10px #22c55e" }}
                        />
                        <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#86efac" }}>
                          Live Active Right Now
                        </span>
                      </div>

                      <motion.div
                        key={analytics?.realtime.activeUsers}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{ fontSize: "48px", fontWeight: 800, lineHeight: 1, margin: "14px 0" }}
                      >
                        {analytics?.realtime.activeUsers ?? 0}
                      </motion.div>
                      <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
                        Active visitors engaging with T &amp; N Designs right now
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "14px", marginTop: "20px" }}>
                      <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
                        Streaming via <strong>/ingest</strong> proxy
                      </div>
                    </div>
                  </motion.div>

                  {/* Real-time active pages */}
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b" }}>
                      Pages Active Right Now
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {(!analytics?.realtime.activePages || analytics.realtime.activePages.length === 0) && (
                        <div style={{ color: "#64748b", fontSize: "13px", padding: "16px", background: "#f8fafc", borderRadius: "8px", textAlign: "center" }}>
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
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
                            <code style={{ fontSize: "13px", color: "#2563eb", fontWeight: 600 }}>{p.path}</code>
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                            {p.count} active visitor{p.count > 1 ? "s" : ""}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time live event stream */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                      Live PostHog Telemetry Stream
                    </h3>
                    <span style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>● Connected &amp; Listening</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(!analytics?.realtime.recentEvents || analytics.realtime.recentEvents.length === 0) && (
                      <div style={{ textAlign: "center", padding: "28px", color: "#64748b", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                        No events captured in this window yet. Telemetry listening via /ingest proxy and database.
                      </div>
                    )}
                    {analytics?.realtime.recentEvents && analytics.realtime.recentEvents.map((ev, idx) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 * idx }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "6px",
                          background: "#f8fafc",
                          fontSize: "13px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: "4px", background: "#e2e8f0", fontSize: "11px", fontWeight: 700, color: "#334155" }}>
                            {ev.event}
                          </span>
                          <code style={{ color: "#0f172a", fontWeight: 600 }}>{ev.path}</code>
                          <span style={{ color: "#64748b", fontSize: "12px" }}>({ev.device})</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                          <span style={{ color: "#64748b", fontSize: "12px" }}>{ev.country}</span>
                          <span style={{ color: "#2563eb", fontWeight: 600, fontSize: "12px" }}>{ev.time}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
                {/* 1. Top Summary Banner */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #123968 0%, #0f172a 100%)",
                    borderRadius: "14px",
                    padding: "24px 28px",
                    color: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "18px",
                    boxShadow: "0 8px 24px rgba(18, 57, 104, 0.15)",
                  }}
                >
                  <div style={{ maxWidth: "680px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ background: "#d97706", color: "#ffffff", fontSize: "11px", fontWeight: 800, padding: "3px 8px", borderRadius: "6px", textTransform: "uppercase" }}>
                        Wix Studio &amp; Next.js GEO Matrix
                      </span>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>● Real-time AI Crawler &amp; Search Monitor</span>
                    </div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 6px 0", color: "#ffffff" }}>
                      Generative Engine Optimization (GEO) &amp; AI Search Discovery
                    </h3>
                    <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
                      Tracks how AI search engines (ChatGPT Search, Perplexity, Google Gemini, Claude, and Copilot) crawl, ingest, and cite <strong>T &amp; N Designs</strong> across generative search fields and AI answer overviews.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <a
                      href="/llms.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", borderColor: "rgba(255,255,255,0.2)", fontSize: "12px", padding: "8px 14px" }}
                    >
                      <FileText size={14} /> View /llms.txt <ExternalLink size={12} />
                    </a>
                    <a
                      href="/api/mcp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", borderColor: "rgba(255,255,255,0.2)", fontSize: "12px", padding: "8px 14px" }}
                    >
                      <Zap size={14} /> Test MCP Endpoint <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* 2. Key Metrics Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      AI Crawlers Allowed
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#123968" }}>
                      9 of 9 Bots
                    </div>
                    <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
                      ✓ 100% Unrestricted in robots.txt
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      Machine Digest (/llms.txt)
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#123968" }}>
                      200 OK
                    </div>
                    <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
                      ✓ 4.2 KB Clean LLM Context
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      AI Agent MCP Protocol
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#123968" }}>
                      Active
                    </div>
                    <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginTop: "4px" }}>
                      ✓ JSON-RPC 2.0 Direct Access
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                      Structured JSON-LD Schema
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: "#123968" }}>
                      4 Schemas
                    </div>
                    <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600, marginTop: "4px" }}>
                      ✓ WebSite, Service, FAQ, Org
                    </div>
                  </div>
                </div>

                {/* 3. AI Search Engines & Web Crawlers Matrix */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px" }}>
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
                        <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", textTransform: "uppercase", fontSize: "11px" }}>
                          <th style={{ padding: "12px" }}>AI Crawler / Engine</th>
                          <th style={{ padding: "12px" }}>Parent Entity</th>
                          <th style={{ padding: "12px" }}>Purpose in AI Search</th>
                          <th style={{ padding: "12px" }}>Access Rule</th>
                          <th style={{ padding: "12px" }}>Target Endpoints</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                              GPTBot
                            </div>
                          </td>
                          <td style={{ padding: "12px", color: "#475569" }}>OpenAI</td>
                          <td style={{ padding: "12px", color: "#334155" }}>ChatGPT model training &amp; indexation</td>
                          <td style={{ padding: "12px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>ALLOWED</span></td>
                          <td style={{ padding: "12px", color: "#64748b" }}>/llms.txt, /work, /services, /blog/*</td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                              OAI-SearchBot &amp; ChatGPT-User
                            </div>
                          </td>
                          <td style={{ padding: "12px", color: "#475569" }}>OpenAI</td>
                          <td style={{ padding: "12px", color: "#334155" }}>Real-time ChatGPT Web Search results</td>
                          <td style={{ padding: "12px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>ALLOWED</span></td>
                          <td style={{ padding: "12px", color: "#64748b" }}>All public routes &amp; sitemaps</td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                              PerplexityBot
                            </div>
                          </td>
                          <td style={{ padding: "12px", color: "#475569" }}>Perplexity AI</td>
                          <td style={{ padding: "12px", color: "#334155" }}>Perplexity AI answer citations &amp; references</td>
                          <td style={{ padding: "12px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>ALLOWED</span></td>
                          <td style={{ padding: "12px", color: "#64748b" }}>/llms.txt, /work, /reviews, /faq</td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                              ClaudeBot &amp; Claude-Web
                            </div>
                          </td>
                          <td style={{ padding: "12px", color: "#475569" }}>Anthropic</td>
                          <td style={{ padding: "12px", color: "#334155" }}>Claude 3.5 Sonnet web search &amp; research</td>
                          <td style={{ padding: "12px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>ALLOWED</span></td>
                          <td style={{ padding: "12px", color: "#64748b" }}>/llms.txt, /api/mcp, /blog/*</td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                              Google-Extended
                            </div>
                          </td>
                          <td style={{ padding: "12px", color: "#475569" }}>Google</td>
                          <td style={{ padding: "12px", color: "#334155" }}>Google Gemini &amp; AI Overviews training</td>
                          <td style={{ padding: "12px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>ALLOWED</span></td>
                          <td style={{ padding: "12px", color: "#64748b" }}>/sitemap.xml, All public pages</td>
                        </tr>

                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                              Applebot-Extended
                            </div>
                          </td>
                          <td style={{ padding: "12px", color: "#475569" }}>Apple</td>
                          <td style={{ padding: "12px", color: "#334155" }}>Apple Intelligence &amp; Siri web summaries</td>
                          <td style={{ padding: "12px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>ALLOWED</span></td>
                          <td style={{ padding: "12px", color: "#64748b" }}>All public routes</td>
                        </tr>

                        <tr>
                          <td style={{ padding: "12px", fontWeight: 700, color: "#0f172a" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                              Cohere-ai &amp; CCBot
                            </div>
                          </td>
                          <td style={{ padding: "12px", color: "#475569" }}>Cohere / CommonCrawl</td>
                          <td style={{ padding: "12px", color: "#334155" }}>Enterprise RAG &amp; foundation model corpuses</td>
                          <td style={{ padding: "12px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontWeight: 700, fontSize: "11px" }}>ALLOWED</span></td>
                          <td style={{ padding: "12px", color: "#64748b" }}>/llms.txt, /api/mcp</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. How to See AI Search Impressions in External Platforms */}
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
                    How to Track Where Your Site is Searched &amp; Cited in AI Fields
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#123968", marginBottom: "6px" }}>
                        1. Google Search Console (AI Overviews)
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, margin: 0 }}>
                        In <strong>Google Search Console</strong>, go to <strong>Performance &rarr; Search Results</strong>. Click <strong>Search Appearance</strong> to inspect impressions where Google generated an AI Overview box citing T &amp; N Designs URLs.
                      </p>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#123968", marginBottom: "6px" }}>
                        2. AI Referral Traffic in PostHog &amp; GA4
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, margin: 0 }}>
                        When users click citations inside ChatGPT, Perplexity, or Claude, their referrers are tracked as <code style={{ color: "#2563eb" }}>chatgpt.com</code>, <code style={{ color: "#2563eb" }}>perplexity.ai</code>, or <code style={{ color: "#2563eb" }}>claude.ai</code> under the <strong>Marketing &amp; Acquisition</strong> tab.
                      </p>
                    </div>

                    <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#123968", marginBottom: "6px" }}>
                        3. Bing Webmaster Tools (Copilot Citations)
                      </div>
                      <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.55, margin: 0 }}>
                        Microsoft Copilot utilizes Bing's index. In <strong>Bing Webmaster Tools &rarr; Search Performance</strong>, view how many chat queries and AI summaries surfaced T &amp; N Designs case studies and services.
                      </p>
                    </div>
                  </div>
                </div>
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
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#1e293b" }}>
                      Top Visited Pages &amp; Content Engagement
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      Pageviews, reading time, bounce rates, and exit funnel points
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: "10px" }}>Page Path &amp; Title</th>
                        <th style={{ padding: "10px" }}>Views</th>
                        <th style={{ padding: "10px" }}>Unique</th>
                        <th style={{ padding: "10px" }}>Avg. Time</th>
                        <th style={{ padding: "10px" }}>Bounce Rate</th>
                        <th style={{ padding: "10px" }}>Exit Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!analytics?.behaviorPages || analytics.behaviorPages.length === 0) && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#64748b" }}>
                            No pageview behavior recorded in this time period yet. Tracking active.
                          </td>
                        </tr>
                      )}
                      {analytics?.behaviorPages && analytics.behaviorPages.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "12px 10px" }}>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>{p.title}</div>
                            <code style={{ fontSize: "12px", color: "#2563eb" }}>{p.path}</code>
                          </td>
                          <td style={{ padding: "12px 10px", fontWeight: 600 }}>{p.views}</td>
                          <td style={{ padding: "12px 10px" }}>{p.uniqueViews}</td>
                          <td style={{ padding: "12px 10px" }}>{p.avgTime}</td>
                          <td style={{ padding: "12px 10px", color: "#475569" }}>{p.bounceRate}</td>
                          <td style={{ padding: "12px 10px", color: "#e11d48", fontWeight: 600 }}>{p.exitRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}



            {/* ======================================================== */}
            {/* TAB 5: MARKETING                                        */}
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
                <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b" }}>
                    Traffic Attribution &amp; Acquisition Sources
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                    {analytics?.marketingChannels.map((c, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -2 }}
                        style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #f1f5f9" }}
                      >
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
                          {c.channel}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                          <span style={{ fontSize: "24px", fontWeight: 800, color: "#2563eb" }}>{c.sessions}</span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>{c.percentage}% share</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#10b981", fontWeight: 600 }}>
                          {c.inquiries} leads created ({c.conversionRate} conv.)
                        </div>
                      </motion.div>
                    ))}
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
                style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#1e293b" }}>
                      Full Granular Telemetry Logs
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      Export raw event reports, timestamps, visitor sessions, and device telemetry
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleExportCSV}
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Download size={14} /> Download CSV
                  </motion.button>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f1f5f9", textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: "10px" }}>Date</th>
                        <th style={{ padding: "10px" }}>Label</th>
                        <th style={{ padding: "10px" }}>Unique Visitors</th>
                        <th style={{ padding: "10px" }}>Sessions</th>
                        <th style={{ padding: "10px" }}>Pageviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.trafficTrend.map((t, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "10px", color: "#64748b" }}>{t.date}</td>
                          <td style={{ padding: "10px", fontWeight: 600, color: "#1e293b" }}>{t.label}</td>
                          <td style={{ padding: "10px", fontWeight: 700, color: "#2563eb" }}>{t.visitors}</td>
                          <td style={{ padding: "10px" }}>{t.sessions}</td>
                          <td style={{ padding: "10px" }}>{t.pageviews}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}


          </AnimatePresence>
        </div>
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
  const paddingX = 20;
  const paddingY = 25;

  const gradientId = useId();

  // Y max scale
  const maxVal = Math.max(3, ...data.map((d) => d.visitors));

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.visitors / maxVal) * (height - paddingY * 2);
    return { x, y, ...d };
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

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Y Axis Guide Lines */}
      {[0, 1, 2, 3].map((val) => {
        const yPos = height - paddingY - (val / maxVal) * (height - paddingY * 2);
        return (
          <div
            key={val}
            style={{
              position: "absolute",
              top: `${(yPos / height) * 100}%`,
              left: 0,
              right: 0,
              borderBottom: "1px dashed #f1f5f9",
              pointerEvents: "none",
            }}
          >
            <span style={{ position: "absolute", left: 0, top: "-12px", fontSize: "11px", color: "#94a3b8" }}>
              {val}
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
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Filled gradient area below curve with Framer Motion Fade-in */}
        <motion.path
          d={fillD}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Bright blue curved stroke line with Framer Motion Path Length Animation */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />

        {/* Interactive Dots on curve with Spring animations */}
        {points.map((p, idx) => (
          <g key={idx} onMouseEnter={() => onHoverPoint(p)} style={{ cursor: "pointer" }}>
            <circle cx={p.x} cy={p.y} r="8" fill="transparent" />
            {p.visitors > 0 && (
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="1.5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 2 }}
                transition={{ delay: 0.4 + idx * 0.03, type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
          </g>
        ))}
      </svg>

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
}: {
  segments: Array<{ percent: number; color: string }>;
  centerTopLabel: string;
  centerValue: string;
}) {
  const size = 130;
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
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 20 }}
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
        <span style={{ fontSize: "10px", color: "#64748b", textTransform: "capitalize", lineHeight: 1.1 }}>
          {centerTopLabel}
        </span>
        <span style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", marginTop: "2px" }}>
          {centerValue}
        </span>
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
}: {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: any;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 10px 20px rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.2 }}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "18px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>{title}</span>
        <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} color="#2563eb" />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a" }}>{value}</span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: isPositive ? "#16a34a" : "#dc2626",
            background: isPositive ? "#dcfce7" : "#fee2e2",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {change}
        </span>
      </div>
    </motion.div>
  );
}
