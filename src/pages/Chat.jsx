import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../contexts/AppContext";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

export function Chat({ rideId, ride, onClose }) {
  const { user, isDark } = useApp();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!rideId) return;
    const q = query(collection(db, "chats", rideId, "messages"), orderBy("sentAt", "asc"));
    return onSnapshot(q, snap => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [rideId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    const msgData = {
      senderId: user.id, senderName: user.name, senderRole: user.role,
      senderPhoto: user.photo || null,
      text: text.trim(), sentAt: serverTimestamp(),
    };
    if (replyTo) {
      msgData.replyTo = { id: replyTo.id, senderName: replyTo.senderName, text: replyTo.text.slice(0, 100) };
    }
    await addDoc(collection(db, "chats", rideId, "messages"), msgData);
    setText(""); setReplyTo(null); setLoading(false);
  };

  const mine = (msg) => msg.senderId === user?.id;
  const ini = (name) => name ? name.charAt(0).toUpperCase() : "?";

  // Información del conductor para el encabezado
  const driverName = ride?.driverName || "Conductor";
  const driverPhoto = ride?.driverPhoto || null;
  const vehicleInfo = ride ? `${ride.vehicle || ""} · ${ride.plate || ""}` : "";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(5,12,24,0.92)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 440, background: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#fff" : "#003DA5", border: `1px solid ${isDark ? "#1e293b" : "#5BC2E7"}`, borderRadius: 20, display: "flex", flexDirection: "column", maxHeight: "80vh", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }} className="slide-up">
        {/* Encabezado con información del conductor */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {driverPhoto ? (
              <img src={driverPhoto} alt={driverName} style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover", border: "2px solid #FFD100" }} />
            ) : (
              <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#003DA5,#003DA5)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14 }}>{ini(driverName)}</div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{driverName}</div>
              <div style={{ color: "#6C757D", fontSize: 11 }}>{vehicleInfo || "Chat del viaje"}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6C757D", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#64748b", fontSize: 13, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              Sin mensajes aún. ¡Inicia la conversación!
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: mine(msg) ? "flex-end" : "flex-start" }}>
              {!mine(msg) && (
                <div style={{ fontSize: 10, color: "#6C757D", marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontWeight: 800 }}>{msg.senderRole === "driver" ? "CONDUCTOR" : "PASAJERO"}</span> {msg.senderName}
                </div>
              )}
              {/* Bloque de respuesta citada */}
              {msg.replyTo && (
                <div style={{ maxWidth: "78%", padding: "6px 10px", borderRadius: 8, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderLeft: "3px solid #003DA5", fontSize: 11, color: "#64748b", marginBottom: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: 10, color: "#003DA5" }}>{msg.replyTo.senderName}</div>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{msg.replyTo.text}</div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexDirection: mine(msg) ? "row-reverse" : "row" }}>
                <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: mine(msg) ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: mine(msg) ? "linear-gradient(135deg,#003DA5,#003DA5)" : (isDark ? "#1e293b" : "#f1f5f9"), color: mine(msg) ? "#fff" : (isDark ? "#e2e8f0" : "#0f172a"), border: mine(msg) ? "none" : `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, fontSize: 13 }}>{msg.text}</div>
                <button onClick={() => setReplyTo(msg)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#94a3b8", padding: 2, opacity: 0.6, flexShrink: 0 }} title="Responder">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                </button>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Vista previa de respuesta */}
        {replyTo && (
          <div style={{ padding: "8px 16px", borderTop: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,61,165,0.03)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, borderLeft: "3px solid #003DA5", paddingLeft: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#003DA5" }}>Respondiendo a {replyTo.senderName}</div>
              <div style={{ fontSize: 11, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyTo.text}</div>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, padding: 4 }}>×</button>
          </div>
        )}

        {/* Entrada de texto */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`, display: "flex", gap: 8 }}>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()} placeholder="Escribe un mensaje..." style={{ flex: 1, background: isDark ? "#1e293b" : "#f8f9fa", color: isDark ? "#fff" : "#003DA5", border: `1px solid ${isDark ? "#334155" : "#5BC2E7"}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          <button onClick={send} disabled={!text.trim() || loading} style={{ background: "linear-gradient(135deg,#003DA5,#003DA5)", border: "none", borderRadius: 12, width: 44, cursor: "pointer", color: "#ffffff", fontSize: 18, opacity: text.trim() ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
