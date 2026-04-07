import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../contexts/AppContext";
import { SOS_CONTACTS } from "../../constants";
import { useMapSDK } from "../../hooks/useMapSDK";

export function SOSModal() {
  const { sosOpen, setSosOpen, user, triggerSOS } = useApp();
  const mapRef = useRef(null);
  const mapInstRef = useRef(null);
  const [myLocation, setMyLocation] = useState(null);
  const [locationName, setLocationName] = useState("Obteniendo ubicación...");
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const isValidNumber = (v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v)) && isFinite(Number(v)) && Number(v) !== 0;

  useEffect(() => {
    if (!sosOpen) { setTriggered(false); setCountdown(null); return; }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setMyLocation({ lat, lng });
        setLocationName(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });
    }
  }, [sosOpen]);

  const markerRef = useRef(null);

  useMapSDK(mapRef, (tt) => {
    if (!sosOpen || mapInstRef.current) return;
    
    const center = (myLocation && isValidNumber(myLocation.lng) && isValidNumber(myLocation.lat)) 
      ? [myLocation.lng, myLocation.lat] 
      : [-69.9333, 18.4682];
    const map = tt.map({
      key: import.meta.env.VITE_TOMTOM_KEY,
      container: mapRef.current,
      center: center,
      zoom: 15,
      dragPan: true,
      zoomControl: false,
    });

    mapInstRef.current = map;

    map.on("load", () => {
      if (myLocation && isValidNumber(myLocation.lat) && isValidNumber(myLocation.lng)) {
        const el = document.createElement("div");
        el.style.cssText = "width:18px;height:18px;background:#E4002B;border-radius:50%;border:3px solid white;box-shadow:0 0 0 8px rgba(228,0,43,0.2),0 0 0 16px rgba(228,0,43,0.1)";
        markerRef.current = new tt.Marker({ element: el })
          .setLngLat([myLocation.lng, myLocation.lat])
          .setPopup(new tt.Popup({ offset: 20 }).setHTML("Tu ubicación actual"))
          .addTo(map);
      }
    });
  }, [sosOpen]); // Only when modal opens

  useEffect(() => {
    if (mapInstRef.current && markerRef.current && myLocation) {
      markerRef.current.setLngLat([myLocation.lng, myLocation.lat]);
    }
  }, [myLocation]);

  useEffect(() => {
    if (!sosOpen && mapInstRef.current) {
      mapInstRef.current.remove();
      mapInstRef.current = null;
      markerRef.current = null;
    }
  }, [sosOpen]);

  const handleTrigger = () => {
    let c = 3;
    setCountdown(c);
    const t = setInterval(() => {
      c--;
      if (c <= 0) { 
        clearInterval(t); 
        setCountdown(null); 
        setTriggered(true); 
        triggerSOS(locationName); 
      }
      else setCountdown(c);
    }, 1000);
  };

  if (!sosOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.8)" }}>
      <div style={{ background: "#ffffff", color: "#0033A0", border: "1px solid #e2e8f0", borderRadius: 24, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(228,0,43,0.15)" }}>
        <div style={{ background: "#E4002B", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "22px 22px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "white" }}>EMERGENCIA SOS</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Sistema de Seguridad PUCMM</div>
            </div>
          </div>
          <button onClick={() => setSosOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#ffffff", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
            <div style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Ubicación Actual</div>
            <div style={{ color: "#0033A0", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{locationName}</div>
            {user && <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{user.name} ({user.studentId})</div>}
          </div>
          <div ref={mapRef} style={{ width: "100%", height: 180, borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }} />
          {!triggered ? (
            <button onClick={handleTrigger} disabled={countdown !== null} style={{
              padding: "18px", borderRadius: 14, border: "none", cursor: countdown !== null ? "not-allowed" : "pointer",
              background: countdown !== null ? "#94a3b8" : "#E4002B",
              color: "#ffffff", fontWeight: 800, fontSize: 16,
              boxShadow: countdown === null ? "0 4px 15px rgba(228,0,43,0.3)" : "none",
            }}>
              {countdown !== null ? `Activando en ${countdown}...` : "ACTIVAR ALERTA SOS"}
            </button>
          ) : (
            <div style={{ background: "rgba(228,0,43,0.05)", border: "2px solid #E4002B", borderRadius: 14, padding: 20, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#E4002B", marginBottom: 4 }}>Alerta SOS Enviada</div>
              <div style={{ color: "#64748b", fontSize: 12 }}>El equipo de Seguridad ha recibido tu ubicación y está en camino</div>
            </div>
          )}
          <div>
            <div style={{ color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Contactos Prioritarios</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SOS_CONTACTS.map(c => (
                <a key={c.phone} href={`tel:${c.phone.replace(/\D/g, "")}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", color: "#0033A0", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", textDecoration: "none", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ color: "#64748b" }}>
                      {/* En una app real usaríamos iconos de Lucide dinámicos, aquí simulamos con SVG o texto basado en c.icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</div>
                      <div style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{c.phone}</div>
                    </div>
                  </div>
                  <div style={{ color: "#E4002B" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <button onClick={() => setSosOpen(false)} style={{ padding: "14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Cancelar y volver
          </button>
        </div>
      </div>
    </div>
  );
}
