import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { 
  ArrowRight, 
  BookOpen, 
  ShieldCheck, 
  EyeOff, 
  FileDown, 
  MousePointerClick, 
  Sparkles, 
  Laptop, 
  Lock, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";

export const metadata: Metadata = {
  title: "LocalSOP — Private Click-to-Guide Builder | Chrome Extension",
  description:
    "Official homepage for LocalSOP: 100% local-first step-by-step SOP & guide recorder with built-in privacy blur. Zero cloud uploads, instant HTML, PDF, and Markdown export.",
  alternates: {
    canonical: "https://www.tnndesigns.com/extension/localsop",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LocalSOPHomePage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        paddingTop: "130px",
        paddingBottom: "110px",
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: "inherit",
      }}
    >
      <div className="container" style={{ maxWidth: "980px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/extension" style={{ color: "#64748b", textDecoration: "none" }}>Extensions</Link>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>LocalSOP</span>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: "center", maxWidth: "820px", margin: "0 auto 56px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              borderRadius: "999px",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              fontWeight: 700,
              color: "#0f2942",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "20px",
            }}
          >
            <span>Chrome Web Store Extension &bull; 100% Local-First</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 50px)",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              marginBottom: "18px",
            }}
          >
            LocalSOP — Private Click-to-Guide Builder
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#475569",
              lineHeight: 1.6,
              maxWidth: "700px",
              margin: "0 auto 32px auto",
            }}
          >
            Turn any web workflow into a crisp, step-by-step SOP guide in seconds. 
            Engineered with built-in privacy blur &amp; instant HTML, PDF, and Markdown export — 
            <strong>zero cloud uploads, zero subscriptions, zero telemetry.</strong>
          </p>

          {/* Action Hub */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px", marginBottom: "40px" }}>
            <Link
              href="/extension/localsop/support"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                background: "#0f2942",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                transition: "opacity 0.15s ease",
              }}
            >
              <BookOpen size={16} />
              <span>User Documentation &amp; Support</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/extension/localsop/privacy"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                background: "#f8fafc",
                border: "1px solid #cbd5e1",
                color: "#0f2942",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <ShieldCheck size={16} />
              <span>Privacy Policy</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              padding: "20px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              textAlign: "left",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Architecture</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f2942", marginTop: "2px" }}>100% Local-First (IndexedDB)</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Privacy Redaction</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f2942", marginTop: "2px" }}>Live DOM + Canvas Blur</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Export Formats</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f2942", marginTop: "2px" }}>HTML, PDF &amp; Markdown</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Shortcut</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f2942", marginTop: "2px" }}>Alt + Shift + S</div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div style={{ marginBottom: "64px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "24px", textAlign: "center" }}>
            Engineered for Operations, QA, Support &amp; IT Teams
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "20px" }}>
            
            {/* Feature 1 */}
            <div style={{ padding: "26px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <MousePointerClick size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                Click-to-Step Recording
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                Click &ldquo;Start Capture&rdquo; and walk through any web application. Every click automatically captures a high-resolution screenshot with a numbered highlight ring and an editable step caption.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: "26px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <EyeOff size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                Dual-Layer Privacy Blur
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                <strong>Live Blur Mode:</strong> Click any sensitive email, salary, or client ID directly on the live page before capturing. 
                <strong>Post-Capture Redact:</strong> Drag a blur box over any recorded screenshot inside the Side Panel.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: "26px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <FileDown size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                Instant Local Exports
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                Export complete documentation in 3 free formats: self-contained responsive HTML files that open anywhere, clean Print/Save as PDF, or 1-click Markdown for Notion, Confluence, and GitHub.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{ padding: "26px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Lock size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                100% Private &amp; Air-Gapped
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                All guides, captions, and screenshots remain strictly on your local computer in your browser&apos;s IndexedDB. Zero cloud uploads, zero external telemetry, and zero mandatory user logins.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{ padding: "26px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Laptop size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                Chrome Side Panel Workspace
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                Runs completely inside Chrome&apos;s native Side Panel. Record workflows on your main tab without switching windows, losing focus, or covering crucial application menus.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{ padding: "26px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                Low-Eye-Strain Design
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                Built with Warm Alabaster light mode, Soft Charcoal dark mode, and 3 adjustable typography scales (Compact, Comfortable, Large) for fatigue-free documentation authoring.
              </p>
            </div>

          </div>
        </div>

        {/* CWS Link Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          <Link
            href="/extension/localsop/support"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "26px",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f2942", textTransform: "uppercase", marginBottom: "8px" }}>Documentation</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>Support &amp; User Manual</h3>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Learn how to record workflows, redact sensitive personal info, configure shortcuts, and export guides into HTML/PDF/Markdown.
              </p>
            </div>
            <div style={{ marginTop: "18px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0f2942" }}>
              <span>Read Documentation</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            href="/extension/localsop/privacy"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "26px",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f2942", textTransform: "uppercase", marginBottom: "8px" }}>Compliance</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>Single-Purpose Privacy Policy</h3>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Review our zero-data-collection policy, Chrome permission justifications, and local-first browser storage declarations.
              </p>
            </div>
            <div style={{ marginTop: "18px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0f2942" }}>
              <span>View Privacy Policy</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
