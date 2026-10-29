"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const [visible, setVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 260 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if device supports fine pointer (mouse)
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 160);
      cursorY.set(e.clientY - 160);
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", moveCursor, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, visible]);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: smoothX,
        y: smoothY,
        width: "320px",
        height: "320px",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 9998,
        background: "radial-gradient(circle, rgba(10, 37, 64, 0.065) 0%, rgba(18, 51, 86, 0.03) 45%, transparent 70%)",
        filter: "blur(18px)",
        transform: "translate3d(0, 0, 0)",
      }}
      aria-hidden="true"
    />
  );
}
