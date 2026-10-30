"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Tag, Layers, Check, X } from "lucide-react";
import Card3DTilt from "@/components/Card3DTilt";
import FormattedContent from "@/components/FormattedContent";
import { Project } from "@/types";

interface PortfolioShowcaseProps {
  initialProjects: Project[];
}

const categories = [
  { id: "all", label: "All Projects (85)" },
  { id: "wix-migration", label: "Custom Wix Studio & Velo (64)" },
  { id: "web-design", label: "Web Applications (17)" },
  { id: "custom", label: "Next.js & SaaS (4)" },
];

export default function PortfolioShowcase({ initialProjects }: PortfolioShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // 2026 Modern Modal: Lock body scroll & listen for Escape key
  useEffect(() => {
    if (!selectedProject) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  const filteredProjects = initialProjects.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  return (
    <div id="portfolio">
      {/* Category Filter Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "40px" }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: "10px 20px",
                borderRadius: "var(--radius-full)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                background: isActive ? "#123968" : "#ffffff",
                color: isActive ? "#ffffff" : "#465868",
                border: isActive ? "1px solid #0a223f" : "1px solid #e2e8f0",
                transition: "all var(--transition-fast)",
                boxShadow: isActive ? "0 4px 14px rgba(18, 57, 104, 0.25)" : "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <motion.div 
        layout
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: "28px",
        }}
      >
        <AnimatePresence>
          {filteredProjects.slice(0, 15).map((project) => (
            <Card3DTilt key={project.id} maxTilt={6}>
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="glass-panel"
                style={{
                  height: "100%",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.25s ease",
                  WebkitFontSmoothing: "antialiased",
                  MozOsxFontSmoothing: "grayscale",
                  backfaceVisibility: "hidden",
                  transform: "translateZ(0)",
                }}
                onClick={() => setSelectedProject(project)}
              >
              {/* Image Preview Container */}
              <div style={{ position: "relative", width: "100%", height: "230px", background: "#f1f5f9", overflow: "hidden" }}>
                <Image
                  src={project.coverImageUrl}
                  alt={project.altText || project.title}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{
                    objectFit: "cover",
                    transition: "transform 0.4s ease",
                  }}
                  className="project-cover-hover"
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(15, 23, 42, 0.3) 0%, transparent 60%)",
                }} />



                {project.projectUrl && (
                  <div style={{ position: "absolute", top: "14px", right: "14px", zIndex: 2 }}>
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#123968",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                      title="Visit Live Site"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "var(--text-primary)" }}>
                  {project.title}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: "20px",
                  flexGrow: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {project.shortDescription || project.fullDescription.slice(0, 140) + "..."}
                </p>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {project.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "12px",
                        color: "#475569",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span style={{ fontSize: "11px", color: "var(--accent-cyan)", alignSelf: "center", fontWeight: 600 }}>
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </Card3DTilt>
        ))}
        </AnimatePresence>
      </motion.div>

      {/* 2026 Responsive Modal: Bottom Sheet (Mobile) -> Centered Dialog (Desktop) */}
      <AnimatePresence>
        {selectedProject && (
          <div
            className="modern-modal-overlay"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="modern-modal-dialog"
            >
              {/* Mobile Drag Handle */}
              <div className="modern-modal-drag-handle" />

              {/* Modal Sticky Header */}
              <div className="modern-modal-header">
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#123968" }}>
                    {selectedProject.category.replace("-", " ")}
                  </div>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="modern-modal-close-btn"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="modern-modal-body">
                <div style={{ position: "relative", width: "100%", height: "280px", borderRadius: "12px", overflow: "hidden", marginBottom: "20px", background: "#f1f5f9" }}>
                  <Image
                    src={selectedProject.coverImageUrl}
                    alt={selectedProject.title}
                    fill
                    unoptimized
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
                  {selectedProject.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "12px",
                        background: "rgba(18, 57, 104, 0.06)",
                        color: "#123968",
                        border: "1px solid rgba(18, 57, 104, 0.15)",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: "12px" }}>
                  <FormattedContent content={selectedProject.fullDescription} type="project" />
                </div>
              </div>

              {/* Modal Fixed Footer */}
              <div className="modern-modal-footer">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "999px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
                {selectedProject.projectUrl && (
                  <a
                    href={selectedProject.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      fontSize: "14px",
                      padding: "10px 22px",
                      background: "#123968",
                      borderColor: "#0a223f",
                    }}
                  >
                    Visit Live Platform <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
