import React from "react";
import Link from "next/link";
import { ArrowRight, Globe, Layout, ArrowRightLeft, Target, Palette, ShoppingBag, Check } from "lucide-react";
import Card3DTilt from "@/components/Card3DTilt";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";

export const metadata = {
  title: "Services & Capabilities | T & N Designs",
  description: "Bespoke digital design, engineering, and growth services: Custom Wix Studio, Next.js web applications, WordPress migrations, Meta Ads, and brand identity.",
};

const serviceDetails = [
  {
    icon: Globe,
    title: "Custom Wix Studio & Velo Code",
    tagline: "Award-winning responsive design paired with full-stack JavaScript logic.",
    description:
      "We design bespoke Wix Studio platforms tailored to your business operations. From dynamic CMS collections and client portals to custom external APIs and workflow automations, we unlock the full engineering capability of the Velo engine.",
    deliverables: [
      "Custom responsive layouts across mobile, tablet, and desktop",
      "Dynamic Wix CMS databases, collections, and repeaters",
      "Full-stack Velo JavaScript logic, backend web modules, and APIs",
      "Third-party REST webhook integrations and custom automations",
      "Complete client handoff with easy self-management tools",
    ],
  },
  {
    icon: Layout,
    title: "Next.js Web Applications",
    tagline: "High-velocity modern web platforms engineered for sub-second performance.",
    description:
      "For companies requiring custom software architectures, SaaS platforms, or dedicated client dashboards, we engineer custom applications using Next.js App Router, React, and secure cloud datastores. Every build prioritizes clean code, exceptional speed, and zero technical debt.",
    deliverables: [
      "Server-side rendering (SSR) and Incremental Static Regeneration (ISR)",
      "Role-based authentication, user dashboards, and admin portals",
      "Seamless integration with PostgreSQL, Stripe, and third-party APIs",
      "100% Core Web Vitals optimization and strict accessibility",
      "Production-ready deployment pipelines on Vercel or cloud infra",
    ],
  },
  {
    icon: ArrowRightLeft,
    title: "WordPress to Wix or Next.js Migrations",
    tagline: "Replatform outdated sites with zero SEO loss and zero downtime.",
    description:
      "Escape fragile plugin conflicts, security vulnerabilities, and sluggish page loads. We migrate legacy WordPress sites to clean Wix Studio or Next.js architectures, safely transferring your blog archives, custom post types, media assets, and 301 URL redirects.",
    deliverables: [
      "Complete database export of posts, pages, and categories",
      "Full image and media library optimization and re-hosting",
      "1:1 URL mapping with strict 301 redirects to protect Google rankings",
      "Modernized visual design and streamlined editing experience",
      "Zero downtime domain cutover guarantee",
    ],
  },
  {
    icon: Target,
    title: "Meta Ads & Performance Marketing",
    tagline: "Acquisition campaigns engineered for measurable return on ad spend.",
    description:
      "We design and manage high-converting Meta Ads (Facebook & Instagram) campaigns. We pair thumb-stopping visual creatives with strict server-side tracking (Conversions API) and retargeting funnels that convert prospects into paying clients.",
    deliverables: [
      "High-converting ad creatives and copywriting",
      "Meta Pixel & Conversions API (CAPI) server-side setup",
      "Audience research, split-testing, and retargeting funnels",
      "Transparent weekly performance tracking and ROAS analysis",
      "Continuous creative iteration and audience scaling",
    ],
  },
  {
    icon: Palette,
    title: "Graphic Design & Brand Identity",
    tagline: "Distinct visual design systems that elevate your market authority.",
    description:
      "A strong brand creates immediate credibility. We design timeless visual identities, custom vector logos, brand typography, and marketing assets that make your company stand out from competitors.",
    deliverables: [
      "Primary and secondary logo marks with vector source files",
      "Typography system, color palette, and brand guidelines",
      "Social media templates, banner kits, and marketing collateral",
      "UI/UX wireframes and high-fidelity prototype mockups",
      "Print-ready vectors and digital web asset libraries",
    ],
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce & Custom Integrations",
    tagline: "Frictionless storefronts with custom checkout and inventory flows.",
    description:
      "We build reliable e-commerce experiences with intuitive product discovery, fast mobile checkouts, multi-currency payment processors (Stripe, PayPal), and custom shipping freight calculations.",
    deliverables: [
      "Custom catalog navigation and product attribute filtering",
      "Secure payment gateway integrations and one-click checkouts",
      "Automated order confirmation emails and CRM syncing",
      "Custom shipping rules, tax calculation, and inventory alerts",
      "Abandoned cart recovery flows and mobile checkout tuning",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ maxWidth: "780px", marginBottom: "60px" }}>
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
            Capabilities &amp; Services
          </h1>
          <p style={{ color: "#465868", fontSize: "17px", lineHeight: 1.65 }}>
            We combine high-end visual design with full-stack engineering and performance marketing to help ambitious businesses build an unforgettable online presence.
          </p>
        </div>

        {/* Services List with Tactile Elevation */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "32px", marginBottom: "80px" }}>
          {serviceDetails.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="interactive-service-card"
                style={{
                  height: "100%",
                  padding: "36px 32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    className="service-icon-box"
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    <Icon size={24} color="#123968" />
                  </div>

                  <h2
                    className="service-title"
                    style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}
                  >
                    {service.title}
                  </h2>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#123968", marginBottom: "16px", lineHeight: 1.4 }}>
                    {service.tagline}
                  </p>
                  <p style={{ color: "#465868", fontSize: "15px", lineHeight: 1.65, marginBottom: "24px" }}>
                    {service.description}
                  </p>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px", marginBottom: "24px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", marginBottom: "12px" }}>
                      What We Deliver
                    </div>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
                      {service.deliverables.map((item, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "#334155", lineHeight: 1.5 }}>
                          <Check size={16} color="#059669" className="service-check-icon" style={{ flexShrink: 0, marginTop: "3px", transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href="/contact"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#123968",
                    textDecoration: "none",
                    paddingTop: "14px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <span>Discuss this service</span>
                  <ArrowRight size={15} className="service-footer-arrow" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            padding: "48px 36px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1b2933", marginBottom: "12px" }}>
            Ready to start your project?
          </h2>
          <p style={{ color: "#465868", fontSize: "16px", maxWidth: "560px", margin: "0 auto 24px auto" }}>
            Tell us about your goals and let’s outline a tailored roadmap and delivery schedule for your team.
          </p>
          <Link
            href="/contact"
            className="btn-primary"
            style={{
              padding: "12px 28px",
              fontSize: "15px",
              background: "#123968",
              borderColor: "#0a223f",
            }}
          >
            Get In Touch <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

