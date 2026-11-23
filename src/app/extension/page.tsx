import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Chrome Extension | T & N Design Auto Fill Form",
  description: "Official support documentation and privacy policy for T & N Design Auto Fill Form Chrome Extension.",
  alternates: {
    canonical: "https://www.tnndesigns.com/extension",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ExtensionIndexPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "140px", paddingBottom: "100px", background: "#ffffff", color: "#0f172a" }}>
      <div className="container" style={{ maxWidth: "800px", position: "relative", zIndex: 1, textAlign: "center" }}>
        
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "999px", background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: 700, color: "#0f2942", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "16px" }}>
          <span>Chrome Extension Portal</span>
        </div>

        <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", marginBottom: "14px" }}>
          T &amp; N Design Auto Fill Form
        </h1>

        <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6, maxWidth: "620px", margin: "0 auto 40px auto" }}>
          100% Free &amp; Unlimited Form Autofill &amp; Online Data Entry Extension engineered by T &amp; N Designs for Google Forms, Google Sheets, Case Management Systems (CMS), and web forms.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", textAlign: "left" }}>
          
          <Link
            href="/extension/support"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "28px",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.15s ease, border-color 0.15s ease",
            }}
          >
            <div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <BookOpen size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                Extension Support &amp; Documentation
              </h2>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Installation guides, keyboard shortcuts, Google Forms integration, CMS profiling, dynamic date macros, and troubleshooting.
              </p>
            </div>
            <div style={{ marginTop: "20px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0f2942" }}>
              <span>View Documentation</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            href="/extension/privacy"
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "28px",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.15s ease, border-color 0.15s ease",
            }}
          >
            <div>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <ShieldCheck size={20} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                Single-Purpose Privacy Policy
              </h2>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Official Chrome Web Store declaration, 100% local-first storage architecture, zero telemetry policy, and permission justifications.
              </p>
            </div>
            <div style={{ marginTop: "20px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "#0f2942" }}>
              <span>View Privacy Policy</span>
              <ArrowRight size={14} />
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
