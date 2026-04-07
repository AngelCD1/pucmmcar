import React from "react";
import { useApp } from "../../contexts/AppContext";

export function Card({ children, style, className }) {
  const { isDark } = useApp();
  return (
    <div className={className} style={{ 
      background: isDark ? "#0f172a" : "#ffffff", 
      color: isDark ? "#ffffff" : "#001F54", 
      border: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9", 
      borderRadius: 24, padding: 24, 
      boxShadow: isDark ? "none" : "0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.01)", 
      ...style 
    }}>
      {children}
    </div>
  );
}
