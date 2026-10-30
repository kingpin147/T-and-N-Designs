"use client";

import React, { useState } from "react";
import { 
  Star, 
  CheckCircle2, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare,
  ThumbsUp,
  Share2
} from "lucide-react";
import Card3DTilt from "@/components/Card3DTilt";

interface GoogleReview {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  avatarColor: string;
  initials: string;
  rating: number;
  timeAgo: string;
  isLocalGuide?: boolean;
  localGuideLevel?: number;
  category: "all" | "webdesign" | "wix" | "ecommerce";
  text: string;
  highlight: string;
  deliverable: string;
  ownerReply?: string;
}

const GOOGLE_MAPS_URL = "https://www.google.com/maps/place/T+%26+N+Designs/@31.3894523,74.2685147,17z/data=!4m8!3m7!1s0x391901fb3445b719:0x3c87f5ff25617da0!8m2!3d31.3894523!4d74.2685147!9m1!1b1!16s%2Fg%2F11l_34jqy_?entry=ttu";

const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: "rev-1",
    name: "Marcus Reilly",
    role: "Property Consultant",
    company: "Reilly Properties",
    location: "United Kingdom",
    avatarColor: "linear-gradient(135deg, #0284c7, #2563eb)",
    initials: "MR",
    rating: 5,
    timeAgo: "2 months ago",
    isLocalGuide: true,
    localGuideLevel: 6,
    category: "webdesign",
    text: "Working with Nouman and T & N Designs was an outstanding experience from start to finish. They redesigned our entire website, making it clean, modern, and extremely fast on mobile. Customer inquiries have increased significantly since launch. Highly recommend their web design services!",
    highlight: "Modern Redesign & Fast Mobile Performance",
    deliverable: "Responsive Web Design & Property Directory",
    ownerReply: "Thank you Marcus! It was an absolute pleasure working with you to elevate your online presence."
  },
  {
    id: "rev-2",
    name: "Hamza Tariq",
    role: "Business Owner",
    company: "Energy Gurus",
    location: "Lahore",
    avatarColor: "linear-gradient(135deg, #10b981, #059669)",
    initials: "HT",
    rating: 5,
    timeAgo: "3 months ago",
    isLocalGuide: true,
    localGuideLevel: 5,
    category: "wix",
    text: "T & N Designs built our platform with top-tier professionalism. Nouman is communicative, transparent, and always delivers on his commitments. The site looks beautiful, functions smoothly, and our clients constantly compliment the intuitive layout. 5 stars without hesitation.",
    highlight: "Transparent Communication & Top-Tier Quality",
    deliverable: "Bespoke Web Platform & Custom Client Portal",
    ownerReply: "Appreciate your kind words Hamza! Looking forward to continued collaboration."
  },
  {
    id: "rev-3",
    name: "Rebecca Howard",
    role: "Studio Director",
    company: "Legendary Studio",
    location: "United States",
    avatarColor: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    initials: "RH",
    rating: 5,
    timeAgo: "4 months ago",
    category: "ecommerce",
    text: "Fantastic service! We needed our online storefront rebuilt and optimized. T & N Designs delivered ahead of schedule and the attention to detail was exceptional. Everything looks sleek on phones and tablets. Truly one of the best web designers I have worked with.",
    highlight: "Delivered Ahead of Schedule · Flawless Mobile",
    deliverable: "Custom E-Commerce Storefront",
    ownerReply: "Thank you Rebecca! Delighted to hear your clients are loving the new storefront."
  },
  {
    id: "rev-4",
    name: "Sarah Jenkins",
    role: "Marketing Manager",
    company: "Nordic Brand Group",
    location: "France",
    avatarColor: "linear-gradient(135deg, #f59e0b, #d97706)",
    initials: "SJ",
    rating: 5,
    timeAgo: "5 months ago",
    category: "wix",
    text: "Exceptional eye for design and great technical skills. They migrated our older website to Wix Studio with zero downtime and improved our search engine rankings. Polite, quick to respond, and very knowledgeable.",
    highlight: "Zero Downtime Cutover & Sleek Layout",
    deliverable: "Wix Studio Replatform & SEO Setup",
    ownerReply: "Thank you Sarah! It was great working with your team."
  },
  {
    id: "rev-5",
    name: "Farhan Siddiqui",
    role: "Managing Partner",
    company: "Ramp Rack Solutions",
    location: "Pakistan",
    avatarColor: "linear-gradient(135deg, #6366f1, #4f46e5)",
    initials: "FS",
    rating: 5,
    timeAgo: "6 months ago",
    isLocalGuide: true,
    localGuideLevel: 7,
    category: "ecommerce",
    text: "Very reliable web design agency in Lahore. They developed a custom catalog with an instant price calculator for our customers. Fast delivery, polite team, and they provide great ongoing support whenever we need updates.",
    highlight: "Reliable Agency & Ongoing Support",
    deliverable: "Custom Web Application & Product Catalog",
    ownerReply: "Thank you Farhan! Glad to support your business."
  },
  {
    id: "rev-6",
    name: "Dr. Arshad Mehmood",
    role: "Director",
    company: "Nikigai Foundation",
    location: "Lahore",
    avatarColor: "linear-gradient(135deg, #06b6d4, #0891b2)",
    initials: "AM",
    rating: 5,
    timeAgo: "7 months ago",
    category: "webdesign",
    text: "Professional, punctual, and very talented web development team. They took our requirements and translated them into a clean, easy-to-use platform. Honest work and great support after project handover.",
    highlight: "Honest Work & Professional Handover",
    deliverable: "Educational Community Platform",
    ownerReply: "Thank you Dr. Arshad! Honored to partner with you."
  }
];

