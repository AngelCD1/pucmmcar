import React from "react";
import { useApp } from "../../contexts/AppContext";

export function Select({ label, noLabel, children, ...props }) {
  const { isDark } = useApp();
  return (
    <div>
      {label && !noLabel && <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>}
      <select style={{
        width: "100%", background: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#ffffff" : "#001F54",
        border: `1px solid ${isDark ? "#1e293b" : "#e5e7eb"}`, borderRadius: 12, padding: "12px 14px",
        fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
        appearance: "none", cursor: "pointer",
      }}
        onFocus={e => e.target.style.borderColor = "#FFD100"}
        onBlur={e => e.target.style.borderColor = isDark ? "#334155" : "#69B3E7"}
        {...props}>{children}</select>
    </div>
  );
}
