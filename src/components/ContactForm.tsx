"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Loader2, Send, ShieldCheck, Check } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ContactFormProps {
  redirectOnSuccess?: boolean;
}

export default function ContactForm({ redirectOnSuccess = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceInterest: "Custom Wix Studio & Velo",
    budget: "",
    timeline: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [detectedGeo, setDetectedGeo] = useState<{ location?: string; ip?: string }>({});

  // Zero-friction human verification states
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState("");
  const [formLoadTimestamp, setFormLoadTimestamp] = useState<number>(() => Date.now());

  const handleVerify = () => {
    if (isVerified || verifying) return;
    setVerifying(true);
    setTimeout(() => {
      setIsVerified(true);
      setVerifying(false);
      setErrorMsg((prev) => (prev.includes("robot") ? "" : prev));
    }, 400);
  };

  useEffect(() => {
    // Non-blocking client-side auto location detection
    let isMounted = true;
    const detectLocation = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzParts = tz.split("/");
        const cityGuess = tzParts[tzParts.length - 1]?.replace(/_/g, " ");

        const res = await fetch("https://freeipapi.com/api/json", {
          signal: AbortSignal.timeout(2500),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.cityName && data.countryName) {
            setDetectedGeo({
              location: `${data.cityName}, ${data.countryName}`,
              ip: data.ipAddress,
            });
            return;
          }
        }
        if (isMounted && cityGuess) {
          setDetectedGeo({ location: cityGuess });
        }
      } catch {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const cityGuess = tz.split("/").pop()?.replace(/_/g, " ");
          if (isMounted && cityGuess) {
            setDetectedGeo({ location: cityGuess });
          }
        } catch {}
      }
    };

    detectLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      setErrorMsg("Please complete the 'I am not a robot' verification checkbox.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          projectType: formData.serviceInterest,
          budgetRange: formData.budget || undefined,
          timeline: formData.timeline || undefined,
          message: formData.message,
          location: detectedGeo.location,
          ipAddress: detectedGeo.ip,
          b_url_trap: honeypotValue,
          humanVerified: isVerified,
          submissionDurationMs: Date.now() - formLoadTimestamp,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSuccess(true);
      trackEvent("contact_form_submitted", {
        service: formData.serviceInterest,
        location: detectedGeo.location,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Submission error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px auto",
          }}
        >
          <CheckCircle2 size={30} color="#059669" />
        </div>
        <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#1b2933", marginBottom: "12px" }}>
          Message Received
        </h3>
        <p style={{ color: "#465868", fontSize: "16px", lineHeight: 1.6, maxWidth: "520px", margin: "0 auto 24px auto" }}>
          Thank you for reaching out to T &amp; N Designs. Our team will review your requirements and respond within 2–4 business hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setIsVerified(false);
            setHoneypotValue("");
            setFormLoadTimestamp(Date.now());
            setFormData({
              name: "",
              email: "",
              phone: "",
              company: "",
              serviceInterest: "Custom Wix Studio & Velo",
              budget: "",
              timeline: "",
              message: "",
            });
          }}
          className="btn-secondary"
          style={{ padding: "10px 24px", fontSize: "14px" }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "36px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
      }}
    >
      {errorMsg && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          {errorMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1b2933", marginBottom: "8px" }}>
            Your Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: "#1b2933",
              fontSize: "15px",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1b2933", marginBottom: "8px" }}>
            Work Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@company.com"
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: "#1b2933",
              fontSize: "15px",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1b2933", marginBottom: "8px" }}>
            Phone / WhatsApp (Optional)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: "#1b2933",
              fontSize: "15px",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1b2933", marginBottom: "8px" }}>
            Company Name (Optional)
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Your Business or Brand"
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: "#1b2933",
              fontSize: "15px",
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1b2933", marginBottom: "8px" }}>
            Service Needed
          </label>
          <select
            value={formData.serviceInterest}
            onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: "#1b2933",
              fontSize: "15px",
              outline: "none",
            }}
          >
            <option value="Custom Wix Studio & Velo">Custom Wix Studio &amp; Velo</option>
            <option value="Next.js Web Application">Next.js Web Application</option>
            <option value="WordPress to Wix or Next.js Migration">WordPress to Wix / Next.js Migration</option>
            <option value="Meta Ads & Growth Marketing">Meta Ads &amp; Performance Marketing</option>
            <option value="Brand Identity & Graphic Design">Brand Identity &amp; Graphic Design</option>
            <option value="E-Commerce & Integrations">E-Commerce Storefront</option>
            <option value="Other / General Inquiry">Other / General Inquiry</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1b2933", marginBottom: "8px" }}>
            Estimated Budget (Optional)
          </label>
          <select
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              color: formData.budget ? "#1b2933" : "#64748b",
              fontSize: "15px",
              outline: "none",
            }}
          >
            <option value="">Select a range (Optional)</option>
            <option value="$500 - $1,500">$500 – $1,500 USD</option>
            <option value="$1,500 - $3,000">$1,500 – $3,000 USD</option>
            <option value="$3,000 - $5,000">$3,000 – $5,000 USD</option>
            <option value="$5,000 - $10,000">$5,000 – $10,000 USD</option>
            <option value="$10,000+">$10,000+ USD</option>
            <option value="Flexible / To be discussed">Flexible / To be discussed</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "28px" }}>
        <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#1b2933", marginBottom: "8px" }}>
          Project Details &amp; Goals *
        </label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Tell us about your project, your timeline, or any reference links..."
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            color: "#1b2933",
            fontSize: "15px",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Invisible Honeypot Trap (Automated bots fill this; humans never see it) */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <input
          type="text"
          name="b_url_trap"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotValue}
          onChange={(e) => setHoneypotValue(e.target.value)}
        />
      </div>

      {/* Interactive Human Verification Checkbox Widget */}
      <div
        onClick={handleVerify}
        role="checkbox"
        aria-checked={isVerified}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleVerify();
          }
        }}
        style={{
          background: isVerified ? "#f0fdf4" : "#f8fafc",
          border: isVerified ? "1px solid #86efac" : "1px solid #cbd5e1",
          borderRadius: "10px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          cursor: isVerified ? "default" : "pointer",
          userSelect: "none",
          transition: "all 0.25s ease",
          boxShadow: isVerified ? "0 2px 10px rgba(16, 185, 129, 0.08)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              border: isVerified ? "2px solid #10b981" : "2px solid #94a3b8",
              background: isVerified ? "#10b981" : "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            {verifying ? (
              <Loader2 size={14} className="animate-spin" color="#123968" />
            ) : isVerified ? (
              <Check size={16} color="#ffffff" strokeWidth={3} />
            ) : null}
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: isVerified ? "#166534" : "#1b2933" }}>
            {isVerified ? "Verified Human" : "I am not a robot"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isVerified ? "#16a34a" : "#64748b", fontSize: "11px", fontWeight: 500 }}>
          <ShieldCheck size={18} color={isVerified ? "#10b981" : "#123968"} />
          <span>T&amp;N Bot Shield</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{
          width: "100%",
          padding: "14px 28px",
          fontSize: "15px",
          fontWeight: 600,
          background: "#123968",
          borderColor: "#0a223f",
          color: "#ffffff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending Message...
          </>
        ) : (
          <>
            Send Message <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
}

