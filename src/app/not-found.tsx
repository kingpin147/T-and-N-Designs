import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import InteractiveStone404 from "@/components/InteractiveStone404";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
        background: "#ffffff",
        color: "#1b2933",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "560px", width: "100%", position: "relative", zIndex: 1 }}>
        {/* Interactive 3D Wireframe Gem Animation matching the Brand Canvas */}
        <InteractiveStone404 />

        <div style={{ fontSize: "68px", fontWeight: 900, color: "#123968", lineHeight: 1, marginBottom: "12px", letterSpacing: "-0.04em" }}>
          404
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1b2933", marginBottom: "12px" }}>
          Page Not Found
        </h1>
        <p style={{ color: "#465868", fontSize: "16px", lineHeight: 1.6, marginBottom: "28px" }}>
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="btn-primary"
          style={{
            padding: "13px 32px",
            fontSize: "15px",
          }}
        >
          Return to Homepage <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
