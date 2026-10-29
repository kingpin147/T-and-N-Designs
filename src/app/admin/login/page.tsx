"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, Loader2, UserCheck } from "lucide-react";

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative" }}>
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-top-right" />

      <div style={{ width: "100%", maxWidth: "460px", zIndex: 1 }}>
        <Link href="/" style={{ color: "var(--accent-cyan)", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Return to Homepage
        </Link>

        <div className="glass-panel" style={{ padding: "40px 32px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}>
              <ShieldCheck size={28} color="#fff" />
            </div>
            <h1 style={{ fontSize: "26px", color: "#fff", marginBottom: "6px" }}>T &amp; N Designs Portal</h1>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Neon Auth Verified Control Center
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tnndesigns.com"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    color: "#fff",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 40px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    color: "#fff",
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
              style={{ width: "100%", padding: "14px", justifyContent: "center", fontSize: "15px" }}
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

          {/* Security Notice */}
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Protected by encrypted session authentication &amp; Neon RBAC.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
