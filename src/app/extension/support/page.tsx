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
  Code2,
  FileSpreadsheet,
  Globe2,
  Lock,
  Cpu
} from "lucide-react";

export const metadata: Metadata = {
  title: "Extension Support & Documentation | T & N Design Auto Fill Form",
  description:
    "Official documentation, keyboard shortcuts, installation guides, and technical support for T & N Design Auto Fill Form Chrome Extension.",
  alternates: {
    canonical: "https://www.tnndesigns.com/extension/support",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const SHORTCUTS = [
  { keys: "Ctrl + Shift + X", action: "Execute Active Profile", desc: "Instantly autofills the current form, Google Form, or web page." },
  { keys: "Ctrl + Shift + G", action: "Generate Rules from Form", desc: "Scans active page (including Google Forms questions) and saves rules." },
  { keys: "Alt + A", action: "Toggle Floating Toolbar", desc: "Shows or hides the in-page quick automation toolbar." },
  { keys: "Ctrl + Shift + F", action: "Open Toolbar Popup", desc: "Opens the extension quick action menu in Chrome." },
  { keys: "Alt + V", action: "Paste Preset into Focused Field", desc: "Injects preset value into active input, cell, or contenteditable." },
];

const MACROS = [
  { macro: "{$TODAY} / {$DATE}", example: "2026-10-17", description: "Inserts current system date in YYYY-MM-DD standard format." },
  { macro: "{$YEAR}", example: "2026", description: "Inserts current 4-digit calendar year." },
  { macro: "{$TIME}", example: "14:32:05", description: "Inserts current local time in HH:MM:SS format." },
  { macro: "{$RANDOM_NUM}", example: "847291", description: "Generates a randomized 6-digit number for test IDs or reference codes." },
  { macro: "{$UUID}", example: "e4eaaaf2-...", description: "Generates a unique cryptographic standard v4 UUID string." },
  { macro: "{@variable_name}", example: "Custom text", description: "Injects user-defined shared variables across multiple rules." },
];

const FAQS = [
  {
    q: "How does the extension handle dependent / cascading dropdowns (e.g. District to Police Station)?",
    a: "The extension features a configurable delay timer (in milliseconds) for cascading AJAX fields. For instance, when 'District: Lahore' is selected, you can configure a 300ms–800ms delay before the second rule automatically selects 'Police Station: Civil Lines' once the server response populates the DOM.",
  },
  {
    q: "Does this extension transmit any form data or case numbers to external servers?",
    a: "No. The extension enforces a strict 100% Local-First Architecture. All profiles, selectors, and field values are stored solely in your local browser sandbox via chrome.storage.local. There is zero external network transmission, zero tracking, and zero telemetry.",
  },
  {
    q: "Can I use my autofill rules across multiple workstations or backup my profiles?",
    a: "Yes. In the Options Manager (accessible via right-click > Options), you can export your rules into Google Sheets / Excel compatible CSV format or complete JSON backup files. You can import these files onto any workstation instantly.",
  },
  {
    q: "Why does Google Forms sometimes require native synthetic events?",
    a: "Modern web applications and Google Forms use internal reactive state trackers (such as Closure or React). When injecting text, the extension automatically dispatches native 'input', 'change', and 'blur' synthetic DOM events so the form's internal validation recognizes the filled field immediately.",
  },
  {
    q: "Is this extension free to use for commercial and legal work?",
    a: "Yes. T & N Design Auto Fill Form is 100% free and unlimited. There are zero daily usage caps, zero paywalls, and zero locked features.",
  },
];

export default function ExtensionSupportPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "120px", paddingBottom: "100px", background: "#ffffff", color: "#0f172a" }}>
      <div className="container" style={{ maxWidth: "1000px", position: "relative", zIndex: 1 }}>
        
        {/* Breadcrumb & Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
          <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <span>Chrome Extension</span>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Support &amp; Documentation</span>
        </div>

        {/* Hero Section */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "4px 12px", borderRadius: "999px", background: "#f1f5f9", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: 700, color: "#0f2942", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "16px" }}>
            <span>Chrome Extension Documentation &amp; Help Center</span>
          </div>
          <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: "16px" }}>
            T &amp; N Design Auto Fill Form
          </h1>
          <p style={{ color: "#475569", fontSize: "17px", lineHeight: 1.6, maxWidth: "800px" }}>
            Universal data filing, form autofill, and online data entry automation extension engineered by <strong>T &amp; N Designs</strong>. 
            Compatible with Google Forms, Google Sheets, Case Management Systems (CMS), CRM portals, and web registries.
          </p>
        </div>

        {/* Quick Specs Bento */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Standard</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>Manifest V3 Compliant</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Event-driven background service worker</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Privacy Architecture</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>100% Local-First</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Zero remote network transmission</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Licensing</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>100% Free &amp; Unlimited</div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Zero daily caps &bull; Zero paywalls</div>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>Direct Privacy Policy</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f2942", marginTop: "4px" }}>
              <Link href="/extension/privacy" style={{ color: "#0f2942", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span>Read Policy</span> <ArrowRight size={15} />
              </Link>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Full Chrome Store declaration</div>
          </div>
        </div>

        {/* SECTION 1: Installation & Quick Setup */}
        <div style={{ marginBottom: "50px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Cpu size={20} color="#0f2942" />
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Installation &amp; Setup Walkthrough
            </h2>
          </div>
          <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, marginBottom: "20px" }}>
            To install the extension package locally into Google Chrome:
          </p>
          <ol style={{ paddingLeft: "20px", color: "#334155", fontSize: "14px", lineHeight: 1.8, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>Open Google Chrome and navigate to <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontSize: "13px", color: "#0f172a" }}>chrome://extensions/</code> in your address bar.</li>
            <li>Toggle <strong>Developer mode</strong> ON in the upper-right corner of the Extensions dashboard.</li>
            <li>Click the <strong>Load unpacked</strong> button located in the top-left toolbar.</li>
            <li>Select the extension directory on your machine.</li>
            <li>The <strong>T &amp; N Design Auto Fill Form</strong> extension will immediately appear in your installed list.</li>
            <li>Click the Extensions puzzle icon in Chrome and click the Pin icon to lock the extension (⚡) to your toolbar for quick access.</li>
          </ol>
        </div>

        {/* SECTION 2: Universal Engine Compatibility */}
        <div style={{ marginBottom: "50px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              Universal Automation: Supported Environments
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>
              The extension is dynamic and unconstrained by rigid selectors—it automatically parses form topologies across:
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            
            {/* Google Forms */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Globe2 size={18} color="#0f2942" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Google Forms</h3>
              </div>
              <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Recognizes Google Forms question structures (<code style={{ fontSize: "12px" }}>.geS5n</code>), titles (<code style={{ fontSize: "12px" }}>.M7eMe</code>), short answers, paragraph textareas, multiple choice radio buttons (<code style={{ fontSize: "12px" }}>role=&quot;radio&quot;</code>), checkboxes, and listbox dropdowns. Dispatches native events so Google Forms internal validation marks fields completed.
              </p>
            </div>

            {/* Google Sheets */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <FileSpreadsheet size={18} color="#0f2942" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Google Sheets &amp; Web Tables</h3>
              </div>
              <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Injects text presets directly into active spreadsheet cells (<code style={{ fontSize: "12px" }}>#waffle-rich-text-editor</code>), the formula bar (<code style={{ fontSize: "12px" }}>#t-formula-bar-input</code>), or contenteditable grids. Includes a minimizable floating pill widget <strong>[⚡ Auto Fill]</strong> for non-obtrusive data entry.
              </p>
            </div>

            {/* CMS & Court Systems */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Layers size={18} color="#0f2942" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Case Management Systems (CMS)</h3>
              </div>
              <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Pre-configured profile for District Courts, Sessions Courts, and Case Management Systems. Automates cascading AJAX dropdowns (e.g. District &rarr; Police Station) with customizable execution delays and auto-advances.
              </p>
            </div>

            {/* Any Web SaaS */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Code2 size={18} color="#0f2942" />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>General SaaS, CRM &amp; Portals</h3>
              </div>
              <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>
                Intelligent semantic label inference automatically matches form inputs by searching <code style={{ fontSize: "12px" }}>&lt;label&gt;</code>, <code style={{ fontSize: "12px" }}>placeholder</code>, <code style={{ fontSize: "12px" }}>aria-label</code>, and preceding headings with a built-in synonym dictionary.
              </p>
            </div>

          </div>
        </div>

        {/* SECTION 3: Keyboard Shortcuts Guide */}
        <div style={{ marginBottom: "50px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Keyboard size={20} color="#0f2942" />
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Keyboard Shortcuts Reference
            </h2>
          </div>
          
          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#ffffff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 18px", fontWeight: 700, color: "#0f172a", width: "240px" }}>Shortcut Key</th>
                  <th style={{ padding: "12px 18px", fontWeight: 700, color: "#0f172a", width: "220px" }}>Action</th>
                  <th style={{ padding: "12px 18px", fontWeight: 700, color: "#0f172a" }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {SHORTCUTS.map((s, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < SHORTCUTS.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f2942" }}>
                      <kbd style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 8px", fontSize: "12px", fontFamily: "inherit" }}>
                        {s.keys}
                      </kbd>
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: 600, color: "#0f172a" }}>{s.action}</td>
                    <td style={{ padding: "14px 18px", color: "#475569" }}>{s.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: Macros & Dynamic Variables */}
        <div style={{ marginBottom: "50px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Code2 size={20} color="#0f2942" />
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Dynamic Variables &amp; Date Macros
            </h2>
          </div>
          <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px" }}>
            You can embed dynamic macros into any rule value. When the rule executes, the extension automatically computes and injects the live value:
          </p>

          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#ffffff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 18px", fontWeight: 700, color: "#0f172a", width: "200px" }}>Variable Macro</th>
                  <th style={{ padding: "12px 18px", fontWeight: 700, color: "#0f172a", width: "160px" }}>Rendered Example</th>
                  <th style={{ padding: "12px 18px", fontWeight: 700, color: "#0f172a" }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {MACROS.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: idx < MACROS.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f2942" }}>
                      <code style={{ background: "#f1f5f9", padding: "3px 6px", borderRadius: "4px", fontSize: "12px" }}>
                        {m.macro}
                      </code>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#0f172a", fontWeight: 600 }}>{m.example}</td>
                    <td style={{ padding: "14px 18px", color: "#475569" }}>{m.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 5: Frequently Asked Questions & Troubleshooting */}
        <div style={{ marginBottom: "50px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <HelpCircle size={20} color="#0f2942" />
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Technical Questions &amp; Troubleshooting
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px 20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                  {faq.q}
                </h3>
                <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: Official Publisher & Support Contact */}
        <div style={{ background: "#0f2942", color: "#ffffff", borderRadius: "14px", padding: "36px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div style={{ maxWidth: "600px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
              Publisher Support &amp; Technical Help
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 8px 0" }}>
              Need Help or Custom Portal Profiling?
            </h2>
            <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
              If your organization uses a proprietary legal portal, internal CMS, or government form that requires tailored field mapping, our engineering team is available for assistance.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a
              href="mailto:contact@tnndesign.com?subject=T%26N%20Auto%20Fill%20Extension%20Support"
              style={{
                background: "#ffffff",
                color: "#0f2942",
                fontWeight: 700,
                fontSize: "14px",
                padding: "12px 22px",
                borderRadius: "8px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Mail size={16} />
              <span>Contact Extension Support</span>
            </a>
            <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
              Direct email: <strong style={{ color: "#ffffff" }}>contact@tnndesign.com</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
