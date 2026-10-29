import React from "react";
import Image from "next/image";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { notFound } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { Clock, Calendar, ArrowRight, Share2, Sparkles } from "lucide-react";

import { fetchPostBySlug, fetchPosts } from "@/lib/db";
import { Post } from "@/types";
import FormattedContent from "@/components/FormattedContent";

// Next.js Route Segment Cache (ISR: 1 hour background revalidation or instant on-demand)
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await fetchPostBySlug(resolvedParams.slug);

  if (!post) {
    return { title: "Article Not Found | T & N Designs Blog" };
  }

  return {
    title: `${post.title} | T & N Designs Blog`,
    description: post.excerpt || post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await fetchPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <article style={{ minHeight: "100vh", paddingTop: "130px", paddingBottom: "120px", background: "#ffffff", color: "#1b2933" }}>
      <div className="container" style={{ maxWidth: "860px" }}>
        {/* Metadata */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: "#64748b", marginBottom: "20px", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={14} /> {new Date(post.publishedAt).toLocaleDateString()}
          </span>
          <span>•</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={14} /> {post.readTime} min read
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: "clamp(32px, 5vw, 50px)", fontWeight: 800, color: "#1b2933", letterSpacing: "-0.025em", lineHeight: 1.18, marginBottom: "28px" }}>
          {post.title}
        </h1>

        {/* Lead Excerpt */}
        {post.excerpt && (
          <p style={{ fontSize: "19px", color: "#465868", lineHeight: 1.6, marginBottom: "36px", fontStyle: "italic", borderLeft: "3px solid #0a2540", paddingLeft: "20px" }}>
            {post.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div style={{ position: "relative", width: "100%", height: "420px", borderRadius: "14px", overflow: "hidden", marginBottom: "48px", background: "#f1f5f9", border: "1px solid #e2e8f0" }}>
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        )}

        {/* Article Body */}
        <div style={{ marginBottom: "60px" }}>
          <FormattedContent content={post.content} type="blog" />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "60px", borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
            <span style={{ fontSize: "13px", color: "#64748b" }}>Topics:</span>
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: "12px",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Conversion CTA */}
        {/* Bottom Callout */}
        <div
          style={{
            padding: "48px 36px",
            textAlign: "center",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
          }}
        >
          <h3 style={{ fontSize: "26px", fontWeight: 800, color: "#1b2933", marginBottom: "12px" }}>
            Ready to upgrade your web architecture?
          </h3>
          <p style={{ color: "#465868", fontSize: "16px", maxWidth: "560px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
            We design and build bespoke Wix Studio and Next.js platforms tailored to help ambitious brands attract customers and scale.
          </p>
          <Link href="/contact" className="btn-primary" style={{ padding: "12px 28px", fontSize: "15px", background: "#0a2540", borderColor: "#06182c" }}>
            Start a Conversation <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
