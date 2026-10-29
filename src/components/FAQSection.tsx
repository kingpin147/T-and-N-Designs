"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do you provide Custom Wix Studio and Velo development?",
    a: "Yes, absolutely! We are specialized Wix Studio and Velo engineers. We build bespoke responsive designs, dynamic database-driven applications with Wix CMS, custom APIs, third-party integrations, and complex business automations directly on Wix Studio.",
  },
  {
    q: "Can you migrate our existing WordPress website to Wix Studio or Next.js?",
    a: "Yes, we specialize in complete WordPress migrations. We transfer all your blog posts, custom post types, WooCommerce products, customer data, and media into Wix Studio or Next.js, while configuring strict 301 redirects to ensure your SEO rankings and organic Google traffic remain intact.",
  },
  {
    q: "Do you manage Meta Ads (Facebook & Instagram) and paid growth campaigns?",
    a: "Yes! We run data-driven Meta Ads campaigns. We design high-converting visual ad creatives, configure Meta Pixel and Conversions API (CAPI) server tracking, build retargeting funnels, and continuously optimize ad spend to maximize your Return on Ad Spend (ROAS).",
  },
  {
    q: "What graphic design and branding services do you provide?",
    a: "Our creative team delivers complete corporate brand identities, custom vector logos, color and typography guidelines, marketing collateral, social media ad banners, and conversion-focused UI/UX design mockups.",
  },
  {
    q: "Can you help choose between Wix Studio and Custom Next.js for my business?",
    a: "Yes! We work closely with you to assess your goals, technical needs, and marketing requirements. Whether Wix Studio with custom Velo code is ideal for your team's visual workflow or a custom Next.js web application is better suited for enterprise scale, we architect the perfect solution.",
  },
  {
    q: "How does the project lead and contact form process work?",
    a: "Every inquiry submitted through our contact form is immediately reviewed by our design and technical leads. We evaluate your scope, outline a tailored project plan, and reach out to schedule an initial discovery call within 2–4 business hours.",
  },
];

interface FAQSectionProps {
  showHeader?: boolean;
}

export default function FAQSection({ showHeader = true }: FAQSectionProps = {}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div id="faq" style={{ maxWidth: "800px", margin: "0 auto" }}>
      {showHeader && (
        <div className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-description">
            Straight answers about architecture, migration timelines, and technical outcomes.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="glass-panel"
              style={{
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                transition: "all 0.2s ease",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
              }}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  color: "var(--text-primary)",
                  fontSize: "16px",
                  fontWeight: 600,
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  color="#0a2540"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.25s ease",
                    flexShrink: 0,
                    marginLeft: "16px",
                  }}
                />
              </button>

              {isOpen && (
                <div style={{ padding: "0 24px 22px 24px", color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7, borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
