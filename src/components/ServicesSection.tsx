"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Globe, 
  Layout, 
  ArrowRightLeft, 
  Target, 
  Palette, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";

interface ServiceItem {
  icon: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  points: string[];
  href: string;
}

const services: ServiceItem[] = [
  {
    icon: Globe,
    title: "Custom Wix Studio & Velo Code",
    description: "Award-winning, bespoke Wix Studio responsive design with custom full-stack Velo JavaScript. Dynamic Wix CMS collections, tailored client portals, external API integrations, and robust business automations.",
    points: ["Bespoke Wix Studio responsive UI/UX", "Custom Velo backend JavaScript & APIs", "Wix CMS dynamic databases & workflows"],
    href: "/services",
  },
  {
    icon: Layout,
    title: "Next.js & SaaS Web Applications",
    description: "Sub-second, highly interactive digital platforms engineered with Next.js App Router, React, and Framer Motion. Zero generic templates—only kinetic, memorable experiences designed to capture leads.",
    points: ["Sub-second page transitions & SSR", "100% Core Web Vitals optimization", "Custom client dashboards & role-based portals"],
    href: "/services",
  },
  {
    icon: ArrowRightLeft,
    title: "WordPress to Wix or Next.js Migrations",
    description: "Replatform outdated, vulnerable WordPress websites into high-performance Wix Studio or Next.js architectures. We safeguard 100% of your SEO authority, Google rankings, media assets, and URLs with zero downtime.",
    points: ["Complete database, blog & media export", "Strict 301 SEO redirect preservation", "Zero downtime cutover & speed boost"],
    href: "/services",
  },
  {
    icon: Target,
    title: "Meta Ads & Performance Marketing",
    description: "Data-backed Meta Ads (Facebook & Instagram) acquisition engines. High-converting creative assets, pixel & Conversions API (CAPI) tracking, hyper-targeted audience funnels, and continuous ROAS optimization.",
    points: ["High-converting visual ad creatives", "Conversions API (CAPI) & Pixel tracking", "Audience testing & scaling funnels"],
    href: "/services",
  },
  {
    icon: Palette,
    title: "Graphic Design & Brand Identity",
    description: "Distinctive, modern brand identities and graphic design assets. From custom logos and color theory to marketing collateral, ad creatives, and conversion-engineered UI/UX mockups that elevate your market presence.",
    points: ["Comprehensive brand style guides & logos", "High-impact marketing collateral & banners", "Custom typography & visual hierarchy"],
    href: "/services",
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce & Custom Integrations",
    description: "End-to-end e-commerce engines with friction-free checkouts, multi-currency Stripe/PayPal payments, custom shipping freight rules, and third-party API integrations (Yahoo Finance, Apex27, CRMs).",
    points: ["Custom checkout & tailored shipping rules", "Third-party REST, Webhook & API syncing", "Automated email & customer order alerts"],
    href: "/services",
  },
];

function InteractiveServiceCard({ svc }: { svc: ServiceItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = svc.icon;

  return (
    <Link
      href={svc.href}
      style={{ textDecoration: "none", color: "inherit", display: "flex", height: "100%" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        <div
          className="interactive-service-card"
          style={{
            width: "100%",
            height: "100%",
            padding: "36px 30px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            background: "#ffffff",
            borderRadius: "16px",
          }}
        >
          {/* Subtle Kinetic Top-Edge Glow Line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "2px",
              background: "linear-gradient(90deg, transparent, #123968, transparent)",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.35s ease",
              pointerEvents: "none",
            }}
          />

          {/* Morphing Icon Squircle */}
          <div
            className="service-icon-box"
            style={{
              marginBottom: "24px",
            }}
          >
            <Icon
              size={24}
              style={{
                transition: "color 0.25s ease",
              }}
            />
          </div>

          {/* Title */}
          <h3
            className="service-title"
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "12px",
              lineHeight: 1.3,
            }}
          >
            {svc.title}
          </h3>

          {/* Description */}
          <p
            style={{
              color: "#465868",
              fontSize: "14px",
              lineHeight: 1.7,
              marginBottom: "24px",
              flexGrow: 1,
            }}
          >
            {svc.description}
          </p>

          {/* Points Checklist */}
          <div
            style={{
              borderTop: "1px solid #f1f5f9",
              paddingTop: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "9px",
            }}
          >
            {svc.points.map((pt, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontSize: "13px",
                  color: isHovered ? "#1e293b" : "#64748b",
                  transition: "color 0.25s ease",
                }}
              >
                <CheckCircle2
                  size={14}
                  color="#10b981"
                  className="service-check-icon"
                  style={{
                    flexShrink: 0,
                    transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
                <span>{pt}</span>
              </div>
            ))}
          </div>

          {/* Interactive Footer Reveal */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: "1px dashed rgba(226, 232, 240, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "13px",
              fontWeight: 600,
              color: isHovered ? "#123968" : "#94a3b8",
              transition: "all 0.25s ease",
            }}
          >
            <span>Explore capabilities</span>
            <ArrowRight
              size={15}
              className="service-footer-arrow"
            />
          </div>
        </div>
      </Link>
  );
}

export default function ServicesSection() {
  return (
    <div id="services">
      <div className="section-header">
        <h2 className="section-title">Full-Service Digital Design, Engineering &amp; Growth</h2>
        <p className="section-description">
          We combine bespoke visual design, modern web engineering, and performance marketing to build digital platforms that attract customers and increase sales.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "28px",
        }}
      >
        {services.map((svc, idx) => (
          <InteractiveServiceCard key={idx} svc={svc} />
        ))}
      </div>
    </div>
  );
}
