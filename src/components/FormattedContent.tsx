import React from "react";
import { CheckCircle2, ChevronRight, Sparkles, Layers, ArrowUpRight } from "lucide-react";

interface FormattedContentProps {
  content: string;
  type?: "project" | "blog" | "general";
  className?: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and [links](url)
 */
function renderInlineFormatting(text: string): React.ReactNode[] {
  // Regex matches:
  // 1. [text](url)
  // 2. **bold**
  // 3. *italic*
  // 4. `code`
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [text](url)
    if (part.startsWith("[") && part.includes("](") && part.endsWith(")")) {
      const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (match) {
        const [, linkText, url] = match;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#0a2540",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {linkText}
            <ArrowUpRight size={12} />
          </a>
        );
      }
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} style={{ fontWeight: 700, color: "#0f172a" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={index} style={{ fontStyle: "italic" }}>
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline Code: `text`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          style={{
            background: "#f1f5f9",
            color: "#0a2540",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.9em",
            fontFamily: "monospace",
            border: "1px solid #e2e8f0",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Plain text
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Intelligent Formatted Content Renderer
 * Handles Markdown and standard agency text patterns (Overview:, Key Highlights:, Tech Stack:, Tables, Bullet Points)
 */
export default function FormattedContent({ content, type = "general" }: FormattedContentProps) {
  if (!content || typeof content !== "string") return null;

  // Split lines while preserving block structures
  const rawLines = content.replace(/\r\n/g, "\n").split("\n");

  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentList: { type: "bullet" | "number" | "check"; items: string[] } | null = null;
  let currentTable: string[] | null = null;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ").trim();
      if (text) {
        elements.push(
          <p
            key={`p-${elements.length}`}
            style={{
              fontSize: type === "blog" ? "17px" : "15px",
              lineHeight: 1.8,
              color: "#334155",
              marginBottom: "18px",
            }}
          >
            {renderInlineFormatting(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 20px 0",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {currentList.items.map((item, idx) => {
            // Check if item has title like "Title: details" or "Title – details"
            const separatorMatch = item.match(/^([^:–—]+)[:–—](.+)$/);
            return (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: type === "blog" ? "16px" : "14.5px",
                  lineHeight: 1.65,
                  color: "#334155",
                }}
              >
                <div style={{ flexShrink: 0, marginTop: "4px" }}>
                  {currentList?.type === "check" ? (
                    <CheckCircle2 size={16} color="#059669" />
                  ) : (
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#0a2540",
                        marginTop: "7px",
                      }}
                    />
                  )}
                </div>
                <div>
                  {separatorMatch ? (
                    <>
                      <strong style={{ color: "#0f172a", fontWeight: 700 }}>
                        {renderInlineFormatting(separatorMatch[1].trim())}:
                      </strong>{" "}
                      {renderInlineFormatting(separatorMatch[2].trim())}
                    </>
                  ) : (
                    renderInlineFormatting(item)
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      );
      currentList = null;
    }
  };

  const flushTable = () => {
    if (currentTable && currentTable.length > 0) {
      const rows = currentTable.map((line) =>
        line
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      const headerRow = rows[0] || [];
      // Skip delimiter row (|---|---|)
      const dataRows = rows.slice(1).filter((r) => !r.every((cell) => cell.replace(/-/g, "").length === 0));

      elements.push(
        <div
          key={`table-${elements.length}`}
          style={{
            overflowX: "auto",
            margin: "24px 0",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            {headerRow.length > 0 && (
              <thead style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>
                      {renderInlineFormatting(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {dataRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: rIdx < dataRows.length - 1 ? "1px solid #f1f5f9" : "none",
                    background: rIdx % 2 === 0 ? "#ffffff" : "#fbfcfe",
                  }}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: "12px 16px", color: "#334155" }}>
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    // Empty line separates blocks
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    // 1. Markdown Table Row (| Cell | Cell |)
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      flushList();
      if (!currentTable) currentTable = [];
      currentTable.push(line);
      continue;
    } else {
      flushTable();
    }

    // 2. Headings (Markdown # or ## or ###)
    if (line.startsWith("#")) {
      flushParagraph();
      flushList();
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, "");

      if (level === 1) {
        elements.push(
          <h2
            key={`h1-${elements.length}`}
            style={{
              fontSize: type === "blog" ? "26px" : "22px",
              fontWeight: 800,
              color: "#0f172a",
              marginTop: "28px",
              marginBottom: "14px",
              lineHeight: 1.3,
            }}
          >
            {renderInlineFormatting(text)}
          </h2>
        );
      } else if (level === 2) {
        elements.push(
          <h3
            key={`h2-${elements.length}`}
            style={{
              fontSize: type === "blog" ? "22px" : "19px",
              fontWeight: 700,
              color: "#0a2540",
              marginTop: "24px",
              marginBottom: "12px",
              lineHeight: 1.35,
            }}
          >
            {renderInlineFormatting(text)}
          </h3>
        );
      } else {
        elements.push(
          <h4
            key={`h3-${elements.length}`}
            style={{
              fontSize: "17px",
              fontWeight: 700,
              color: "#1e293b",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            {renderInlineFormatting(text)}
          </h4>
        );
      }
      continue;
    }

    // 3. Section Headers common in Portfolio & Blog database records
    const lowerLine = line.toLowerCase();
    const isSectionHeader =
      lowerLine === "overview:" ||
      lowerLine === "overview" ||
      lowerLine.startsWith("key highlights") ||
      lowerLine.startsWith("key features") ||
      lowerLine.startsWith("tech stack") ||
      lowerLine.startsWith("why it matters") ||
      lowerLine.startsWith("impact:") ||
      lowerLine.startsWith("conclusion");

    if (isSectionHeader) {
      flushParagraph();
      flushList();

      if (lowerLine.startsWith("tech stack")) {
        // Render tech stack header
        elements.push(
          <div
            key={`tech-header-${elements.length}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#0a2540",
              marginTop: "24px",
              marginBottom: "12px",
            }}
          >
            <Layers size={16} />
            Tech Stack &amp; Technologies
          </div>
        );

        // Check if tech stack is on the same line or next line
        const sameLineTech = line.replace(/tech stack:?/i, "").trim();
        if (sameLineTech) {
          const techBadges = sameLineTech.split(/[·,;|]/).map((t) => t.trim()).filter(Boolean);
          elements.push(
            <div
              key={`tech-pills-${elements.length}`}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              {techBadges.map((badge, bIdx) => (
                <span
                  key={bIdx}
                  style={{
                    background: "#f1f5f9",
                    color: "#0a2540",
                    border: "1px solid #e2e8f0",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          );
        }
        continue;
      }

      if (lowerLine.startsWith("impact:") || lowerLine.startsWith("why it matters")) {
        const text = line.replace(/^(impact|why it matters):?/i, "").trim();
        elements.push(
          <div
            key={`impact-${elements.length}`}
            style={{
              background: "rgba(10, 37, 64, 0.04)",
              borderLeft: "3px solid #0a2540",
              borderRadius: "0 8px 8px 0",
              padding: "16px 20px",
              margin: "20px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#0a2540", marginBottom: "4px" }}>
              <Sparkles size={14} /> Key Strategic Impact
            </div>
            {text && (
              <p style={{ margin: 0, fontSize: "14.5px", color: "#334155", lineHeight: 1.65 }}>
                {renderInlineFormatting(text)}
              </p>
            )}
          </div>
        );
        continue;
      }

      elements.push(
        <h3
          key={`sec-${elements.length}`}
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: "#0a2540",
            marginTop: "24px",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ width: "4px", height: "16px", background: "#0a2540", borderRadius: "2px" }} />
          {line.replace(/:$/, "")}
        </h3>
      );
      continue;
    }

    // 4. Bullet & Checkmark Lists
    const isCheckItem = line.startsWith("✅");
    const isBulletItem = line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ") || line.startsWith("🔹 ");
    const isNumberItem = /^\d+\.\s/.test(line);

    if (isCheckItem || isBulletItem || isNumberItem) {
      flushParagraph();
      const listType = isCheckItem ? "check" : isNumberItem ? "number" : "bullet";
      let cleanText = line
        .replace(/^✅\s*/, "")
        .replace(/^[-*•🔹]\s*/, "")
        .replace(/^\d+\.\s*/, "");

      if (!currentList || currentList.type !== listType) {
        flushList();
        currentList = { type: listType, items: [] };
      }
      currentList.items.push(cleanText);
      continue;
    }

    // 5. Blockquote (> quote)
    if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      const quoteText = line.replace(/^>\s*/, "");
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          style={{
            margin: "20px 0",
            padding: "16px 24px",
            borderLeft: "3px solid #0a2540",
            background: "#f8fafc",
            borderRadius: "0 8px 8px 0",
            fontSize: "16px",
            fontStyle: "italic",
            color: "#475569",
            lineHeight: 1.7,
          }}
        >
          {renderInlineFormatting(quoteText)}
        </blockquote>
      );
      continue;
    }

    // 6. Numbered feature item in text (e.g. "1. OpenAI's Sora 2: Redefining...")
    const numberedFeatureMatch = line.match(/^(\d+)\.\s+([^:]+):(.*)$/);
    if (numberedFeatureMatch) {
      flushParagraph();
      flushList();
      const [, num, featureTitle, featureBody] = numberedFeatureMatch;
      elements.push(
        <div key={`feat-${elements.length}`} style={{ marginTop: "20px", marginBottom: "16px" }}>
          <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", background: "#0a2540", color: "#ffffff", fontSize: "12px", fontWeight: 700 }}>
              {num}
            </span>
            {renderInlineFormatting(featureTitle.trim())}
          </h4>
          {featureBody.trim() && (
            <p style={{ fontSize: type === "blog" ? "16px" : "15px", lineHeight: 1.75, color: "#334155", margin: 0, paddingLeft: "32px" }}>
              {renderInlineFormatting(featureBody.trim())}
            </p>
          )}
        </div>
      );
      continue;
    }

    // Otherwise, append to current paragraph
    currentParagraph.push(line);
  }

  // Flush remaining
  flushParagraph();
  flushList();
  flushTable();

  return <div style={{ display: "flex", flexDirection: "column" }}>{elements}</div>;
}

