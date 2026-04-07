import React from "react";
import { useApp } from "../../contexts/AppContext";

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  const styles = {
    success: { bg: "linear-gradient(135deg,#0033A0,#004abf)", icon: "" },
    error: { bg: "linear-gradient(135deg,#E4002B,#ff1f4b)", icon: "" },
    info: { bg: "linear-gradient(135deg,#FFD100,#ffda33)", icon: "" },
  };
  const s = styles[toast.type] || styles.success;
  return (
    <div className="slide-in" style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: s.bg, color: "#ffffff",
      padding: "12px 18px", borderRadius: 14,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 8,
      maxWidth: 360,
    }}>
      <span>{s.icon}</span> {toast.msg}
    </div>
  );
}
