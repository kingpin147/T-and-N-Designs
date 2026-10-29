import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        background: "#ffffff",
        color: "#1b2933",
      }}
    >
      <div style={{ maxWidth: "520px" }}>
        <div style={{ fontSize: "72px", fontWeight: 900, color: "#0a2540", lineHeight: 1, marginBottom: "16px" }}>
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
            padding: "12px 26px",
            fontSize: "15px",
            background: "#0a2540",
            borderColor: "#06182c",
            color: "#ffffff",
          }}
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}

