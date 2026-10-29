import React from "react";
import Link from "next/link";
import { Mail, MapPin, Clock, ShieldCheck } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";
import Card3DTilt from "@/components/Card3DTilt";

export const metadata = {
  title: "Contact Us | T & N Designs",
  description: "Get in touch with T & N Designs for custom Wix Studio platforms, Next.js web applications, WordPress migrations, and digital growth.",
};

export default function ContactPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ maxWidth: "780px", marginBottom: "50px" }}>
          <h1
            style={{
              fontSize: "clamp(34px, 4.4vw, 52px)",
              fontWeight: 800,
              color: "#1b2933",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              marginBottom: "16px",
            }}
          >
            Let’s Build Something Exceptional
          </h1>
          <p style={{ color: "#465868", fontSize: "17px", lineHeight: 1.65 }}>
            Reach out to discuss a new website, a custom web application, or a WordPress migration. We respond to all inquiries within 2–4 business hours.
          </p>
        </div>

        {/* Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px", alignItems: "flex-start" }}>
          {/* Left: Contact Form */}
          <div>
            <Card3DTilt maxTilt={4}>
              <ContactForm />
            </Card3DTilt>
          </div>

          {/* Right: Direct Information & Studio Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "32px",
              }}
            >
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1b2933", marginBottom: "16px" }}>
                Direct Contact
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "15px", color: "#465868" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <Mail size={18} color="#0a2540" style={{ marginTop: "3px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Email Address</div>
                    <a href="mailto:contact@tnndesigns.com" style={{ color: "#0a2540", fontWeight: 600, textDecoration: "none" }}>
                      contact@tnndesigns.com
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <MapPin size={18} color="#0a2540" style={{ marginTop: "3px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Studio Location</div>
                    <div style={{ color: "#334155" }}>
                      Defence Rd, Phase Block M, DHA Rahbar Phase 2, Lahore, Pakistan
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <Clock size={18} color="#0a2540" style={{ marginTop: "3px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>Response Time</div>
                    <div style={{ color: "#334155" }}>
                      Guaranteed within 2–4 business hours
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "28px",
              }}
            >
              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#1b2933", marginBottom: "12px" }}>
                What happens after you submit?
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", padding: 0, fontSize: "14px", color: "#465868", lineHeight: 1.6 }}>
                <li style={{ display: "flex", gap: "10px" }}>
                  <span style={{ fontWeight: 700, color: "#0a2540" }}>1.</span>
                  <span>Our senior design and technical leads review your requirements.</span>
                </li>
                <li style={{ display: "flex", gap: "10px" }}>
                  <span style={{ fontWeight: 700, color: "#0a2540" }}>2.</span>
                  <span>We evaluate your scope and outline an actionable delivery timeline.</span>
                </li>
                <li style={{ display: "flex", gap: "10px" }}>
                  <span style={{ fontWeight: 700, color: "#0a2540" }}>3.</span>
                  <span>We schedule an initial discovery call or provide a transparent proposal.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
