"use client";

import React, { useState } from "react";
import {
  Search,
  Globe,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Loader2,
  MapPin,
  Clock,
  Send,
  Zap,
} from "lucide-react";

interface LeadFinderProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onRefreshLeads?: () => void;
}

interface LeadAudit {
  hasSSL: boolean;
  isMobileResponsive: boolean;
  cms: string;
  loadTimeMs: number;
  title: string;
  hasMetaDescription: boolean;
  opportunityScore: number;
  status: "healthy" | "needs_attention" | "critical_redesign";
  issues: string[];
}

interface BusinessLead {
  id: string;
  name: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  niche: string;
  audit: LeadAudit;
}

const NICHES = [
  { value: "plumber", label: "Plumbing" },
  { value: "electrician", label: "Electrician" },
  { value: "roofing", label: "Roofing" },
  { value: "solar", label: "Solar & Clean Energy" },
  { value: "dentist", label: "Dental Clinics" },
  { value: "doctor", label: "Medical & Health" },
  { value: "lawyer", label: "Legal & Attorneys" },
  { value: "real_estate", label: "Real Estate" },
  { value: "architect", label: "Architects & Design" },
  { value: "accountant", label: "Accounting & CPAs" },
  { value: "restaurant", label: "Restaurants & Dining" },
  { value: "hvac", label: "HVAC & Cooling" },
];

const POPULAR_CITIES = ["Austin", "Chicago", "Dallas", "Houston", "Miami", "London", "Lahore"];

