"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";

interface StatItem {
  targetNumber: number;
  suffix: string;
  decimals?: number;
  label: string;
  sublabel: string;
  color: string;
}

const STATS_DATA: StatItem[] = [
  { targetNumber: 250, suffix: "+", label: "Platforms Launched", sublabel: "Wix Studio, Next.js & Custom Web", color: "#38bdf8" },
  { targetNumber: 99.8, suffix: "%", decimals: 1, label: "Client Satisfaction", sublabel: "Verified Global Delivery Rate", color: "#34d399" },
  { targetNumber: 85, suffix: "+", label: "Production Case Studies", sublabel: "Real Enterprise Deliverables", color: "#ec4899" },
  { targetNumber: 2.4, suffix: "x", decimals: 1, label: "Average Conversion Lift", sublabel: "Measured Across Client Portfolios", color: "#f59e0b" },
];

export default function GsapKineticStats() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Kinetic Counter Animation
      STATS_DATA.forEach((stat, index) => {
        const el = numberRefs.current[index];
        if (!el) return;

        const counterObj = { value: 0 };

        gsap.to(counterObj, {
          value: stat.targetNumber,
          duration: 2.2,
          ease: "power3.out",
          delay: 0.2 + index * 0.15,
          onUpdate: () => {
            if (el) {
              el.innerText = stat.decimals
                ? counterObj.value.toFixed(stat.decimals)
                : Math.round(counterObj.value).toString();
            }
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", marginTop: "36px" }}>
      <div
        className="glass-panel"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          padding: "28px 32px",
          textAlign: "center",
          background: "#ffffff",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        }}
      >
        {STATS_DATA.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            style={{
              padding: "12px",
              borderLeft: idx > 0 ? "1px solid var(--border-subtle)" : "none",
            }}
          >
            <div
              style={{
                fontSize: "clamp(32px, 3.5vw, 42px)",
                fontWeight: 900,
                color: stat.color,
                fontFamily: "var(--font-heading)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1.1,
                marginBottom: "6px",
              }}
            >
              <span
                ref={(el) => {
                  numberRefs.current[idx] = el;
                }}
              >
                0
              </span>
              <span>{stat.suffix}</span>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "3px" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {stat.sublabel}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

