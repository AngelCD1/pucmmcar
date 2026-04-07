import React, { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Card } from "../common/Card";
import { Btn } from "../common/Btn";

export function RatingModal({ open, onClose, targetName, targetId, rideId }) {
  const { submitRating, isDark } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const handle = async () => {
    await submitRating(rideId, targetId, rating, comment);
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(0,0,0,0.8)" }}>
      <Card style={{ maxWidth: 400, width: "100%", textAlign: "center", padding: 32 }} className="fade-up">
        {!sent ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16, color: "#FFD100" }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 8, color: isDark ? "#fff" : "#0033A0" }}>Califica tu viaje</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>¿Cómo fue tu experiencia con <strong>{targetName}</strong>?</p>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(star)} style={{ background: "none", border: "none", cursor: "pointer", color: rating >= star ? "#FFD100" : (isDark ? "#334155" : "#e2e8f0"), transition: "all 0.2s", transform: rating >= star ? "scale(1.1)" : "scale(1)" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </button>
              ))}
            </div>

            <textarea
              placeholder="Escribe un comentario (opcional)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              style={{ width: "100%", background: isDark ? "rgba(255,255,255,0.05)" : "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, fontSize: 13, minHeight: 80, marginBottom: 24, outline: "none", color: isDark ? "#fff" : "#0033A0" }}
            />

            <Btn size="xl" style={{ width: "100%", justifyContent: "center" }} onClick={handle}>ENVIAR CALIFICACIÓN</Btn>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 12, marginTop: 16, cursor: "pointer" }}>Omitir</button>
          </>
        ) : (
          <div className="fade-up">
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontWeight: 900, fontSize: 20, color: isDark ? "#fff" : "#0033A0" }}>¡Gracias por tu apoyo!</h3>
            <p style={{ color: "#64748b", fontSize: 13 }}>Tu calificación ayuda a mantener la comunidad segura y confiable.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
