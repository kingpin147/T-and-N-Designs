import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import ThreeHeroCanvas from "@/components/ThreeHeroCanvas";
import Card3DTilt from "@/components/Card3DTilt";
import { fetchPosts } from "@/lib/db";

export const revalidate = 3600;

export async function generateStaticParams() {
  return [
    { category: "latest-advancements-in-ai" },
    { category: "ai" },
    { category: "digital-marketing" },
    { category: "web-development" },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const resolved = await params;
  const humanTitle = resolved.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${humanTitle} | T & N Designs Blog`,
    description: `Browse articles and in-depth technical analysis for ${humanTitle} by T & N Designs.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolved = await params;
  const posts = await fetchPosts();

  const humanTitle = resolved.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // Filter posts that match or loosely match category words
  const catKeywords = resolved.category.toLowerCase().split("-");
  const filteredPosts = posts.filter((p) => {
    const slugLower = p.slug.toLowerCase();
    const titleLower = p.title.toLowerCase();
    const tagsLower = (p.tags || []).map((t) => t.toLowerCase()).join(" ");
    return catKeywords.some((k) => k.length > 2 && (slugLower.includes(k) || titleLower.includes(k) || tagsLower.includes(k)));
  });

  const displayPosts = filteredPosts.length > 0 ? filteredPosts : posts;

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingTop: "130px", paddingBottom: "100px", background: "#ffffff", color: "#1b2933", overflow: "hidden" }}>
      <ThreeHeroCanvas />

      <div className="container" style={{ maxWidth: "1240px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "760px", marginBottom: "50px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0a2540", marginBottom: "8px" }}>
            Category Archive
          </div>
          <h1 style={{ fontSize: "clamp(34px, 4.4vw, 52px)", fontWeight: 800, color: "#1b2933", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: "16px" }}>
            {humanTitle}
          </h1>
          <p style={{ fontSize: "17px", color: "#465868", lineHeight: 1.65 }}>
            Showing {displayPosts.length} article{displayPosts.length === 1 ? "" : "s"} filed under {humanTitle}.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
          {displayPosts.map((post) => (
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
                        unoptimized
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}

                  <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
                      {post.publishedAt && (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Calendar size={14} />
                          {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={14} />
                        {post.readTime || 4} min read
                      </span>
                    </div>

                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1b2933", marginBottom: "12px", lineHeight: 1.35 }}>
                      {post.title}
                    </h2>

                    <p style={{ fontSize: "14px", color: "#465868", lineHeight: 1.6, marginBottom: "20px", flexGrow: 1 }}>
                      {post.excerpt || post.content.slice(0, 140) + "..."}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0a2540", fontWeight: 600, fontSize: "14px" }}>
                      Read Article <ArrowRight size={15} />
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

