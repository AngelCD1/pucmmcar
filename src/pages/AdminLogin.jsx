import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";

export function AdminLogin({ onBack }) {
  const { login } = useApp();
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(() => {
    if (!lockTimer) return;
    const t = setInterval(() => setLockTimer(p => p > 1 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [lockTimer]);

  const handle = async (e) => {
    e.preventDefault();
    if (lockTimer > 0) return;
    if (!em || !pw) { setErr("Completa todos los campos."); return; }
    setLoading(true); setErr("");
    const error = await login(em, pw, "admin");
    if (error) {
      if (error.includes("Firebase Rules") || error.includes("configuración")) {
        setErr("⚠️ Error de Permisos: Debes actualizar las Reglas de Seguridad en tu Consola de Firebase para que el Panel funcione.");
        setAttempts(0); // No penalizar por errores de servidor
      } else {
        const na = attempts + 1;
        setAttempts(na);
        if (na >= 3) { setLockTimer(30); setErr("Demasiados intentos. Bloqueado 30s."); }
        else setErr(`${error} Intento ${na}/3.`);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#001F54", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "radial-gradient(#ffffff 0.5px, transparent 0.5px)", backgroundSize: "30px 30px" }}></div>
      <div style={{ position: "absolute", top: "20%", left: "10%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(91,194,231,0.1) 0%, transparent 70%)", filter: "blur(60px)" }}></div>

      <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", padding: 40, borderRadius: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.4)", position: "relative", zIndex: 1 }} className="fade-up">
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 32, display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#ffffff"}>
          Cancelar acceso
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <img src="https://i.postimg.cc/zXGbj4g9/Whats-App-Image-2026-03-09-at-5-27-37-PM.jpg" alt="PUCMMCAR Logo" style={{ width: 52, height: 52, borderRadius: 16, objectFit: "cover" }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 22, color: "#ffffff", fontFamily: "Space Grotesk" }}>Panel de Control</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, letterSpacing: 0.5 }}>AUTENTICACIÓN REQUERIDA</div>
          </div>
        </div>

        <form onSubmit={handle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Correo Administrativo</div>
              <input type="email" value={em} onChange={e => setEm(e.target.value)} placeholder="admin@pucmm.edu.do" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", color: "#ffffff", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "all 0.2s" }} />
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Contraseña</div>
              <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", color: "#ffffff", fontSize: 14, outline: "none", fontFamily: "inherit", transition: "all 0.2s" }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 14, bottom: 12, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
                {showPw ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11-8 11-8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
              </button>
            </div>
          </div>

          {err && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "12px 14px", color: "#f87171", fontSize: 12, marginBottom: 20 }}> {err}</div>}

          <button type="submit" disabled={loading || lockTimer > 0} style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: lockTimer > 0 ? "rgba(255,255,255,0.05)" : "#FFD100",
            color: lockTimer > 0 ? "rgba(255,255,255,0.2)" : "#001F54", fontWeight: 800, fontSize: 15,
            cursor: lockTimer > 0 ? "not-allowed" : "pointer", fontFamily: "inherit",
            transition: "all 0.2s",
            boxShadow: lockTimer > 0 ? "none" : "0 8px 32px rgba(255,209,0,0.3)"
          }} onMouseEnter={e => { if (!loading && lockTimer === 0) e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
            {loading ? "Verificando credenciales..." : lockTimer > 0 ? `Bloqueado (${lockTimer}s)` : "Entrar al Panel Administrativo"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 32, letterSpacing: 0.5, textTransform: "uppercase" }}>
          ACCESO AUDITADO · PUCMM IT SECURITY
        </p>
      </div>
    </div>
  );
}
