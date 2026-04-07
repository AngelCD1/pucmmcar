import React from "react";

export function Btn({ children, variant = "primary", size = "md", style, block, ...props }) {
  const variants = {
    primary: { background: "#FFD100", color: "#0033A0", border: "none", boxShadow: "0 2px 4px rgba(255,209,0,0.3)" },
    secondary: { background: "#0033A0", color: "#ffffff", border: "none" },
    danger: { background: "#C8102E", color: "#ffffff", border: "none" },
    success: { background: "#16A34A", color: "#ffffff", border: "none" },
    ghost: { background: "transparent", color: "#64748b", border: "none" },
  };
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 11, borderRadius: 8 },
    md: { padding: "10px 18px", fontSize: 13, borderRadius: 10 },
    lg: { padding: "14px 24px", fontSize: 14, borderRadius: 12 },
    xl: { padding: "16px 32px", fontSize: 16, borderRadius: 14 },
  };
  return (
    <button style={{ ...variants[variant], ...sizes[size], fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: block ? "block" : "inline-flex", width: block ? "100%" : undefined, justifyContent: "center", alignItems: "center", gap: 6, whiteSpace: "nowrap", ...style }} {...props}>{children}</button>
  );
}
