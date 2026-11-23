import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | T & N Design Auto Fill Form Extension",
  description:
    "Official single-purpose privacy policy, local-first data declaration, and Chrome Web Store permissions justification for T & N Design Auto Fill Form Extension.",
  alternates: {
    canonical: "https://www.tnndesigns.com/extension/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const PERMISSIONS = [
  {
    perm: "storage",
    justification: "Required to save user-defined autofill rules, profiles, variables, and exceptions locally on the user's device using chrome.storage.local.",
  },
  {
    perm: "activeTab",
    justification: "Required to interact with and fill the form input fields of the currently active browser tab upon explicit user invocation (hotkey, popup, or toolbar).",
  },
  {
    perm: "scripting",
    justification: "Required to dispatch native synthetic DOM events (input, change, blur) on web forms to ensure compatibility with modern frameworks (React, Angular, Vue, and CMS portals).",
  },
  {
    perm: "sidePanel",
    justification: "Provides an optional side-by-side workspace next to the active form for continuous data entry and profile inspection without closing popups.",
  },
  {
    perm: "contextMenus",
    justification: "Adds convenient right-click context menu shortcuts to autofill the active page, capture new field rules, or toggle the side panel.",
  },
  {
    perm: "<all_urls>",
    justification: "Enables universal automated form autofill on user-configured target websites and renders the floating in-page helper pill on forms matching the user's active profile filters.",
  },
];

