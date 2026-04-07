import React from "react";

export function Badge({ color = "slate", children }) {
  const colors = {
    green: { bg: "rgba(22,163,74,0.1)", color: "#16A34A", border: "rgba(22,163,74,0.2)" },
    yellow: { bg: "rgba(255,225,0,0.1)", color: "#FFD100", border: "rgba(255,225,0,0.2)" },
    red: { bg: "rgba(200,16,46,0.1)", color: "#C8102E", border: "rgba(200,16,46,0.2)" },
    blue: { bg: "rgba(0,51,160,0.1)", color: "#0033A0", border: "rgba(0,51,160,0.2)" },
    orange: { bg: "rgba(249,115,22,0.1)", color: "#ea580c", border: "rgba(249,115,22,0.2)" },
    slate: { bg: "rgba(100,116,139,0.1)", color: "#64748b", border: "rgba(100,116,139,0.2)" },
  };

  if (colors[color]) {
    const c = colors[color];
    return <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
  }

  return (
    <span style={{
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}33`,
      padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap"
    }}>{children}</span>
  );
}
