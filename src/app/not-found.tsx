import React from "react";
import Link from "next/link";
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
        {/* Interactive 3D Stone Animation with orbit and drag physics */}
        <InteractiveStone404 />

        <div style={{ fontSize: "68px", fontWeight: 900, color: "#0a2540", lineHeight: 1, marginBottom: "12px", letterSpacing: "-0.04em" }}>
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
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 28px",
            fontSize: "15px",
            background: "#0a2540",
            borderColor: "#06182c",
            color: "#ffffff",
            boxShadow: "0 4px 14px rgba(10, 37, 64, 0.2)",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: 600,
          }}
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
