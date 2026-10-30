import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Layout, Code2, Rocket } from "lucide-react";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";
import Card3DTilt from "@/components/Card3DTilt";

export const metadata = {
  title: "Our Delivery Process | T & N Designs",
  description: "Explore the 4-step agency delivery process at T & N Designs: Discovery, Prototype, Code, and Launch.",
};

const STEPS = [
  {
    step: "01",
    title: "Discovery & Strategic Blueprint",
    icon: Compass,
    description: "We audit your existing digital footprint, study your highest-converting competitors, and map out information architecture, target personas, and KPI conversion funnels.",
  },
  {
    step: "02",
    title: "Bespoke UI/UX & Prototyping",
    icon: Layout,
    description: "Every screen is custom designed in Figma with fluid typography, responsive layout breakpoints, and tactile micro-interactions tailored specifically to your brand guidelines.",
  },
  {
    step: "03",
    title: "Full-Stack Development & Custom Code",
    icon: Code2,
    description: "We build your platform using custom Wix Studio architectures, Next.js, and Velo JavaScript. Zero bloated plugins, clean modular codebase, and integrated database endpoints.",
  },
  {
    step: "04",
    title: "Speed Optimization, SEO & Launch",
    icon: Rocket,
    description: "We perform full 301 redirect mapping, Schema.org structured data injection, Core Web Vitals audit, and launch your platform with zero downtime.",
  },
];

export default function ProcessPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "820px", marginBottom: "50px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#123968", marginBottom: "12px" }}>
            How We Work
          </div>
          <h1 style={{ fontSize: "clamp(36px, 4.5vw, 56px)", fontWeight: 800, color: "#1b2933", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "20px" }}>
            A systematic, predictable process designed for high conversion.
          </h1>
          <p style={{ fontSize: "18px", color: "#465868", lineHeight: 1.65, maxWidth: "720px" }}>
            From initial kickoff to live launch, our 4-stage development framework ensures complete transparency, rapid delivery, and measurable ROI.
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px", marginBottom: "60px" }}>
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Card3DTilt key={idx} maxTilt={5}>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "36px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(18, 57, 104, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", color: "#123968" }}>
                      <Icon size={22} />
                    </div>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: "#cbd5e1" }}>
                      {s.step}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1b2933", marginBottom: "12px" }}>
                    {s.title}
                  </h2>

                  <p style={{ fontSize: "15px", color: "#465868", lineHeight: 1.65, margin: 0, flexGrow: 1 }}>
                    {s.description}
                  </p>
                </div>
              </Card3DTilt>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#1b2933", marginBottom: "16px" }}>
            Have a project in mind? Let&apos;s talk through your timeline.
          </h3>
          <Link
            href="/contact"
            className="btn-primary"
            style={{
              padding: "13px 32px",
              fontSize: "15px",
              background: "#123968",
              borderColor: "#0a223f",
            }}
          >
            Start Your Discovery Call <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