export default function ExtensionPrivacyPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "120px", paddingBottom: "100px", background: "#ffffff", color: "#0f172a" }}>
      <div className="container" style={{ maxWidth: "920px", position: "relative", zIndex: 1 }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link href="/extension/support" style={{ color: "#64748b", textDecoration: "none" }}>Chrome Extension</Link>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Privacy Policy</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "999px", background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: 700, color: "#0f2942", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "14px" }}>
            <span>Chrome Web Store Policy Declaration</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 3.8vw, 42px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: "12px" }}>
            Privacy Policy for T &amp; N Design Auto Fill Form
          </h1>
          <div style={{ fontSize: "14px", color: "#64748b", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <span><strong>Effective Date:</strong> October 17, 2026</span>
            <span>&bull;</span>
            <span><strong>Last Updated:</strong> October 17, 2026</span>
            <span>&bull;</span>
            <span><strong>Publisher:</strong> T &amp; N Designs</span>
          </div>
        </div>

        {/* Local-First Guarantee Callout */}
        <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "12px", padding: "20px 24px", marginBottom: "40px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
          <Lock size={22} color="#0f2942" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
              Strict Local-First Architecture Guarantee
            </h3>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              The <strong>T &amp; N Design Auto Fill Form</strong> extension operates exclusively within your local Google Chrome browser. Your autofill rules, profile values, and form inputs <strong>never leave your device</strong>. The extension initiates zero external outbound server requests and collects zero personal data, analytics, or telemetry.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "36px", fontSize: "14px", lineHeight: 1.7, color: "#334155" }}>
          
          {/* Section 1 */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              1. Overview
            </h2>
            <p>
              <strong>T &amp; N Design Auto Fill Form</strong> (&quot;the Extension&quot;), engineered by <strong>T &amp; N Designs</strong>, is an unconstrained, universal form-filling and data entry automation tool. It is designed to assist professionals, operators, and legal staff in eliminating repetitive typing across web forms, Google Forms, Google Sheets, Case Management Systems (CMS), and administrative registries.
            </p>
            <p>
              We firmly respect user privacy and enforce a strict <strong>Local-First Architecture</strong>. All operations occur client-side without third-party intervention.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              2. Single-Purpose Declaration
            </h2>
            <p>
              In accordance with Google Chrome Web Store Developer Program Policies, the sole single purpose of the Extension is to allow users to store repetitive form field entries (such as court categories, standard dates, names, and contact parameters) and automatically populate them into web forms upon user command.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              3. Information Collection and Handling
            </h2>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <strong>100% On-Device Local Storage:</strong> User-configured field names, CSS/XPath selectors, default values, and execution delays are stored solely on your computer inside Chrome&apos;s private sandbox using <code style={{ background: "#f1f5f9", padding: "2px 5px", borderRadius: "4px" }}>chrome.storage.local</code>.
              </li>
              <li>
                <strong>Zero Remote Network Transmission:</strong> The Extension makes <strong>NO outbound network requests</strong>, connects to no external backend servers, and contains zero third-party analytics, tracking pixels, cookies, or telemetry scripts.
              </li>
              <li>
                <strong>Zero Telemetry or Usage Tracking:</strong> We do not track, log, or observe which websites you visit, which legal cases or clients you manage, or what data you enter into form fields.
              </li>
              <li>
                <strong>No Sale or Monetization of User Data:</strong> Your data is never collected, viewed, sold, leased, or transferred to third parties for advertising, marketing, data mining, credit evaluation, or any commercial endeavor.
              </li>
            </ul>
          </div>

          {/* Section 4: Permissions Table */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              4. Chrome Web Store Permissions &amp; Technical Justification
            </h2>
            <p style={{ marginBottom: "16px" }}>
              The Extension requests only the minimum necessary permissions required to deliver its single-purpose autofill automation, adhering strictly to the principle of least privilege and Manifest V3:
            </p>

            <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#ffffff" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a", width: "160px" }}>Permission</th>
                    <th style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>Technical Justification</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < PERMISSIONS.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f2942" }}>
                        <code style={{ background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px" }}>{p.perm}</code>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{p.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              5. Third-Party Code &amp; Manifest V3 Security
            </h2>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Zero Remotely Hosted Code:</strong> All scripts, stylesheets, and extension assets are packaged 100% locally within the extension directory. Zero external CDNs or remote dependencies are utilized.</li>
              <li><strong>No String-to-Code Execution:</strong> The Extension does NOT employ <code style={{ background: "#f1f5f9", padding: "2px 5px", borderRadius: "4px" }}>eval()</code>, <code style={{ background: "#f1f5f9", padding: "2px 5px", borderRadius: "4px" }}>new Function()</code>, or dynamic script tag injection.</li>
              <li><strong>Audit-Ready:</strong> All code is human-readable, un-obfuscated vanilla JavaScript adhering to Manifest V3 sandboxing rules.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              6. User Control and Complete Data Management
            </h2>
            <p>
              Users maintain unrestricted authority over their configured data:
            </p>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>You can create, edit, disable, or delete individual autofill rules and profiles at any time.</li>
              <li>You can export your complete rule inventory into Google Sheets / Excel compatible CSV format or structured JSON.</li>
              <li>You can reset or wipe all stored rules with a single click in the Options page.</li>
              <li>Uninstalling the Extension immediately and permanently purges all stored profiles from Chrome local storage.</li>
            </ul>
          </div>

          {/* Section 7 */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginBottom: "12px" }}>
              7. Limited Use Compliance Declaration
            </h2>
            <p>
              The Extension&apos;s use of information received from Google APIs adheres to the <strong>Chrome Web Store User Data Policy</strong>, including the Limited Use requirements:
            </p>
            <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Data is accessed solely to provide the user-facing automated form entry feature.</li>
              <li>Data is never transferred to third parties or used for personalized advertising.</li>
              <li>No human reads user form data, nor does any automated server receive it.</li>
            </ul>
          </div>

          {/* Section 8: Publisher & Contact Information */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "24px", marginTop: "12px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 10px 0" }}>
              8. Publisher &amp; Contact Information
            </h2>
            <p style={{ margin: "0 0 14px 0", color: "#475569" }}>
              For any questions regarding this Privacy Policy, compliance audits, or technical support, please contact the developer:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px" }}>
              <div><strong>Organization:</strong> T &amp; N Designs</div>
              <div><strong>Official Website:</strong> <a href="https://www.tnndesigns.com" target="_blank" rel="noopener noreferrer" style={{ color: "#0f2942", fontWeight: 600 }}>https://www.tnndesigns.com</a></div>
              <div><strong>Privacy &amp; Support Email:</strong> <a href="mailto:contact@tnndesign.com" style={{ color: "#0f2942", fontWeight: 600 }}>contact@tnndesign.com</a></div>
            </div>
          </div>

        </div>

        {/* Back Link to Support */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/extension/support" style={{ color: "#0f2942", fontWeight: 600, textDecoration: "none", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span>&larr; Return to Extension Support &amp; Documentation</span>
          </Link>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>T &amp; N Designs &copy; 2026</span>
        </div>

      </div>
    </div>
  );
}
