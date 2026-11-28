import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { 
  Keyboard, 
  Layers, 
  HelpCircle, 
  Mail, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  MousePointerClick,
  EyeOff,
  FileDown,
  ShieldCheck,
  Laptop,
  AlertCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "LocalSOP Support & Documentation | Chrome Extension",
  description:
    "Official documentation, step-by-step user guide, keyboard shortcuts, and technical support for LocalSOP — Private Click-to-Guide Builder.",
  alternates: {
    canonical: "https://www.tnndesigns.com/extension/localsop/support",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SHORTCUTS = [
  { keys: "Alt + Shift + S", action: "Toggle LocalSOP Side Panel", desc: "Opens or closes the LocalSOP recording workspace in Chrome (Mac: Option + Shift + S)." },
  { keys: "Ctrl + P / Cmd + P", action: "Save Guide as PDF", desc: "When viewing exported HTML guide, opens native browser print dialog formatted for clean PDF generation." },
];

const FAQS = [
  {
    q: "Where are my recorded guides and screenshots stored?",
    a: "All captured screenshots, steps, and captions are saved 100% locally on your computer inside your browser's IndexedDB and chrome.storage.local. No images or text are ever transmitted to any cloud servers or external analytics systems.",
  },
  {
    q: "How does Live Blur Mode work?",
    a: "Clicking the 'Blur' button in the LocalSOP Side Panel activates the in-page redaction cursor. Click on any sensitive element (such as client names, account balances, emails, or API keys) to apply a local CSS blur filter to the live DOM before you begin recording. The blur is temporary and leaves your actual page data untouched.",
  },
  {
    q: "How can I blur or redact information on screenshots after recording?",
    a: "LocalSOP features Post-Capture Canvas Redaction. Open any captured step in the Side Panel, select the Redact tool, and drag a blur box over any sensitive region of the screenshot. The change is saved directly to your local image in IndexedDB.",
  },
  {
    q: "Can I export my guides to Notion, Confluence, or GitHub?",
    a: "Yes. In the Export menu, click 'Copy Markdown'. This copies a complete, cleanly structured markdown guide with numbered headers, step captions, and embedded image references ready to paste directly into Notion, Confluence, Jira, or GitHub READMEs.",
  },
  {
    q: "Does LocalSOP require a subscription or account?",
    a: "No. LocalSOP is built by T & N Designs as a 100% free, subscription-free, local-first utility. There are zero account signups, zero daily usage caps, and zero paywalled export formats.",
  },
  {
    q: "How do I report a bug or request a feature?",
    a: "You can email our engineering team directly at contact@tnndesigns.com or nomiking0072012@gmail.com. We respond to all extension support queries within 24 hours.",
  },
];

export default function LocalSOPSupportPage() {
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
      <div className="container" style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Navigation Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/extension" style={{ color: "#64748b", textDecoration: "none" }}>Extensions</Link>
          <span>/</span>
          <Link href="/extension/localsop" style={{ color: "#64748b", textDecoration: "none" }}>LocalSOP</Link>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Support &amp; User Guide</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
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
            <span>Official User Documentation</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 4.5vw, 44px)",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.025em",
              marginBottom: "14px",
            }}
          >
            LocalSOP Documentation &amp; Support
          </h1>

          <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6, maxWidth: "760px", margin: 0 }}>
            Everything you need to know about recording automated step-by-step SOP guides, redacting sensitive data, managing local IndexedDB storage, and exporting documentation without cloud dependencies.
          </p>
        </div>

        {/* Step-by-Step Walkthrough */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "20px" }}>
            Quick Start: 4 Steps to Your First Guide
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
            
            <div style={{ padding: "22px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f2942", textTransform: "uppercase", marginBottom: "6px" }}>Step 1</div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>Open Side Panel</h3>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Press <kbd style={{ padding: "2px 6px", background: "#e2e8f0", borderRadius: "4px", fontSize: "12px" }}>Alt + Shift + S</kbd> or click the LocalSOP icon in your Chrome toolbar to open the workspace.
              </p>
            </div>

            <div style={{ padding: "22px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f2942", textTransform: "uppercase", marginBottom: "6px" }}>Step 2</div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>Redact Live Info (Optional)</h3>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Click &ldquo;Blur&rdquo; to click and hide any confidential client data, salaries, or emails directly on the web page before recording.
              </p>
            </div>

            <div style={{ padding: "22px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f2942", textTransform: "uppercase", marginBottom: "6px" }}>Step 3</div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>Click &ldquo;Start Capture&rdquo;</h3>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Walk through your workflow. Every click captures a screenshot with an auto-numbered badge and an editable descriptive caption.
              </p>
            </div>

            <div style={{ padding: "22px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f2942", textTransform: "uppercase", marginBottom: "6px" }}>Step 4</div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>Export Anywhere</h3>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Export a self-contained responsive HTML file, generate a clean PDF via Print, or copy formatted Markdown directly to Notion or Confluence.
              </p>
            </div>

          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Keyboard size={20} color="#0f2942" />
            <span>Keyboard Shortcuts</span>
          </h2>

          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "14px 18px", color: "#0f2942", fontWeight: 700, width: "240px" }}>Shortcut</th>
                  <th style={{ padding: "14px 18px", color: "#0f2942", fontWeight: 700, width: "220px" }}>Action</th>
                  <th style={{ padding: "14px 18px", color: "#0f2942", fontWeight: 700 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {SHORTCUTS.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < SHORTCUTS.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <kbd style={{ padding: "4px 8px", background: "#e2e8f0", borderRadius: "6px", fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                        {s.keys}
                      </kbd>
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: 600, color: "#0f172a" }}>{s.action}</td>
                    <td style={{ padding: "14px 18px", color: "#64748b" }}>{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div style={{ marginBottom: "64px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <HelpCircle size={20} color="#0f2942" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div style={{ display: "grid", gap: "16px" }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} style={{ padding: "22px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                  {faq.q}
                </h3>
                <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Support & Developer Contact Box */}
        <div
          style={{
            padding: "32px",
            borderRadius: "16px",
            background: "#0f2942",
            color: "#ffffff",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 6px 0", color: "#ffffff" }}>
              Need Help or Have a Feature Request?
            </h3>
            <p style={{ color: "#cbd5e1", fontSize: "14px", margin: 0, maxWidth: "540px", lineHeight: 1.6 }}>
              Our engineering team provides dedicated assistance for custom enterprise SOP workflows, export templating, and extension inquiries.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="mailto:contact@tnndesigns.com?subject=LocalSOP%20Support%20Inquiry"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "10px",
                background: "#ffffff",
                color: "#0f2942",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <Mail size={16} />
              <span>contact@tnndesigns.com</span>
            </a>

            <Link
              href="/extension/localsop/privacy"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.12)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <ShieldCheck size={16} />
              <span>Privacy Policy</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
