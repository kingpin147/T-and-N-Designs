"use client";

import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface LeadFinderProps {
  onNavigateTab: (tab: string, filter?: string) => void;
  onRefreshLeads?: () => void;
}

export interface SocialHandles {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export interface LeadAudit {
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

export interface BusinessLead {
  id: string;
  name: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  country?: string;
  niche: string;
  source?: string;
  socials?: SocialHandles;
  audit: LeadAudit;
}

export const COUNTRIES = [
  { code: "US", name: "United States", dial: "+1" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "PK", name: "Pakistan", dial: "+92" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "AU", name: "Australia", dial: "+61" },
  { code: "AE", name: "UAE (Dubai / Abu Dhabi)", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", dial: "+966" },
  { code: "DE", name: "Germany", dial: "+49" },
  { code: "FR", name: "France", dial: "+33" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "SG", name: "Singapore", dial: "+65" },
  { code: "IE", name: "Ireland", dial: "+353" },
  { code: "NZ", name: "New Zealand", dial: "+64" },
  { code: "OTHER", name: "International / Other", dial: "+" },
];

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
  { value: "other", label: "Other / Custom Industry..." },
];

const POPULAR_CITIES = [
  { name: "Austin", country: "US" },
  { name: "Miami", country: "US" },
  { name: "Dallas", country: "US" },
  { name: "Chicago", country: "US" },
  { name: "Houston", country: "US" },
  { name: "London", country: "GB" },
  { name: "Lahore", country: "PK" },
  { name: "Dubai", country: "AE" },
  { name: "Toronto", country: "CA" },
];

// Clean, deduplicate and limit to at most 3 concise chips
function getCleanDeduplicatedIssues(rawIssues: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of rawIssues || []) {
    let clean = raw.trim();
    if (/ssl/i.test(clean)) clean = "No SSL";
    else if (/viewport|mobile/i.test(clean)) clean = "No Mobile Viewport";
    else if (/ttfb|latency|slow/i.test(clean)) clean = "Slow TTFB >2s";
    else if (/wordpress/i.test(clean)) clean = "Outdated WordPress";
    else if (/wix/i.test(clean)) clean = "Wix Builder";
    else if (/squarespace/i.test(clean)) clean = "Squarespace";
    else if (/no website/i.test(clean)) clean = "Missing Website";
    else if (/meta|description/i.test(clean)) clean = "Missing SEO Meta";
    else if (/schema/i.test(clean)) clean = "Missing Schema.org";
    else if (/cwv|vitals/i.test(clean)) clean = "Poor Core Web Vitals";

    if (!seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
    }
    if (result.length >= 3) break;
  }

  return result.length > 0 ? result : ["Standard Architecture"];
}

export default function LeadFinderAuditor({ onNavigateTab, onRefreshLeads }: LeadFinderProps) {
  const [selectedNiche, setSelectedNiche] = useState("plumber");
  const [customNicheInput, setCustomNicheInput] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [cityInput, setCityInput] = useState("Austin");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [savedLeadIds, setSavedLeadIds] = useState<Record<string, boolean>>({});
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchedCity, setSearchedCity] = useState("");
  const [activeDataSource, setActiveDataSource] = useState<string | null>(null);

  const currentCountryObj = COUNTRIES.find((c) => c.code === selectedCountry) || COUNTRIES[0];