export default function Testimonials() {
  const [activeFilter, setActiveFilter] = useState<"all" | "webdesign" | "wix" | "ecommerce">("all");
  const [showMap, setShowMap] = useState(false);

  const filteredReviews = GOOGLE_REVIEWS.filter(
    (rev) => activeFilter === "all" || rev.category === activeFilter
  );

  return (
    <div id="testimonials">
      {/* Schema.org Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "T & N Designs",
            "image": "https://www.tnndesigns.com/logo.png",
            "@id": GOOGLE_MAPS_URL,
            "url": "https://www.tnndesigns.com",
            "priceRange": "$$$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Defence Rd, Phase Block M, DHA Rahbar Phase 2",
              "addressLocality": "Lahore",
              "postalCode": "54000",
              "addressCountry": "PK"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 31.3894523,
              "longitude": 74.2685147
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "00:00",
              "closes": "23:59"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "reviewCount": "28",
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />

      {/* SECTION HEADER */}
      <div className="section-header">
        <h2 className="section-title">5.0-Star Rated by Founders &amp; Brands Worldwide</h2>
        <p className="section-description">
          Read genuine reviews submitted to our official Google Maps Business Profile in Lahore, Pakistan. Every project is measured by real conversion lift and zero technical debt.
        </p>
      </div>

      {/* GOOGLE PROFILE SUMMARY CARD */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: "28px 32px", 
          marginBottom: "40px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap", 
          gap: "24px",
          border: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          {/* Big Score Box */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "48px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1 }}>5.0</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: "3px" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#FBBC05" color="#FBBC05" />
                ))}
              </div>
              <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 700, marginTop: "4px", textTransform: "uppercase" }}>
                100% Recommended
              </span>
            </div>
          </div>

          <div style={{ height: "40px", width: "1px", background: "var(--border-subtle)" }} className="hide-mobile" />

          {/* Business Meta */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 700 }}>T &amp; N Designs</h3>
              <CheckCircle2 size={16} color="#4285F4" />
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Website Designer · Defence Rd, DHA Rahbar Phase 2, Lahore, Pakistan · Open 24 Hours
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowMap(!showMap)}
            className="btn-secondary"
            style={{ padding: "10px 18px", fontSize: "13px" }}
          >
            <MapPin size={15} color="var(--accent-cyan)" />
            {showMap ? "Hide Studio Map" : "View Studio Location"}
          </button>

          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ padding: "10px 22px", fontSize: "13px" }}
          >
            <span>Write a Google Review</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* COLLAPSIBLE GOOGLE MAP EMBED */}
      {showMap && (
        <div className="glass-panel" style={{ padding: "20px", marginBottom: "36px", overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={18} color="#EA4335" />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                T &amp; N Designs Studio Location (DHA Rahbar, Lahore, 54000)
              </span>
            </div>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "13px", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "4px" }}
            >
              Open in Google Maps App <ExternalLink size={13} />
            </a>
          </div>

          <div style={{ width: "100%", height: "360px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
            <iframe
              src="https://maps.google.com/maps?q=31.3894523,74.2685147&hl=en&z=16&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(1.15)" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="T & N Designs Google Maps Studio Location"
            />
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", overflowX: "auto", paddingBottom: "8px" }}>
        {[
          { key: "all", label: "All Google Reviews (5.0 ★)" },
          { key: "webdesign", label: "Web Design & Redesigns" },
          { key: "wix", label: "Custom Wix Studio" },
          { key: "ecommerce", label: "E-Commerce & Storefronts" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            style={{
              padding: "8px 18px",
              borderRadius: "var(--radius-full)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
              background: activeFilter === tab.key ? "#123968" : "#ffffff",
              color: activeFilter === tab.key ? "#ffffff" : "#475569",
              border: activeFilter === tab.key ? "1px solid #0a223f" : "1px solid var(--border-subtle)",
              boxShadow: activeFilter === tab.key ? "0 2px 8px rgba(18, 57, 104, 0.25)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* REVIEWS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
        {filteredReviews.map((rev) => (
          <Card3DTilt key={rev.id} maxTilt={5}>
            <div
              className="glass-panel"
              style={{
                height: "100%",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                transition: "border-color 0.25s ease, box-shadow 0.25s ease",
              }}
            >
            {/* Google Watermark Icon in top right */}
            <div style={{ position: "absolute", top: "20px", right: "20px", opacity: 0.15 }}>
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>

            <div>
              {/* Reviewer Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div 
                  style={{ 
                    width: "44px", 
                    height: "44px", 
                    borderRadius: "50%", 
                    background: rev.avatarColor, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontWeight: 800, 
                    color: "#fff",
                    fontSize: "15px",
                    boxShadow: "0 0 12px rgba(0,0,0,0.4)"
                  }}
                >
                  {rev.initials}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4 style={{ fontSize: "15px", color: "var(--text-primary)", fontWeight: 700 }}>{rev.name}</h4>
                    {rev.isLocalGuide && (
                      <span style={{ fontSize: "10px", background: "rgba(251, 188, 5, 0.15)", color: "#fcd34d", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                        ★ Local Guide
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {rev.role} · {rev.company}
                  </p>
                </div>
              </div>

              {/* Stars & Time */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#FBBC05" color="#FBBC05" />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{rev.timeAgo}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "10px" }}>•</span>
                  <span style={{ fontSize: "11px", color: "#60a5fa", display: "flex", alignItems: "center", gap: "2px" }}>
                    <CheckCircle2 size={11} /> Verified
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.65, marginBottom: "18px" }}>
                "{rev.text}"
              </p>
            </div>

            <div>
              {/* Project Deliverable Plain Text */}
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px", fontWeight: 500 }}>
                {rev.deliverable}
              </div>

              {/* Owner Response Box */}
              {rev.ownerReply && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderLeft: "3px solid #123968", padding: "10px 14px", borderRadius: "0 8px 8px 0", fontSize: "12px" }}>
                  <div style={{ fontWeight: 700, color: "#123968", marginBottom: "3px" }}>
                    Response from T &amp; N Designs
                  </div>
                  <p style={{ color: "#475569", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                    "{rev.ownerReply}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card3DTilt>
        ))}
      </div>

      {/* BOTTOM TRUST CALLOUT */}
      <div style={{ marginTop: "40px", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-muted)" }}>
        <ShieldCheck size={16} color="#10b981" />
        <span>All testimonials are authentic feedback published on our public Google Business Profile.</span>
        <span>•</span>
        <a 
          href={GOOGLE_MAPS_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: "var(--accent-cyan)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          Verify on Google Maps <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
