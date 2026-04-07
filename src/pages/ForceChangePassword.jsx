import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { Card } from "../components/common/Card";
import { Btn } from "../components/common/Btn";
import { Input } from "../components/common/Input";

export function ForceChangePassword() {
  const { user, changePassword, logout, isDark } = useApp();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    if (!next || !confirm) { setErr("Completa todos los campos"); return; }
    if (next.length < 6) { setErr("Mínimo 6 caracteres"); return; }
    if (next !== confirm) { setErr("Las contraseñas no coinciden"); return; }
    setLoading(true);
    // Usamos tempPassword como contraseña actual para re-autenticar
    const error = await changePassword(user.tempPassword, next);
    setLoading(false);
    if (error) setErr(error);
  };

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#050c18" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ maxWidth: 400, width: "100%", padding: 32, textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.1)" }} className="fade-up">
        <div style={{ width: 64, height: 64, background: "rgba(255,209,0,0.1)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#FFD100" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: isDark ? "#fff" : "#001F54" }}>Actualiza tu Contraseña</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Por seguridad, debes cambiar tu contraseña temporal antes de continuar.</p>

        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Input label="Nueva Contraseña" type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="Mínimo 6 caracteres" required />
          <Input label="Confirmar Nueva Contraseña" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" required />
          {err && <div style={{ color: "#ef4444", fontSize: 12, fontWeight: 600 }}>{err}</div>}
          <Btn size="xl" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            {loading ? "Actualizando..." : "Actualizar y Entrar"}
          </Btn>
          <button type="button" onClick={logout} style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>Cancelar y salir</button>
        </form>
      </Card>
    </div>
  );
}