  const handleSearch = async (cityOverride?: string, nicheOverride?: string, countryOverride?: string) => {
    const targetCity = cityOverride || cityInput.trim();
    const targetCountryCode = countryOverride || selectedCountry;
    const countryData = COUNTRIES.find((c) => c.code === targetCountryCode) || currentCountryObj;

    let effectiveNiche = nicheOverride || selectedNiche;
    if (effectiveNiche === "other") {
      effectiveNiche = customNicheInput.trim();
      if (!effectiveNiche) {
        setErrorMsg("Please enter a custom industry or niche name.");
        return;
      }
    }

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
        body: JSON.stringify({
          city: targetCity,
          niche: effectiveNiche,
          countryCode: countryData.code,
          dialCode: countryData.dial,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeads(data.leads || []);
        setActiveDataSource(data.dataSource || "Commercial Business Directory");
        if (data.message && data.leads.length === 0) {
          setErrorMsg(data.message);
        }
      } else {
        setErrorMsg(data.error || "Failed to search leads. Please try again.");
      }
    } catch {
      setErrorMsg("Connection error while querying search engine. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCRM = async (lead: BusinessLead) => {
    setSavingLeadId(lead.id);

    try {
      const socialLines =
        lead.socials && Object.keys(lead.socials).length > 0
          ? Object.entries(lead.socials)
              .map(([k, v]) => `  - ${k}: ${v}`)
              .join("\n")
          : "  - None detected";

      const auditSummary = `
Technical Audit Findings for ${lead.name}:
- Website: ${lead.website || "None"}
- Phone: ${lead.phone || "N/A"}
- Location: ${lead.address} (${lead.city}, ${lead.country || selectedCountry})
- SSL Security: ${lead.audit.hasSSL ? "Valid HTTPS" : "Insecure (Missing SSL)"}
- Mobile Viewport: ${lead.audit.isMobileResponsive ? "Mobile Ready" : "Broken Viewport (Not Mobile-Friendly)"}
- Detected CMS: ${lead.audit.cms}
- Page Load Speed: ${lead.audit.loadTimeMs ? (lead.audit.loadTimeMs / 1000).toFixed(1) + "s TTFB" : "N/A"}
- Redesign Need Score: ${lead.audit.opportunityScore}%
- Social Media Handles:
${socialLines}
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
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "19px", fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
                Lead Finder &amp; Technical Website Auditor
              </h1>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  background: "#f1f5f9",
                  color: "#0f172a",
                  padding: "3px 8px",
                  borderRadius: "999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  border: "1px solid #e2e8f0",
                }}
              >
                {activeDataSource || "Commercial Business Directory"}
              </span>
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
              Locate commercial businesses across global regions and execute server-side technical audits to identify high-conviction redesign prospects.
            </p>
          </div>
        </div>

        {/* Search Controls Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr)) 160px",
            gap: "12px",
            alignItems: "end",
          }}
        >
          {/* Niche Selector */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
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
                fontWeight: 500,
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

          {/* Country & Dial Code Selector */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Country / Dial Code
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: 500,
                color: "#0f172a",
                background: "#ffffff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.dial})
                </option>
              ))}
            </select>
          </div>

          {/* City / Location Input */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              City or Metropolitan Region
            </label>
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Austin, Miami, London..."
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                color: "#0f172a",
                background: "#ffffff",
                outline: "none",
              }}
            />
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
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              opacity: loading ? 0.75 : 1,
              height: "38px",
              transition: "background 0.15s ease",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Searching...
              </>
            ) : (
              "Find & Audit Leads"
            )}
          </button>
        </div>

        {/* Clean Inline Custom Industry Input (When "Other" is selected) */}
        {selectedNiche === "other" && (
          <div style={{ marginTop: "12px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Custom Industry or Niche
            </label>
            <input
              type="text"
              value={customNicheInput}
              onChange={(e) => setCustomNicheInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Gyms & Fitness, Auto Detailing, Pet Grooming, Landscaping, Bakeries..."
              autoFocus
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: 500,
                color: "#0f172a",
                background: "#ffffff",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Quick Metro Pills (Clean, minimal, no emojis or prefixes) */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>Quick metros:</span>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setCityInput(c.name);
                setSelectedCountry(c.country);
                handleSearch(c.name, undefined, c.country);
              }}
              style={{
                fontSize: "11px",
                fontWeight: 500,
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "3px 8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              borderRadius: "8px",
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#991b1b",
              fontSize: "13px",
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>

      {/* 2. METRICS BAR (When leads exist) */}
      {leads.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "14px 18px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Discovered Leads ({searchedCity})
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {totalLeads}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              {currentCountryObj.name} ({currentCountryObj.dial})
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "14px 18px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              High-Value Prospects
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Over 65% redesign need
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "14px 18px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Security Vulnerability
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {noSSLCount}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Insecure HTTP protocol
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "14px 18px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Mobile Responsiveness
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
              {brokenMobileCount}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Missing viewport tag
            </div>
          </div>
        </div>
      )}

      {/* 3. MINIMAL BENTO LEADS AUDIT GRID */}
      {leads.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "14px",
          }}
        >
          {leads.map((lead) => {
            const isSaved = savedLeadIds[lead.id];
            const isSaving = savingLeadId === lead.id;
            const cleanTags = getCleanDeduplicatedIssues(lead.audit.issues);

            return (
              <div
                key={lead.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "18px 20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  {/* Card Header: Business Name & Need Score */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
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
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        {lead.address}
                      </div>
                    </div>

                    {/* Redesign Need Badge */}
                    <div
                      style={{
                        padding: "3px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: lead.audit.opportunityScore >= 65 ? "#0f172a" : "#f1f5f9",
                        color: lead.audit.opportunityScore >= 65 ? "#ffffff" : "#0f172a",
                        textAlign: "right",
                        flexShrink: 0,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {lead.audit.opportunityScore}% Need
                    </div>
                  </div>

                  {/* Contact Details: Clean Typographic Domain & Phone */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", margin: "8px 0 10px 0" }}>
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#0f2942",
                          fontWeight: 600,
                          textDecoration: "none",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lead.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
                      </a>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        No Website Registered
                      </span>
                    )}

                    {lead.phone && lead.phone !== "N/A" && (
                      <div style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>
                        {lead.phone}
                      </div>
                    )}
                  </div>

                  {/* Clean Monochrome Social Links */}
                  <div style={{ margin: "6px 0 10px 0", fontSize: "12px", minHeight: "18px" }}>
                    {lead.socials && Object.keys(lead.socials).length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", color: "#64748b" }}>
                        {lead.socials.instagram && (
                          <a
                            href={lead.socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#475569", textDecoration: "none", fontWeight: 500 }}
                          >
                            Instagram ↗
                          </a>
                        )}
                        {lead.socials.instagram && (lead.socials.facebook || lead.socials.linkedin || lead.socials.twitter) && (
                          <span>•</span>
                        )}
                        {lead.socials.facebook && (
                          <a
                            href={lead.socials.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#475569", textDecoration: "none", fontWeight: 500 }}
                          >
                            Facebook ↗
                          </a>
                        )}
                        {lead.socials.facebook && (lead.socials.linkedin || lead.socials.twitter) && (
                          <span>•</span>
                        )}
                        {lead.socials.linkedin && (
                          <a
                            href={lead.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#475569", textDecoration: "none", fontWeight: 500 }}
                          >
                            LinkedIn ↗
                          </a>
                        )}
                        {lead.socials.linkedin && lead.socials.twitter && (
                          <span>•</span>
                        )}
                        {lead.socials.twitter && (
                          <a
                            href={lead.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#475569", textDecoration: "none", fontWeight: 500 }}
                          >
                            X ↗
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        No public socials detected
                      </span>
                    )}
                  </div>

                  {/* Technical Audit Box: Borderless bg-slate-50 with 6px status dots */}
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      fontSize: "11px",
                    }}
                  >
                    {/* SSL Indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: lead.audit.hasSSL ? "#0f2942" : "#dc2626",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: lead.audit.hasSSL ? "#0f172a" : "#dc2626", fontWeight: 600 }}>
                        {lead.audit.hasSSL ? "SSL Valid" : "No SSL"}
                      </span>
                    </div>

                    {/* Mobile Viewport Indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: lead.audit.isMobileResponsive ? "#0f2942" : "#dc2626",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: lead.audit.isMobileResponsive ? "#0f172a" : "#dc2626", fontWeight: 600 }}>
                        {lead.audit.isMobileResponsive ? "Mobile Ready" : "No Viewport"}
                      </span>
                    </div>

                    {/* CMS Indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#64748b",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "#334155", fontWeight: 500 }}>
                        {lead.audit.cms}
                      </span>
                    </div>

                    {/* TTFB Speed Indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#64748b",
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "#334155", fontWeight: 500 }}>
                        {lead.audit.loadTimeMs ? `${(lead.audit.loadTimeMs / 1000).toFixed(1)}s TTFB` : "Unreachable"}
                      </span>
                    </div>
                  </div>

                  {/* Deduplicated Concise Tags (Max 3 Chips) */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" }}>
                    {cleanTags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "#f1f5f9",
                          color: "#334155",
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions: Solid Navy [Save to CRM] and Minimal Outline [Pitch] */}
                <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <button
                    onClick={() => handleSaveToCRM(lead)}
                    disabled={isSaved || isSaving}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background: isSaved ? "#f1f5f9" : "#0f2942",
                      color: isSaved ? "#0f172a" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: isSaved || isSaving ? "default" : "pointer",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Saving...
                      </>
                    ) : isSaved ? (
                      "Saved to CRM"
                    ) : (
                      "Save to CRM"
                    )}
                  </button>

                  <button
                    onClick={() => onNavigateTab("copilot")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "border-color 0.15s ease",
                    }}
                    title="Send lead info to AI Copilot for outreach drafting"
                  >
                    Pitch
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. MINIMAL EMPTY HERO STATE */}
      {leads.length === 0 && !loading && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px auto",
              color: "#0f2942",
            }}
          >
            <Search size={20} />
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
            Commercial Lead Discovery &amp; Technical Website Auditor
          </h2>
          <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "480px", margin: "0 auto 18px auto", lineHeight: 1.5 }}>
            Select any industry or enter a custom niche, choose a country and city to audit local business websites for SSL, mobile responsiveness, CMS stack, and latency flaws.
          </p>
          <button
            onClick={() => handleSearch("Miami", "plumber", "US")}
            style={{
              background: "#0f2942",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "9px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Run Demo Search (Plumbers in Miami)
          </button>
        </div>
      )}
    </div>
  );
}
