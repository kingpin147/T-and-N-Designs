"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  scaleOnHover?: number;
}

export default function Card3DTilt({
  children,
  className = "",
  style = {},
  maxTilt = 7,
  scaleOnHover = 1,
}: Card3DTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Spotlight highlight coordinates
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;

    x.set(xPct);
    y.set(yPct);

    setSpotlightPos({
      x: (mouseX / rect.width) * 100,
      y: (mouseY / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isHovered ? scaleOnHover : 1,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
        rotateX,
        rotateY,
        position: "relative",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        backfaceVisibility: "hidden",
        ...style,
      }}
      className={className}
    >
      {/* Specular 3D Spotlight Depth Overlay (Navy Blue) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          background: `radial-gradient(circle 420px at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(10, 37, 64, 0.08), transparent 75%)`,
          zIndex: 10,
        }}
      />
      {children}
    </motion.div>
  );
}
