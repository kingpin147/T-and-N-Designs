"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  ArrowRight,
  RotateCcw,
  FileText,
  Mail,
  TrendingUp,
  Layers,
  Database,
  ExternalLink,
} from "lucide-react";
interface AdminAICopilotProps {
  inquiries: any[];
  projects: any[];
  posts: any[];
  stats: {
    totalLeads: number;
    contactedLeads: number;
    pendingLeads: number;
    totalProjects: number;
    totalPosts: number;
  };
  analytics?: any;
  onNavigateTab: (tab: string, filter?: string) => void;
  onOpenBlogEditor: (draft: { title: string; excerpt: string; content: string }) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: any;
}

const DEFAULT_PROMPTS = [
  {
    label: "⚡ Analyze Pending Leads",
    prompt: "Analyze our pending leads in Neon DB and draft a personalized outreach email proposal for the top priority client.",
  },
  {
    label: "📊 Summarize GA4 Growth",
    prompt: "Summarize our Google Analytics 4 performance telemetry over the last 30 days and provide 3 key growth recommendations.",
  },
  {
    label: "✍️ Draft Migration Article",
    prompt: "Draft an authoritative technical blog post blueprint on migrating monolithic Wix sites to Next.js 15 App Router.",
  },
  {
    label: "🏗️ Architecture Blueprint",
    prompt: "Show the enterprise web architecture blueprint and production best practices for our T & N Designs stack.",
  },
];

