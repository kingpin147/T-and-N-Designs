import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | LocalSOP Chrome Extension",
  description:
    "Official single-purpose privacy policy, 100% local-first data declaration, and Chrome Web Store permissions justification for LocalSOP — Private Click-to-Guide Builder.",
  alternates: {
    canonical: "https://www.tnndesigns.com/extension/localsop/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const PERMISSIONS = [
  {
    perm: "sidePanel",
    justification: "Displays the LocalSOP step editor, recording controls, and export bar alongside the active browser tab without obscuring web page content.",
  },
  {
    perm: "activeTab",
    justification: "Grants temporary, user-initiated access to the currently active tab only when clicking 'Start Capture' or 'Blur'. Enables click-coordinate detection and visible-tab screenshots without requiring broad host permissions.",
  },
  {
    perm: "scripting",
    justification: "Required to inject the lightweight click-listener and local DOM-blur redaction script into the active tab strictly while Capture or Blur mode is active.",
  },
  {
    perm: "storage",
    justification: "Stores the user's local UI preferences (theme mode and typography sizing) locally on the device using chrome.storage.local.",
  },
];

export default function LocalSOPPrivacyPage() {
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
      <div className="container" style={{ maxWidth: "920px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Navigation Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/extension" style={{ color: "#64748b", textDecoration: "none" }}>Extensions</Link>
          <span>/</span>
          <Link href="/extension/localsop" style={{ color: "#64748b", textDecoration: "none" }}>LocalSOP</Link>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Privacy Policy</span>
        </div>

        {/* Policy Header */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              fontWeight: 700,
              color: "#0f2942",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "16px",
            }}
          >
            <span>Chrome Web Store Privacy Declaration</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 4.5vw, 42px)",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.025em",
              marginBottom: "12px",
            }}
          >
            Privacy Policy — LocalSOP
          </h1>

          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            <strong>Effective Date:</strong> November 28, 2026 &bull; <strong>Developer:</strong> T &amp; N Designs &bull; <strong>Version:</strong> 1.0.0
          </p>
        </div>

        {/* Core Local-First Guarantee Callout */}
        <div
          style={{
            padding: "24px",
            borderRadius: "14px",
            background: "#f8fafc",
            border: "1px solid #cbd5e1",
            marginBottom: "40px",
            display: "flex",
            gap: "18px",
            alignItems: "flex-start",
          }}
        >
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#0f2942", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Lock size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
              100% Local-First Architecture Guarantee
            </h2>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              LocalSOP does <strong>not collect, transmit, store, or sell any personal data, browsing history, or captured screenshots to external servers</strong>. 
              All captured workflows, step captions, and images are stored exclusively inside your browser&apos;s local IndexedDB and chrome.storage.local on your device.
            </p>
          </div>
        </div>

        {/* Section 1: Single Purpose */}
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
            1. Single Purpose Description
          </h2>
          <p style={{ color: "#475569", fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
            LocalSOP serves one dedicated single purpose: <strong>to record user-initiated clicks on the active browser tab to build local, redacted step-by-step Standard Operating Procedure (SOP) guides and export them as HTML, PDF, or Markdown</strong>. 
            The extension does not serve advertisements, mine cryptocurrency, track browsing behavior across websites, or transmit session tokens.
          </p>
        </div>

        {/* Section 2: Data Collection & Storage */}
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
            2. Data Collection, Transmission &amp; Storage
          </h2>
          <ul style={{ paddingLeft: "20px", color: "#475569", fontSize: "15px", lineHeight: 1.8, margin: 0 }}>
            <li>
              <strong>No Cloud Storage:</strong> Screenshots, steps, and user notes are saved solely in the browser&apos;s local IndexedDB storage.
            </li>
            <li>
              <strong>Zero Telemetry &amp; Analytics:</strong> LocalSOP contains zero tracking scripts, Google Analytics tags, or remote crash reporters.
            </li>
            <li>
              <strong>No Account Required:</strong> The extension operates anonymously without requiring email addresses, logins, or payment credentials.
            </li>
            <li>
              <strong>Client-Side Processing:</strong> Live DOM blurring, screenshot highlighting, and document exports are performed entirely client-side using JavaScript canvas and standard web APIs.
            </li>
          </ul>
        </div>

        {/* Section 3: Permission Justifications */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "16px" }}>
            3. Chrome Web Store Permissions Justification
          </h2>

          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "14px 18px", color: "#0f2942", fontWeight: 700, width: "180px" }}>Permission</th>
                  <th style={{ padding: "14px 18px", color: "#0f2942", fontWeight: 700 }}>Technical Justification</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < PERMISSIONS.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                    <td style={{ padding: "14px 18px", fontFamily: "monospace", fontWeight: 700, color: "#0f2942" }}>
                      {p.perm}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#475569", lineHeight: 1.6 }}>
                      {p.justification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Data Retention & User Control */}
        <div style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
            4. User Data Retention &amp; Permanent Deletion
          </h2>
          <p style={{ color: "#475569", fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
            Because all data resides exclusively in your browser sandbox, you have full ownership and total control over your information at all times:
          </p>
          <ul style={{ paddingLeft: "20px", color: "#475569", fontSize: "15px", lineHeight: 1.8, marginTop: "8px" }}>
            <li>You can delete individual captured steps or entire SOP guides directly from the LocalSOP Side Panel.</li>
            <li>Uninstalling the extension or clearing your browser&apos;s site data permanently and irreversibly deletes all stored guides, screenshots, and preferences.</li>
          </ul>
        </div>

        {/* Section 5: Developer Contact */}
        <div
          style={{
            padding: "28px",
            borderRadius: "14px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            5. Developer Information &amp; Contact
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
            For privacy compliance questions, technical inquiries, or assistance, contact our developer team:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "4px" }}>
            <a
              href="mailto:nomiking0072012@gmail.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#0f2942",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              <Mail size={16} />
              <span>nomiking0072012@gmail.com</span>
            </a>
            <a
              href="mailto:contact@tnndesigns.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#0f2942",
                fontWeight: 600,
                fontSize: "14px",
                textDecoration: "none",
              }}
            >
              <Mail size={16} />
              <span>contact@tnndesigns.com</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
