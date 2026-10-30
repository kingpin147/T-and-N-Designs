import React from "react";
import Link from "next/link";
import { ArrowRight, Code, ShieldCheck, Zap, Globe, Sparkles } from "lucide-react";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";
import Card3DTilt from "@/components/Card3DTilt";

export const metadata = {
  title: "About Us | T & N Designs Agency",
  description: "Learn about T & N Designs, a premier website design and development agency crafting custom Wix Studio architectures and Next.js applications.",
};

export default function AboutPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <div style={{ maxWidth: "820px", marginBottom: "60px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#123968", marginBottom: "12px" }}>
            About T &amp; N Designs
          </div>
          <h1 style={{ fontSize: "clamp(36px, 4.5vw, 56px)", fontWeight: 800, color: "#1b2933", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "20px" }}>
            We craft digital platforms that turn visitors into long-term clients.
          </h1>
          <p style={{ fontSize: "18px", color: "#465868", lineHeight: 1.65, maxWidth: "740px" }}>
            T &amp; N Designs is a specialized web design and digital growth agency. We bridge the gap between bespoke visual storytelling and robust enterprise software engineering.
          </p>
        </div>

        {/* Story & Philosophy Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px", marginBottom: "60px" }}>
          <Card3DTilt maxTilt={5}>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "36px", height: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(18, 57, 104, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#123968", marginBottom: "20px" }}>
                <Zap size={24} />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1b2933", marginBottom: "12px" }}>High-Velocity Performance</h2>
              <p style={{ fontSize: "15px", color: "#465868", lineHeight: 1.7 }}>
                Modern businesses cannot afford slow loading speeds. Every site we build is optimized for sub-second page loads, passing Google Core Web Vitals with flying colors.
              </p>
            </div>
          </Card3DTilt>

          <Card3DTilt maxTilt={5}>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "36px", height: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(18, 57, 104, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#123968", marginBottom: "20px" }}>
                <Code size={24} />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1b2933", marginBottom: "12px" }}>Bespoke Code &amp; Custom Velo</h2>
              <p style={{ fontSize: "15px", color: "#465868", lineHeight: 1.7 }}>
                Where generic website builders stop, we write custom code. From dynamic multi-tenant portals to tailored third-party API integrations, we engineer solutions without limitations.
              </p>
            </div>
          </Card3DTilt>

          <Card3DTilt maxTilt={5}>
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "36px", height: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(18, 57, 104, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#123968", marginBottom: "20px" }}>
                <Globe size={24} />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1b2933", marginBottom: "12px" }}>Worldwide Client Impact</h2>
              <p style={{ fontSize: "15px", color: "#465868", lineHeight: 1.7 }}>
                Operating remotely with clients across North America, Europe, and Asia-Pacific, we provide 24/7 collaborative delivery, complete transparency, and high conversion rate outcomes.
              </p>
            </div>
          </Card3DTilt>
        </div>

        {/* CTA Banner */}
        <div style={{ background: "#123968", borderRadius: "20px", padding: "48px 40px", color: "#ffffff", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
          <div>
            <h3 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "8px", color: "#ffffff" }}>Ready to scale your digital presence?</h3>
            <p style={{ fontSize: "16px", color: "#94a3b8", maxWidth: "600px", margin: 0 }}>
              Let&apos;s build an unforgettable web platform together. Schedule your free discovery strategy call today.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-primary"
            style={{
              background: "#ffffff",
              color: "#123968 !important",
              borderColor: "#e2e8f0",
              fontWeight: 700,
            }}
          >
            Start a Project <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