export default function AdminAICopilot({
  inquiries,
  projects,
  posts,
  stats,
  analytics,
  onNavigateTab,
  onOpenBlogEditor,
}: AdminAICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-welcome",
      role: "assistant",
      content: `### 🤖 T & N Intelligence Copilot Ready

Welcome back! I am your admin intelligence copilot, connected directly to your **Neon PostgreSQL database** (${inquiries.length} leads), **${projects.length} portfolio projects**, **${posts.length} articles**, and **Google Analytics 4**.

Select a quick action below or ask any question about your clients, traffic telemetry, or engineering content:`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input.trim();
    if (!textToSend || loading) return;

    setInput("");
    const userMsgId = "user-" + Date.now();
    const assistantMsgId = "ai-" + Date.now();

    const newMessages: Message[] = [
      ...messages,
      { id: userMsgId, role: "user", content: textToSend },
      { id: assistantMsgId, role: "assistant", content: "" },
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to receive stream response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        // Parse any action tag
        let displayContent = fullText;
        let actionObj: any = null;

        const actionMatch = fullText.match(/<copilot_action>([\s\S]*?)<\/copilot_action>/);
        if (actionMatch) {
          try {
            actionObj = JSON.parse(actionMatch[1]);
            displayContent = fullText.replace(/<copilot_action>[\s\S]*?<\/copilot_action>/, "").trim();
          } catch (e) {
            // parsing in progress
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: displayContent, action: actionObj }
              : msg
          )
        );
      }
    } catch (err: any) {
      console.error("Copilot stream error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  "⚠️ An error occurred while generating response. Please check your connection and try again.",
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: "initial-welcome-" + Date.now(),
        role: "assistant",
        content: `### 🤖 T & N Intelligence Copilot Reset

Conversation history cleared. Ready for your next query on **CRM leads**, **GA4 traffic**, or **blog drafting**.`,
      },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. TOP HEADER & TELEMETRY SYNC STATUS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          background: "#ffffff",
          padding: "16px 20px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "#0f2942",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Admin Intelligence Copilot
              </h1>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  background: "#f1f5f9",
                  color: "#0f2942",
                  padding: "2px 7px",
                  borderRadius: "999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Hybrid Smart Engine
              </span>
            </div>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "2px 0 0 0" }}>
              Live telemetry connected: {stats.totalLeads} leads · {stats.pendingLeads} pending outreach · {projects.length} portfolio items · GA4 synced
            </p>
          </div>
        </div>

        <button
          onClick={resetChat}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#ffffff",
            color: "#64748b",
            border: "1px solid #e2e8f0",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Reset conversation"
        >
          <RotateCcw size={13} /> Reset Chat
        </button>
      </div>

      {/* 2. QUICK ACTION PROMPT CHIPS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {DEFAULT_PROMPTS.map((chip, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSend(chip.prompt)}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "7px 12px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#0f172a",
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              transition: "border-color 0.15s ease",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN CHAT VIEWPORT */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          minHeight: "560px",
          maxHeight: "72vh",
        }}
      >
        {/* Messages Feed */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            background: "#f8fafc",
            borderRadius: "14px 14px 0 0",
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.role === "user" ? "flex-end" : "flex-start",
                width: "100%",
              }}
            >
              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: m.role === "user" ? "75%" : "88%",
                  background: m.role === "user" ? "#0f2942" : "#ffffff",
                  color: m.role === "user" ? "#ffffff" : "#0f172a",
                  padding: "14px 18px",
                  borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                  border: m.role === "user" ? "none" : "1px solid #e2e8f0",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                {/* Author Label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: m.role === "user" ? "#93c5fd" : "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {m.role === "user" ? (
                    <>
                      <User size={12} /> You
                    </>
                  ) : (
                    <>
                      <Bot size={12} color="#0f2942" /> Copilot
                    </>
                  )}
                </div>

                {/* Markdown text representation */}
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {m.content}
                </div>

                {/* GENERATIVE UI ACTION CARD 1: LEAD OUTREACH */}
                {m.action && m.action.type === "lead_outreach" && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "14px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Mail size={14} color="#0f2942" />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                          Proposal Draft: {m.action.leadName}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          background: "#e2e8f0",
                          color: "#334155",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          textTransform: "uppercase",
                        }}
                      >
                        Status: {m.action.status}
                      </span>
                    </div>

                    <div
                      style={{
                        background: "#ffffff",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "12px",
                        color: "#334155",
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <strong style={{ color: "#0f172a" }}>Subject:</strong> {m.action.subject}
                      {"\n\n"}
                      {m.action.body}
                    </div>

                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => handleCopy(m.action.body, m.id + "-email")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#ffffff",
                          color: "#0f2942",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          cursor: "pointer",
                        }}
                      >
                        {copiedId === m.id + "-email" ? (
                          <>
                            <Check size={13} color="#059669" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={13} /> Copy Email Body
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => onNavigateTab("leads")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#0f2942",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          cursor: "pointer",
                        }}
                      >
                        View in Lead Pipeline <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* GENERATIVE UI ACTION CARD 2: BLOG BLUEPRINT */}
                {m.action && m.action.type === "blog_blueprint" && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "14px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <FileText size={14} color="#0f2942" />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                          Generated Blog Blueprint
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          background: "#e2e8f0",
                          color: "#334155",
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {m.action.readTime} min read · {m.action.category}
                      </span>
                    </div>

                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                      {m.action.title}
                    </div>

                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                      {m.action.excerpt}
                    </p>

                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() =>
                          onOpenBlogEditor({
                            title: m.action.title,
                            excerpt: m.action.excerpt,
                            content: m.action.content,
                          })
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "12px",
                          fontWeight: 700,
                          background: "#0f2942",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "7px 14px",
                          cursor: "pointer",
                        }}
                      >
                        Insert into Blog Editor <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* GENERATIVE UI ACTION CARD 3: ANALYTICS SNAPSHOT */}
                {m.action && m.action.type === "analytics_snapshot" && (
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "14px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <TrendingUp size={14} color="#0f2942" />
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>
                          GA4 Telemetry Snapshot (30 Days)
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>
                        Top: {m.action.topSource}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "8px",
                      }}
                    >
                      <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>PAGE VIEWS</div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                          {m.action.views?.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>ACTIVE USERS</div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                          {m.action.users}
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>SESSIONS</div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                          {m.action.sessions}
                        </div>
                      </div>
                      <div style={{ background: "#ffffff", padding: "8px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>ENGAGEMENT</div>
                        <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                          {m.action.avgEngagement}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => onNavigateTab("analytics")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "#0f2942",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          cursor: "pointer",
                        }}
                      >
                        Deep Analytics &amp; GEO <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "12px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#0f2942",
                  display: "inline-block",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <span>Copilot synthesizing intelligence...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: "14px 18px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            gap: "10px",
            background: "#ffffff",
            borderRadius: "0 0 14px 14px",
            alignItems: "center",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            disabled={loading}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot anything about leads, traffic, or content drafting..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
              color: "#0f172a",
              background: "#ffffff",
            }}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              background: "#0f2942",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              opacity: loading || !input.trim() ? 0.6 : 1,
              transition: "all 0.15s ease",
            }}
          >
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
