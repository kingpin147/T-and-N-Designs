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
  Share2,
} from "lucide-react";

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
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "AE", name: "UAE (Dubai / Abu Dhabi)", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "OTHER", name: "International / Other", dial: "+", flag: "🌐" },
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
  { value: "other", label: "✨ Other / Custom Industry..." },
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

    // Resolve effective niche
    let effectiveNiche = nicheOverride || selectedNiche;
    if (effectiveNiche === "other") {
      effectiveNiche = customNicheInput.trim();
      if (!effectiveNiche) {
        setErrorMsg("Please enter your custom industry or business niche (e.g. Gyms, Auto Detailing, Pet Care).");
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
        setActiveDataSource(data.dataSource || "OpenStreetMap / Commercial Index");
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
      const socialLines = lead.socials && Object.keys(lead.socials).length > 0
        ? Object.entries(lead.socials).map(([k, v]) => `  - ${k}: ${v}`).join("\n")
        : "  - None detected (Opportunity to pitch brand presence)";

      const auditSummary = `
Technical Audit Findings for ${lead.name}:
- Website: ${lead.website || "None (Critical Redesign Need)"}
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
                  background: activeDataSource ? "#f0fdf4" : "#f1f5f9",
                  color: activeDataSource ? "#166534" : "#0f2942",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  border: activeDataSource ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                }}
              >
                {activeDataSource || "Live Search Engine"}
              </span>
            </div>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
              Find commercial businesses in any country or city, scrape social handles, and run automated server-side technical audits to identify high-value redesign opportunities.
            </p>
          </div>
        </div>

        {/* Search Controls Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr)) 180px",
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
                color: selectedNiche === "other" ? "#0f2942" : "#0f172a",
                background: selectedNiche === "other" ? "#f8fafc" : "#ffffff",
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
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
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
                fontWeight: 600,
                color: "#0f172a",
                background: "#ffffff",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.dial})
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
                placeholder="e.g. Austin, Miami, London, Lahore..."
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

        {/* Dynamic Additional Input: When "Other" is selected */}
        {selectedNiche === "other" && (
          <div
            style={{
              marginTop: "12px",
              padding: "12px 16px",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#0f2942" }}>
                ✨ Custom Business Industry / Niche
              </label>
              <span style={{ fontSize: "11px", color: "#64748b" }}>
                Type any industry to search &amp; audit
              </span>
            </div>
            <input
              type="text"
              value={customNicheInput}
              onChange={(e) => setCustomNicheInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. Gyms & Fitness, Auto Detailing, Pet Grooming, Landscaping, Bakeries, Luxury Jewelry, Web3 Agencies..."
              autoFocus
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid #94a3b8",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0f172a",
                background: "#ffffff",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            />
          </div>
        )}

        {/* Quick City Pills with Smart Country Auto-Selection */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Quick metros:</span>
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
                fontWeight: 600,
                background: "#f1f5f9",
                color: "#334155",
                border: "none",
                borderRadius: "6px",
                padding: "3px 8px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>{COUNTRIES.find((cnt) => cnt.code === c.country)?.flag}</span>
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
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
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
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Discovered Leads ({searchedCity})
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {totalLeads}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Region: {currentCountryObj.flag} {currentCountryObj.dial}
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              High-Value Prospects
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              &gt;65% need redesign
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Security Vulnerability
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {noSSLCount}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Missing HTTPS / Insecure
            </div>
          </div>

          <div
            style={{
              background: "#ffffff",
              padding: "14px 18px",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
              Mobile Responsiveness
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
              {brokenMobileCount}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Missing viewport tags
            </div>
          </div>
        </div>
      )}

      {/* 3. LEADS AUDIT GRID */}
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

                  {/* Contact Links: Website & International Phone */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", margin: "10px 0 6px 0" }}>
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

                    {lead.phone && lead.phone !== "N/A" && (
                      <div style={{ fontSize: "12px", color: "#475569", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
                        <Phone size={12} color="#0f2942" /> {lead.phone}
                      </div>
                    )}
                  </div>

                  {/* Social Media Handles Row */}
                  <div style={{ margin: "8px 0 10px 0" }}>
                    {lead.socials && Object.keys(lead.socials).length > 0 ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Socials:
                        </span>
                        {lead.socials.instagram && (
                          <a
                            href={lead.socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: "#fdf2f8",
                              color: "#9d174d",
                              fontSize: "11px",
                              fontWeight: 700,
                              textDecoration: "none",
                              border: "1px solid #fbcfe8",
                            }}
                            title="Instagram Profile"
                          >
                            <span>📸</span> Instagram
                          </a>
                        )}
                        {lead.socials.facebook && (
                          <a
                            href={lead.socials.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: "#eff6ff",
                              color: "#1e40af",
                              fontSize: "11px",
                              fontWeight: 700,
                              textDecoration: "none",
                              border: "1px solid #bfdbfe",
                            }}
                            title="Facebook Page"
                          >
                            <span>📘</span> Facebook
                          </a>
                        )}
                        {lead.socials.linkedin && (
                          <a
                            href={lead.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: "#f0fdf4",
                              color: "#166534",
                              fontSize: "11px",
                              fontWeight: 700,
                              textDecoration: "none",
                              border: "1px solid #bbf7d0",
                            }}
                            title="LinkedIn Company"
                          >
                            <span>💼</span> LinkedIn
                          </a>
                        )}
                        {lead.socials.twitter && (
                          <a
                            href={lead.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px",
                              padding: "2px 7px",
                              borderRadius: "6px",
                              background: "#f8fafc",
                              color: "#0f172a",
                              fontSize: "11px",
                              fontWeight: 700,
                              textDecoration: "none",
                              border: "1px solid #e2e8f0",
                            }}
                            title="X / Twitter"
                          >
                            <span>🐦</span> X
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: "11px", color: "#94a3b8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <span>⚠️</span> No connected socials detected (Outreach angle)
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
                      <span style={{ color: "#334155", fontWeight: 600 }}>
                        CMS: {lead.audit.cms}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={14} color="#64748b" />
                      <span style={{ color: "#334155", fontWeight: 600 }}>
                        {lead.audit.loadTimeMs ? `${(lead.audit.loadTimeMs / 1000).toFixed(1)}s TTFB` : "Unreachable"}
                      </span>
                    </div>
                  </div>

                  {/* Issues tags */}
                  {lead.audit.issues.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "10px" }}>
                      {lead.audit.issues.map((iss, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "10px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: "#ffffff",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                            fontWeight: 500,
                          }}
                        >
                          {iss}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions: Save to Neon CRM & Pitch with AI */}
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
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: isSaved ? "#f1f5f9" : "#0f2942",
                      color: isSaved ? "#166534" : "#ffffff",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: isSaved || isSaving ? "default" : "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <CheckCircle2 size={13} color="#166534" /> Saved to CRM
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Save to CRM
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onNavigateTab("copilot");
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: "#0f172a",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    title="Send lead info to AI Copilot for outreach drafting"
                  >
                    <Sparkles size={13} />
                    <span>Pitch</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. EMPTY HERO STATE (Before search) */}
      {leads.length === 0 && !loading && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            padding: "50px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              color: "#0f2942",
            }}
          >
            <Search size={22} />
          </div>
          <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
            Discover Local Businesses, Scrape Socials &amp; Audit Outdated Websites
          </h2>
          <p style={{ color: "#64748b", fontSize: "13px", maxWidth: "520px", margin: "0 auto 20px auto", lineHeight: 1.5 }}>
            Select any commercial niche (or type a custom industry), pick a country and city. The scraper locates registered businesses, extracts social handles, and tests their live HTML for SSL, mobile responsiveness, and page performance.
          </p>
          <button
            onClick={() => handleSearch("Miami", "plumber", "US")}
            style={{
              background: "#0f2942",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Run Demo Search (Plumbers in Miami)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
