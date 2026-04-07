import React from "react";
import { useApp } from "../../contexts/AppContext";

export function PageHeader({ title, subtitle, action }) {
  const { isDark } = useApp();
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: "Space Grotesk", marginBottom: 4, color: isDark ? "#ffffff" : "#001F54", letterSpacing: "-0.5px" }}>{title}</h1>
        {subtitle && <p style={{ color: "#6B7280", fontSize: 14 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
