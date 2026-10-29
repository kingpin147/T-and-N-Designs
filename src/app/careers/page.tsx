import React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Clock, CheckCircle } from "lucide-react";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";
import Card3DTilt from "@/components/Card3DTilt";

export const metadata = {
  title: "Careers & Open Positions | T & N Designs",
  description: "Join the T & N Designs team. We are hiring passionate Wix Studio developers, Next.js engineers, and digital marketing strategists.",
};

const OPEN_ROLES = [
  {
    title: "Senior Wix Studio & Velo Developer",
    department: "Engineering",
    location: "Remote (Worldwide)",
    type: "Full-Time / Contract",
    description: "Architect and implement high-complexity Wix Studio applications with custom Velo JavaScript, third-party REST APIs, and CMS data models.",
  },
  {
    title: "Full-Stack Next.js / TypeScript Engineer",
    department: "Web Development",
    location: "Remote (Worldwide)",
    type: "Full-Time",
    description: "Build cutting-edge, high-velocity Next.js web applications, headless commerce integrations, and AI agent endpoints.",
  },
  {
    title: "UI/UX & Motion Interaction Designer",
    department: "Design",
    location: "Remote (Worldwide)",
    type: "Full-Time / Contract",
    description: "Design intuitive user journeys, high-converting checkout flows, and subtle 2026 spatial micro-interactions in Figma.",
  },
  {
    title: "Meta Ads & Paid Acquisition Specialist",
    department: "Growth Marketing",
    location: "Remote (Worldwide)",
    type: "Full-Time / Performance",
    description: "Manage and optimize high-ROI Meta & Google Ads campaigns, driving scalable qualified leads for agency clients.",
  },
];

export default function CareersPage() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "820px", marginBottom: "50px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0a2540", marginBottom: "12px" }}>
            Join Our Team
          </div>
          <h1 style={{ fontSize: "clamp(36px, 4.5vw, 56px)", fontWeight: 800, color: "#1b2933", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "20px" }}>
            Build the next generation of web platforms with us.
          </h1>
          <p style={{ fontSize: "18px", color: "#465868", lineHeight: 1.65, maxWidth: "720px" }}>
            We are always looking for curious, detail-oriented builders and designers to join our distributed worldwide team.
          </p>
        </div>

        {/* Roles List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "60px" }}>
          {OPEN_ROLES.map((role, idx) => (
            <Card3DTilt key={idx} maxTilt={3}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "32px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "24px",
                }}
              >
                <div style={{ maxWidth: "680px" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#0a2540", background: "rgba(10, 37, 64, 0.06)", padding: "4px 10px", borderRadius: "999px" }}>
                      {role.department}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#64748b" }}>
                      <MapPin size={13} /> {role.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#64748b" }}>
                      <Clock size={13} /> {role.type}
                    </span>
                  </div>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1b2933", marginBottom: "8px" }}>
                    {role.title}
                  </h2>
                  <p style={{ fontSize: "15px", color: "#465868", lineHeight: 1.6, margin: 0 }}>
                    {role.description}
                  </p>
                </div>

                <div>
                  <Link
                    href={`/contact?subject=Career%20Inquiry%20-%20${encodeURIComponent(role.title)}`}
                    className="btn-primary"
                    style={{
                      padding: "10px 22px",
                      fontSize: "14px",
                      background: "#0a2540",
                      borderColor: "#06182c",
                    }}
                  >
                    Apply Now <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Card3DTilt>
          ))}
        </div>
      </div>
    </div>
  );
}

