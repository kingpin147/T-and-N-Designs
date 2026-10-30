import React from "react";
import Image from "next/image";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";
import Card3DTilt from "@/components/Card3DTilt";

import { fetchPosts } from "@/lib/db";
import { Post } from "@/types";

// Next.js Route Segment Cache (ISR: 1 hour background revalidation or instant on-demand)
export const revalidate = 3600;

export const metadata = {
  title: "Agency Insights & Tech Trends | T & N Designs Blog",
  description: "Explore the latest insights on AI engineering, Next.js web development, conversion rate optimization, and cloud architecture.",
};

export default async function BlogArchivePage() {
  const posts = await fetchPosts();

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ maxWidth: "760px", marginBottom: "50px" }}>
          <h1 style={{ fontSize: "clamp(34px, 4.4vw, 52px)", fontWeight: 800, color: "#1b2933", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: "16px" }}>
            Articles &amp; Technical Insights
          </h1>
          <p style={{ fontSize: "17px", color: "#465868", lineHeight: 1.65 }}>
            Articles and deep-dive technical breakdowns on web design, modern frontends, SEO migrations, and digital growth.
          </p>
        </div>

        {/* Blog Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
          {posts.map((post) => (
            <Card3DTilt key={post.id} maxTilt={6}>
              <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <article
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                  }}
                >
                {post.coverImageUrl && (
                  <div style={{ position: "relative", width: "100%", height: "220px", background: "#f1f5f9", overflow: "hidden" }}>
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
                      className="project-cover-hover"
                    />
                  </div>
                )}

                <div style={{ padding: "28px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} /> {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} /> {post.readTime} min read
                    </span>
                  </div>

                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1b2933", marginBottom: "12px", lineHeight: 1.3 }}>
                    {post.title}
                  </h2>

                  <p style={{
                    fontSize: "14px",
                    color: "#465868",
                    lineHeight: 1.6,
                    marginBottom: "20px",
                    flexGrow: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {post.excerpt || post.content.slice(0, 140)}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#123968", fontSize: "14px", fontWeight: 600 }}>
                    Read Article <ArrowRight size={14} />
                  </div>
                </div>
              </article>
            </Link>
          </Card3DTilt>
        ))}
        </div>
      </div>
    </div>
  );
}
