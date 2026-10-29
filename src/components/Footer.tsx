"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Do not render public footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <footer style={{ borderTop: "1px solid #e2e8f0", background: "#f8fafc", padding: "80px 0 40px 0", position: "relative", zIndex: 1, color: "#0f172a" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "48px", marginBottom: "60px" }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <Image
                src="/logo.svg"
                alt="T & N Designs"
                width={36}
                height={36}
                style={{ objectFit: "contain", borderRadius: "6px" }}
              />
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>T &amp; N Designs</h3>
            </div>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.7, marginBottom: "16px" }}>
              Professional web design &amp; digital growth agency. We build custom Wix Studio platforms, high-velocity Next.js web applications, WordPress migrations, Meta Ads campaigns, and brand graphic design that attract customers and scale sales.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Services</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              <li><Link href="/services" style={{ color: "#475569", transition: "color 0.2s" }}>Custom Wix Studio Design</Link></li>
              <li><Link href="/services" style={{ color: "#475569", transition: "color 0.2s" }}>Next.js Web Applications</Link></li>
              <li><Link href="/services" style={{ color: "#475569", transition: "color 0.2s" }}>WordPress to Wix / Next.js Migration</Link></li>
              <li><Link href="/services" style={{ color: "#475569", transition: "color 0.2s" }}>Meta Ads ROAS Campaigns</Link></li>
              <li><Link href="/services" style={{ color: "#475569", transition: "color 0.2s" }}>Brand Identity &amp; Graphic Design</Link></li>
            </ul>
          </div>

          {/* Featured Links */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Navigation</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              <li><Link href="/work" style={{ color: "#475569" }}>Client Work &amp; Portfolio</Link></li>
              <li><Link href="/reviews" style={{ color: "#475569" }}>Client Reviews</Link></li>
              <li><Link href="/faq" style={{ color: "#475569" }}>Frequently Asked Questions</Link></li>
              <li><Link href="/blog" style={{ color: "#475569" }}>Articles &amp; Insights</Link></li>
              <li><Link href="/contact" style={{ color: "#0a2540", fontWeight: 600 }}>Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "16px" }}>Direct Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "#475569" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Mail size={16} color="#0a2540" />
                <a href="mailto:contact@tnndesigns.com" style={{ color: "#475569", textDecoration: "none" }}>contact@tnndesigns.com</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={16} color="#0a2540" />
                <span>Lahore, Pakistan • Global Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "13px", color: "#64748b" }}>
          <div>
            © {new Date().getFullYear()} T &amp; N Designs. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/work" style={{ color: "#64748b" }}>Work</Link>
            <Link href="/services" style={{ color: "#64748b" }}>Services</Link>
            <Link href="/reviews" style={{ color: "#64748b" }}>Reviews</Link>
            <Link href="/contact" style={{ color: "#0a2540", fontWeight: 600 }}>Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
