import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AgencyHero from "@/components/AgencyHero";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import ServicesSection from "@/components/ServicesSection";
import Testimonials from "@/components/Testimonials";
import FAQSection from "@/components/FAQSection";
import ContactForm from "@/components/ContactForm";
import { fetchProjects } from "@/lib/db";

// Next.js Route Segment Cache (ISR: 1 hour background revalidation or instant on-demand)
export const revalidate = 3600;

export default async function HomePage() {
  const projects = await fetchProjects();

  return (
    <div style={{ background: "#ffffff", color: "#1b2933" }}>
      {/* BESPOKE AGENCY HERO */}
      <AgencyHero />

      {/* PORTFOLIO SHOWCASE */}
      <section className="section" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "1240px" }}>
          <div className="section-header" style={{ maxWidth: "780px", margin: "0 auto 48px auto", textAlign: "center" }}>
            <h2 className="section-title" style={{ fontSize: "clamp(28px, 3.2vw, 42px)", fontWeight: 800, color: "#1b2933" }}>
              Selected Client Work
            </h2>
            <p className="section-description" style={{ color: "#465868", fontSize: "16px", lineHeight: 1.6 }}>
              A preview of our client builds spanning custom Wix Studio platforms, Velo web applications, e-commerce storefronts, and WordPress migrations.
            </p>
          </div>

          <PortfolioShowcase initialProjects={projects.slice(0, 6)} />

          <div style={{ marginTop: "48px", textAlign: "center" }}>
            <Link
              href="/work"
              className="btn-secondary"
              style={{ padding: "12px 28px", fontSize: "14px" }}
            >
              View All 85+ Projects <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="section" style={{ background: "#ffffff", padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "1240px" }}>
          <ServicesSection />

          <div style={{ marginTop: "48px", textAlign: "center" }}>
            <Link
              href="/services"
              className="btn-secondary"
              style={{ padding: "12px 28px", fontSize: "14px" }}
            >
              Explore Full Capabilities &amp; Deliverables <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT US (Lead Generation Form) */}
      <section className="section" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <div className="section-header" style={{ maxWidth: "680px", margin: "0 auto 40px auto", textAlign: "center" }}>
            <h2 className="section-title" style={{ fontSize: "clamp(28px, 3.2vw, 40px)", fontWeight: 800, color: "#1b2933" }}>
              Start a Conversation
            </h2>
            <p className="section-description" style={{ color: "#465868", fontSize: "16px", lineHeight: 1.6 }}>
              Tell us about your upcoming project or migration. We prepare tailored proposals and respond within 2–4 business hours.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* VERIFIED REVIEWS */}
      <section className="section" style={{ background: "#ffffff", padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "1240px" }}>
          <Testimonials />

          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <Link
              href="/reviews"
              className="btn-secondary"
              style={{ padding: "12px 28px", fontSize: "14px" }}
            >
              View All Client Reviews &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="section" style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "1240px" }}>
          <FAQSection />

          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <Link
              href="/faq"
              className="btn-secondary"
              style={{ padding: "12px 28px", fontSize: "14px" }}
            >
              Browse Complete FAQ <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
