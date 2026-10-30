"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";

export default function AgencyHero() {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: "140px",
        paddingBottom: "100px",
        background: "#ffffff",
        color: "#1b2933",
        overflow: "hidden",
      }}
    >
      {/* 3D WebGL Canvas: Interactive Particle Constellation & Floating Geometry */}
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        {/* Hero Title & Lead */}
        <div style={{ maxWidth: "860px" }}>
          <h1
            style={{
              fontSize: "clamp(38px, 5vw, 68px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              color: "#1b2933",
              marginBottom: "24px",
            }}
          >
            We build websites and digital platforms that help ambitious businesses win.
          </h1>

          <p
            style={{
              fontSize: "clamp(17px, 1.8vw, 21px)",
              color: "#465868",
              lineHeight: 1.6,
              maxWidth: "760px",
              marginBottom: "36px",
            }}
          >
            <strong style={{ color: "#123968", fontWeight: 700 }}>T &amp; N Designs</strong> is a web design and growth agency. We specialize in custom Wix Studio architectures, high-velocity Next.js web applications, WordPress migrations, and high-ROI Meta Ads campaigns.
          </p>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginBottom: "48px" }}>
            <Link
              href="/contact"
              className="btn-primary"
              style={{
                padding: "14px 32px",
                fontSize: "15px",
              }}
            >
              Start a Project <ArrowRight size={16} />
            </Link>
            <Link
              href="/work"
              className="btn-secondary"
              style={{
                padding: "14px 28px",
                fontSize: "15px",
                background: "#ffffff",
                color: "#123968",
                border: "1px solid #cbd5e1",
              }}
            >
              View Client Work
            </Link>
          </div>

          {/* Key Agency Proof Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "24px",
              paddingTop: "32px",
              borderTop: "1px solid #e2e8f0",
              maxWidth: "800px",
            }}
          >
            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#123968", lineHeight: 1 }}>85+</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", fontWeight: 500 }}>
                Client Builds Delivered
              </div>
            </div>

            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#123968", lineHeight: 1, display: "flex", alignItems: "center", gap: "4px" }}>
                5.0 <Star size={18} fill="#f59e0b" color="#f59e0b" />
              </div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", fontWeight: 500 }}>
                Client Satisfaction Rating
              </div>
            </div>

            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#123968", lineHeight: 1 }}>100%</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", fontWeight: 500 }}>
                Core Web Vitals &amp; Speed
              </div>
            </div>

            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#123968", lineHeight: 1 }}>Zero</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px", fontWeight: 500 }}>
                Migration Downtime &amp; SEO Loss
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
