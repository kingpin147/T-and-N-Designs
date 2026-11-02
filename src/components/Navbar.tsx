"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

  // Close mobile menu whenever pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Scroll listener (declared before any early returns to satisfy React Rules of Hooks)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not render public floating navbar on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header
        className="navbar"
        style={{
          padding: scrolled ? "8px 18px" : "11px 22px",
          background: scrolled ? "rgba(255, 255, 255, 0.96)" : "rgba(255, 255, 255, 0.92)",
          borderColor: scrolled ? "rgba(203, 213, 225, 0.9)" : "rgba(226, 232, 240, 0.9)",
          boxShadow: scrolled
            ? "0 12px 36px rgba(18, 57, 104, 0.1)"
            : "0 6px 24px rgba(18, 57, 104, 0.05)",
        }}
      >
        {/* Brand Logo */}
        <Link href="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <Image
            src="/logo.svg"
            alt="T & N Designs"
            width={34}
            height={34}
            priority
            style={{ objectFit: "contain", borderRadius: "6px" }}
          />
          <span style={{ fontSize: "17px", fontWeight: 800, color: "#123968", letterSpacing: "-0.4px" }}>
            T &amp; N Designs
          </span>
        </Link>

        {/* Desktop Sliding Tab Indicator Navigation */}
        <nav
          className="nav-desktop"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <ul className="nav-links">
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

        {/* Right CTA Button & Mobile Toggle Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/contact"
            className="btn-primary nav-cta-btn"
            style={{ padding: "9px 18px", fontSize: "13px" }}
          >
            Start a Project <ArrowRight size={14} />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Modern Mobile Navigation Drawer / Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mobile-nav-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              key="nav-card"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="mobile-nav-card"
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Navigation
                </span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "999px" }}>
                  Available for New Projects
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px 0" }}>
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        fontSize: "15px",
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? "#123968" : "#334155",
                        background: isActive ? "rgba(18, 57, 104, 0.07)" : "transparent",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={14} style={{ color: isActive ? "#123968" : "#94a3b8" }} />
                    </Link>
                  );
                })}
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "13px 20px",
                    fontSize: "14px",
                  }}
                >
                  Start a Project <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
