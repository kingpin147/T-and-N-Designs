"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Reviews", href: "/reviews" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Do not render public floating navbar on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className="navbar"
        style={{
          padding: scrolled ? "8px 20px" : "11px 24px",
          background: scrolled ? "rgba(255, 255, 255, 0.94)" : "rgba(255, 255, 255, 0.88)",
          borderColor: scrolled ? "rgba(203, 213, 225, 0.9)" : "rgba(226, 232, 240, 0.9)",
          boxShadow: scrolled
            ? "0 12px 36px rgba(18, 57, 104, 0.1)"
            : "0 6px 24px rgba(18, 57, 104, 0.05)",
        }}
      >
        {/* Brand Logo */}
        <Link href="/" className="nav-logo" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image
            src="/logo.svg"
            alt="T & N Designs"
            width={34}
            height={34}
            priority
            style={{ objectFit: "contain", borderRadius: "6px" }}
          />
          <span style={{ fontSize: "18px", fontWeight: 800, color: "#123968", letterSpacing: "-0.5px" }}>
            T &amp; N Designs
          </span>
        </Link>

        {/* 2026 Sliding Tab Indicator Navigation */}
        <nav
          onMouseLeave={() => setHoveredIndex(null)}
          style={{ display: "flex", alignItems: "center" }}
        >
          <ul className="nav-links" style={{ display: "flex", alignItems: "center", gap: "4px", margin: 0, padding: 0 }}>
            {NAV_ITEMS.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const isHovered = hoveredIndex === idx;

              return (
                <li key={item.href} style={{ position: "relative" }}>
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    style={{
                      position: "relative",
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "14px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#123968" : isHovered ? "#123968" : "#475569",
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      zIndex: 2,
                    }}
                  >
                    {/* Active Route Dot */}
                    {isActive && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "3px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#123968",
                        }}
                      />
                    )}

                    {/* Sliding Hover Pill Indicator */}
                    {isHovered && (
                      <motion.div
                        layoutId="nav-hover-pill"
                        className="nav-sliding-pill"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "9999px",
                          background: "rgba(18, 57, 104, 0.07)",
                          border: "1px solid rgba(18, 57, 104, 0.12)",
                          zIndex: -1,
                        }}
                      />
                    )}

                    <span className="text-flip-link">
                      <span className="text-flip-inner">
                        <span>{item.label}</span>
                        <span>{item.label}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right CTA Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/contact"
            className="btn-primary"
            style={{ padding: "9px 20px", fontSize: "13px" }}
          >
            Start a Project <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "#123968",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "76px",
            left: "16px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: "0 20px 40px rgba(18, 57, 104, 0.12)",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: pathname === item.href ? "#123968" : "#475569",
                textDecoration: "none",
                padding: "8px 0",
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-primary"
            style={{ textAlign: "center", justifyContent: "center", marginTop: "8px" }}
          >
            Start a Project <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </>
  );
}