export default function LeadFinderAuditor({ onNavigateTab, onRefreshLeads }: LeadFinderProps) {
  const [selectedNiche, setSelectedNiche] = useState("plumber");
  const [cityInput, setCityInput] = useState("Austin");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [savedLeadIds, setSavedLeadIds] = useState<Record<string, boolean>>({});
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchedCity, setSearchedCity] = useState("");

  const handleSearch = async (cityOverride?: string, nicheOverride?: string) => {
    const targetCity = cityOverride || cityInput.trim();
    const targetNiche = nicheOverride || selectedNiche;

    if (!targetCity) {
      setErrorMsg("Please enter a city or metropolitan region.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setSearchedCity(targetCity);

    try {
      const res = await fetch("/api/admin/lead-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: targetCity, niche: targetNiche }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeads(data.leads || []);
        if (data.message && data.leads.length === 0) {
          setErrorMsg(data.message);
        }
      } else {
        setErrorMsg(data.error || "Failed to search leads. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg("Connection error while querying search engine. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCRM = async (lead: BusinessLead) => {
    setSavingLeadId(lead.id);

    try {
      const auditSummary = `
Technical Audit Findings for ${lead.name}:
- Website: ${lead.website || "None"}
- Phone: ${lead.phone || "N/A"}
- SSL Security: ${lead.audit.hasSSL ? "Valid HTTPS" : "Insecure (Missing SSL)"}
- Mobile Viewport: ${lead.audit.isMobileResponsive ? "Mobile Ready" : "Broken Viewport (Not Mobile-Friendly)"}
- Detected CMS: ${lead.audit.cms}
- Page Load Speed: ${lead.audit.loadTimeMs ? (lead.audit.loadTimeMs / 1000).toFixed(1) + "s TTFB" : "N/A"}
- Redesign Need Score: ${lead.audit.opportunityScore}%
- Key Technical Issues: ${lead.audit.issues.join(", ")}
      `.trim();

      const res = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          email: "prospect@" + (lead.website ? new URL(lead.website).hostname.replace("www.", "") : "lead.local"),
          phone: lead.phone !== "N/A" ? lead.phone : undefined,
          company: lead.name,
          projectType: `Website Redesign (${lead.audit.cms})`,
          budgetRange: "$5,000 - $10,000",
          timeline: "Within 4 weeks",
          message: auditSummary,
          sourceUrl: lead.website || undefined,
        }),
      });

      if (res.ok) {
        setSavedLeadIds((prev) => ({ ...prev, [lead.id]: true }));
        if (onRefreshLeads) onRefreshLeads();
      }
    } catch (err) {
      console.error("Save to CRM error:", err);
    } finally {
      setSavingLeadId(null);
    }
  };

  // Stats Breakdown
  const totalLeads = leads.length;
  const criticalCount = leads.filter((l) => l.audit.opportunityScore >= 65).length;
  const noSSLCount = leads.filter((l) => !l.audit.hasSSL).length;
  const brokenMobileCount = leads.filter((l) => !l.audit.isMobileResponsive).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. TOP HEADER & SEARCH CARD */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Lead Finder &amp; Technical Website Auditor
              </h1>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  background: "#f1f5f9",
                  color: "#0f2942",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                100% Free Open-Source API
              </span>
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
              Scrape registered businesses in any global metro via OpenStreetMap Overpass API and run automated server-side technical audits to identify high-value redesign opportunities.
            </p>
          </div>
        </div>

        {/* Search Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) 180px",
            gap: "12px",
            alignItems: "end",
          }}
        >
          {/* Niche Selector */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              Target Business Niche
            </label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0f172a",
                background: "#ffffff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {NICHES.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>

          {/* City / Location Input */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
              City or Metropolitan Region
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Austin, Chicago, London..."
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  color: "#0f172a",
                  background: "#ffffff",
                  outline: "none",
                }}
              />
              <MapPin size={15} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "11px" }} />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            style={{
              background: "#0f2942",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              opacity: loading ? 0.7 : 1,
              height: "40px",
              transition: "all 0.15s ease",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Scraping &amp; Auditing...
              </>
            ) : (
              <>
                <Search size={15} /> Find &amp; Audit Leads
              </>
            )}
          </button>
        </div>

        {/* Quick City Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Quick metros:</span>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCityInput(c);
                handleSearch(c);
              }}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                background: "#f1f5f9",
                color: "#334155",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              color: "#0f172a",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertTriangle size={15} color="#0f2942" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 2. AUDIT SUMMARY METRICS (If Leads Found) */}
      {leads.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Discovered Listings</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{totalLeads}</div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>In {searchedCity}</span>
          </div>

          <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>High-Value Prospects</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{criticalCount}</div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Score &ge; 65% need redesign</span>
          </div>

          <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Security Vulnerability</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{noSSLCount}</div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Missing HTTPS / Insecure</span>
          </div>

          <div style={{ background: "#ffffff", padding: "14px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Mobile Responsiveness</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{brokenMobileCount}</div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Missing viewport tags</span>
          </div>
        </div>
      )}

      {/* 3. AUDITED LEADS BENTO GRID */}
      {leads.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 360px), 1fr))",
            gap: "16px",
          }}
        >
          {leads.map((lead) => {
            const isSaved = savedLeadIds[lead.id];
            const isSaving = savingLeadId === lead.id;

            return (
              <div
                key={lead.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "18px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  {/* Card Header: Name, Score Pill */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: "#0f172a",
                          margin: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={lead.name}
                      >
                        {lead.name}
                      </h3>
                      <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <MapPin size={11} /> {lead.address}
                      </div>
                    </div>

                    {/* Redesign Need Badge */}
                    <div
                      style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: lead.audit.opportunityScore >= 65 ? "#0f172a" : "#f1f5f9",
                        color: lead.audit.opportunityScore >= 65 ? "#ffffff" : "#0f172a",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                      title="Redesign Opportunity Score"
                    >
                      {lead.audit.opportunityScore}% Need
                    </div>
                  </div>

                  {/* Contact Links: Website & Phone */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", margin: "10px 0" }}>
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "12px",
                          color: "#0f2942",
                          fontWeight: 700,
                          textDecoration: "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Globe size={13} /> {lead.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Globe size={13} /> No Website Registered
                      </span>
                    )}

                    {lead.phone !== "N/A" && (
                      <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                        <Phone size={12} /> {lead.phone}
                      </div>
                    )}
                  </div>

                  {/* Technical Audit Matrix */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "10px",
                      padding: "10px 12px",
                      border: "1px solid #e2e8f0",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {lead.audit.hasSSL ? (
                        <ShieldCheck size={14} color="#0f2942" />
                      ) : (
                        <ShieldAlert size={14} color="#b91c1c" />
                      )}
                      <span style={{ color: lead.audit.hasSSL ? "#0f172a" : "#b91c1c", fontWeight: 600 }}>
                        {lead.audit.hasSSL ? "SSL Valid 🔒" : "No SSL ⚠️"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Smartphone size={14} color={lead.audit.isMobileResponsive ? "#0f2942" : "#b91c1c"} />
                      <span style={{ color: lead.audit.isMobileResponsive ? "#0f172a" : "#b91c1c", fontWeight: 600 }}>
                        {lead.audit.isMobileResponsive ? "Mobile Ready" : "No Viewport ❌"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Layers size={14} color="#64748b" />
                      <span style={{ color: "#334155", fontWeight: 600 }}>CMS: {lead.audit.cms}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} color="#64748b" />
                      <span style={{ color: "#334155", fontWeight: 600 }}>
                        {lead.audit.loadTimeMs ? (lead.audit.loadTimeMs / 1000).toFixed(1) + "s TTFB" : "Unreachable"}
                      </span>
                    </div>
                  </div>

                  {/* Issues Badges */}
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "10px" }}>
                    {lead.audit.issues.map((iss, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          background: "#ffffff",
                          border: "1px solid #cbd5e1",
                          color: "#334155",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {iss}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ display: "flex", gap: "8px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                  <button
                    onClick={() => handleSaveToCRM(lead)}
                    disabled={isSaved || isSaving}
                    style={{
                      flex: 1,
                      background: isSaved ? "#f1f5f9" : "#0f2942",
                      color: isSaved ? "#0f2942" : "#ffffff",
                      border: isSaved ? "1px solid #cbd5e1" : "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: isSaved ? "default" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <CheckCircle2 size={13} color="#0f2942" /> Saved to Neon CRM
                      </>
                    ) : (
                      <>
                        <Zap size={13} /> Save to CRM
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigateTab("copilot")}
                    style={{
                      background: "#ffffff",
                      color: "#0f2942",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                    title="Draft custom cold pitch in AI Copilot"
                  >
                    <Sparkles size={13} /> Pitch
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty / Intro State */
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#f1f5f9",
              color: "#0f2942",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Search size={26} />
          </div>

          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Discover Local Businesses &amp; Audit Outdated Websites
          </h3>

          <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "540px", lineHeight: 1.6, margin: 0 }}>
            Select a commercial niche and enter any global city. The scraper queries OpenStreetMap Overpass records and instantly tests their live HTML for SSL, mobile responsiveness, and page performance.
          </p>

          <button
            onClick={() => handleSearch("Austin", "plumber")}
            style={{
              marginTop: "8px",
              background: "#0f2942",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Run Demo Search (Plumbers in Austin) <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
