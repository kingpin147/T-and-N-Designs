import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";
import { fetchProjects } from "@/lib/db";

export const revalidate = 3600;

export const metadata = {
  title: "Client Work & Case Studies | T & N Designs",
  description: "Explore our portfolio of 85+ client builds spanning bespoke Wix Studio platforms, Next.js web applications, e-commerce storefronts, and WordPress migrations.",
};

export default async function WorkPage() {
  const projects = await fetchProjects();

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />
      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        {/* Page Header */}
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
            Completed Client Work
          </h1>
          <p style={{ color: "#465868", fontSize: "17px", lineHeight: 1.65 }}>
            A curated collection of web applications, custom Wix Studio platforms, and digital brand experiences built for founders, consultants, and companies worldwide.
          </p>
        </div>

        {/* Portfolio Showcase */}
        <PortfolioShowcase initialProjects={projects} />

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
            Have a project in mind?
          </h2>
          <p style={{ color: "#465868", fontSize: "16px", maxWidth: "560px", margin: "0 auto 24px auto" }}>
            Let’s discuss your platform requirements and build something remarkable for your business.
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
            Start a Conversation <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

