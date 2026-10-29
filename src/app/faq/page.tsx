import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FAQSection from "@/components/FAQSection";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";

export const metadata = {
  title: "Frequently Asked Questions | T & N Designs",
  description: "Common questions and direct answers regarding Wix Studio development, Next.js engineering, WordPress migrations, timelines, and costs.",
};

export default function FAQPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1000px", position: "relative", zIndex: 1 }}>
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
            Frequently Asked Questions
          </h1>
          <p style={{ color: "#465868", fontSize: "17px", lineHeight: 1.65 }}>
            Direct answers about our development process, architecture recommendations, migration timelines, and ongoing support.
          </p>
        </div>

        {/* FAQs */}
        <FAQSection showHeader={false} />

        {/* Still have questions? */}
        <div
          style={{
            marginTop: "80px",
            padding: "48px 36px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#1b2933", marginBottom: "12px" }}>
            Have a question not listed here?
          </h2>
          <p style={{ color: "#465868", fontSize: "16px", maxWidth: "560px", margin: "0 auto 24px auto" }}>
            Our team is happy to discuss your specific technical requirements and answer any questions.
          </p>
          <Link
            href="/contact"
            className="btn-primary"
            style={{
              padding: "12px 28px",
              fontSize: "15px",
              background: "#0a2540",
              borderColor: "#06182c",
            }}
          >
            Ask a Question <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
