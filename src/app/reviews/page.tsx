import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Testimonials from "@/components/Testimonials";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";

export const metadata = {
  title: "Client Reviews & Verified Feedback | T & N Designs",
  description: "Read genuine 5.0-star reviews submitted to our official Google Maps Business Profile by founders, directors, and business owners.",
};

export default function ReviewsPage() {
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
            Client Reviews
          </h1>
          <p style={{ color: "#465868", fontSize: "17px", lineHeight: 1.65 }}>
            Read genuine client feedback published on our official Google Business Profile. Every engagement is built on open communication, craft, and punctuality.
          </p>
        </div>

        {/* Testimonials Component */}
        <Testimonials />

        {/* Bottom CTA */}
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
            Ready to experience the difference?
          </h2>
          <p style={{ color: "#465868", fontSize: "16px", maxWidth: "560px", margin: "0 auto 24px auto" }}>
            Connect directly with our team to start planning your next web project.
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
            Contact Our Team <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
