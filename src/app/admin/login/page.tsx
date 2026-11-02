"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "#f8fafc", position: "relative" }}>
      <div style={{ width: "100%", maxWidth: "440px", zIndex: 1 }}>
        <a href="/" style={{ color: "#123968", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontWeight: 600, textDecoration: "none" }}>
          <ArrowLeft size={16} /> Return to Homepage
        </a>

        <div
          className="glass-panel"
          style={{
            padding: "36px 32px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(18, 57, 104, 0.08)",
          }}
        >
          {/* Brand Logo Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
            <a href="/" style={{ display: "inline-block" }}>
              <Image
                src="/logo.svg"
                alt="T & N Designs"
                width={64}
                height={64}
                priority
                style={{ objectFit: "contain", borderRadius: "12px" }}
              />
            </a>
          </div>

          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "12px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, marginBottom: "20px" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "14px" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tnndesigns.com"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    color: "#0f172a",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "26px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "14px", top: "14px" }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    color: "#0f172a",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "13px",
                justifyContent: "center",
                fontSize: "15px",
                fontWeight: 700,
                borderRadius: "12px",
                background: "#123968",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
