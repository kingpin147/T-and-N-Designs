"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Link2,
  Code,
  Eye,
  Edit3,
  Layers,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import FormattedContent from "@/components/FormattedContent";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  type?: "project" | "blog";
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  required,
  placeholder,
  rows = 8,
  type = "project",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Inserts formatting at current cursor position or wraps selected text
   */
  const insertFormatting = (prefix: string, suffix = "", defaultPlaceholder = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const selectedText = currentVal.substring(start, end);
    const textToInsert = selectedText || defaultPlaceholder;

    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);

    const replacement = `${prefix}${textToInsert}${suffix}`;
    const newValue = `${before}${replacement}${after}`;

    onChange(newValue);

    // Re-focus and set selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + textToInsert.length + suffix.length;
      if (selectedText) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultPlaceholder.length);
      }
    }, 10);
  };

  /**
   * Quick Template Inserters
   */
  const insertTemplate = (template: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentVal = textarea.value;
    const separator = currentVal.length > 0 && !currentVal.endsWith("\n\n") ? "\n\n" : "";
    const newValue = `${currentVal}${separator}${template}`;

    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newValue.length, newValue.length);
    }, 10);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {/* Top Label & Mode Tabs */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        {label && (
          <label style={{ fontSize: "13px", fontWeight: 700, color: "#334155", display: "flex", alignItems: "center", gap: "4px" }}>
            {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
          </label>
        )}

        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "8px", padding: "3px", gap: "2px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              background: activeTab === "write" ? "#ffffff" : "transparent",
              color: activeTab === "write" ? "#123968" : "#64748b",
              boxShadow: activeTab === "write" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Edit3 size={13} /> Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 600,
              borderRadius: "6px",
              border: "none",
              background: activeTab === "preview" ? "#ffffff" : "transparent",
              color: activeTab === "preview" ? "#123968" : "#64748b",
              boxShadow: activeTab === "preview" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Eye size={13} /> Live Preview
          </button>
        </div>
      </div>

      {/* Editor Shell */}
      <div
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "10px",
          background: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        {/* Formatting Toolbar (Active in Write Mode) */}
        {activeTab === "write" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "2px",
              padding: "6px 8px",
              background: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={() => insertFormatting("**", "**", "bold text")}
              title="Bold (**text**)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("*", "*", "italic text")}
              title="Italic (*text*)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <Italic size={14} />
            </button>

            <span style={{ width: "1px", height: "18px", background: "#cbd5e1", margin: "0 4px" }} />

            <button
              type="button"
              onClick={() => insertFormatting("## ", "", "Section Heading")}
              title="Heading 2 (## Title)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("### ", "", "Subheading")}
              title="Heading 3 (### Title)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <Heading3 size={15} />
            </button>

            <span style={{ width: "1px", height: "18px", background: "#cbd5e1", margin: "0 4px" }} />

            <button
              type="button"
              onClick={() => insertFormatting("- ", "", "List item")}
              title="Bullet List (- item)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("1. ", "", "Ordered item")}
              title="Numbered List (1. item)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("✅ ", "", "Key deliverable")}
              title="Checkmark Bullet (✅ feature)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <CheckSquare size={14} />
            </button>

            <span style={{ width: "1px", height: "18px", background: "#cbd5e1", margin: "0 4px" }} />

            <button
              type="button"
              onClick={() => insertFormatting("> ", "", "Important highlight or quote")}
              title="Quote / Callout (> quote)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <Quote size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("[", "](https://...)", "link text")}
              title="Add Link ([text](url))"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <Link2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("`", "`", "code")}
              title="Inline Code (`code`)"
              className="toolbar-btn"
              style={toolbarBtnStyle}
            >
              <Code size={14} />
            </button>

            <span style={{ width: "1px", height: "18px", background: "#cbd5e1", margin: "0 4px" }} />

            {/* Quick Templates */}
            {type === "project" && (
              <button
                type="button"
                onClick={() => insertTemplate("Tech Stack:\nNext.js 15 · TypeScript · React · PostgreSQL (Neon) · Tailwind CSS")}
                title="Insert Tech Stack Blueprint"
                style={{
                  ...toolbarBtnStyle,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#123968",
                  padding: "4px 8px",
                  background: "#e2e8f0",
                }}
              >
                <Layers size={13} /> + Tech Stack
              </button>
            )}

            <button
              type="button"
              onClick={() => insertTemplate("Impact:\nAccelerated client lead velocity by 40% while cutting server response latency by 65%.")}
              title="Insert Impact Highlight"
              style={{
                ...toolbarBtnStyle,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#123968",
                padding: "4px 8px",
                background: "#e2e8f0",
              }}
            >
              <Sparkles size={13} /> + Impact Box
            </button>
          </div>
        )}

        {/* Content Canvas */}
        {activeTab === "write" ? (
          <textarea
            ref={textareaRef}
            required={required}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Write structured descriptions or markdown here..."}
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "14.5px",
              lineHeight: 1.7,
              border: "none",
              outline: "none",
              color: "#0f172a",
              background: "#ffffff",
              resize: "vertical",
              fontFamily: "inherit",
              minHeight: `${rows * 24}px`,
            }}
          />
        ) : (
          <div
            style={{
              padding: "20px 24px",
              background: "#ffffff",
              minHeight: `${rows * 24}px`,
              maxHeight: "450px",
              overflowY: "auto",
            }}
          >
            {value.trim() ? (
              <FormattedContent content={value} type={type} />
            ) : (
              <div style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "14px", padding: "20px 0", textAlign: "center" }}>
                Nothing to preview yet. Switch back to Write to add content.
              </div>
            )}
          </div>
        )}

        {/* Footer Info Bar */}
        <div
          style={{
            padding: "6px 14px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "11.5px",
            color: "#64748b",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <HelpCircle size={12} /> Markdown, headers, bullet points &amp; tech badges are supported
          </span>
          <span>
            <strong>{wordCount}</strong> words &middot; <strong>{charCount}</strong> chars
          </span>
        </div>
      </div>
    </div>
  );
}

const toolbarBtnStyle: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "5px",
  border: "none",
  background: "transparent",
  color: "#334155",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

