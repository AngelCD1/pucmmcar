import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../contexts/AppContext";
import { PUCMM_LOCATIONS } from "../constants";
import { useMapSDK } from "../hooks/useMapSDK";
import { PageHeader } from "../components/layout/PageHeader";

export function AdminMapView() {
  const { rides } = useApp();
  const mapRef = useRef(null);
  const mapInstRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState(null);
  const activeRides = React.useMemo(() => 
    rides.filter(r => r.status === "active"),
  [rides]);
  
  const markersRef = useRef([]);
  const routesRef = useRef([]);
  
  const isValidNumber = (v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v)) && isFinite(Number(v)) && Number(v) !== 0;
  
  const SD_BOUNDS = {
    latMin: 18.35, latMax: 18.60,
    lngMin: -70.10, lngMax: -69.75
  };

  const isInSD = (lat, lng) => 
    lat >= SD_BOUNDS.latMin && lat <= SD_BOUNDS.latMax &&
    lng >= SD_BOUNDS.lngMin && lng <= SD_BOUNDS.lngMax;

  useMapSDK(mapRef, (tt) => {
    if (mapInstRef.current) return;
    
    const map = tt.map({
      key: import.meta.env.VITE_TOMTOM_KEY,
      container: mapRef.current,
      center: [-69.9333, 18.4682],
      zoom: 12,
      dragPan: true,
    });

    mapInstRef.current = map;

    map.on("load", () => {
      PUCMM_LOCATIONS.forEach(loc => {
        const cEl = document.createElement("div");
        cEl.style.cssText = "background:#0033A0;width:28px;height:28px;border-radius:6px;border:2px solid white;display:flex;align-items:center;justify-content:center;overflow:hidden";
        cEl.innerHTML = `<img src="https://i.postimg.cc/zXGbj4g9/Whats-App-Image-2026-03-09-at-5-27-37-PM.jpg" style="width:100%;height:100%;object-fit:cover" />`;
        
        new tt.Marker({ element: cEl })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(new tt.Popup({ offset: 25 }).setHTML(`<strong>${loc.name}</strong>`))
          .addTo(map);
      });
      setMapReady(true);
    });
  }, []); // Only on mount

  useEffect(() => {
    const map = mapInstRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    routesRef.current.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    routesRef.current = [];

    const tt = window.tt;
    activeRides.forEach(ride => {
      const fLat = parseFloat(ride.fromLat);
      const fLng = parseFloat(ride.fromLng);
      const tLat = parseFloat(ride.toLat);
      const tLng = parseFloat(ride.toLng);

      // ESCUDO: Solo procesar rides con coordenadas válidas
      if (!isValidNumber(fLat) || !isValidNumber(fLng) || !isValidNumber(tLat) || !isValidNumber(tLng)) return;
      if (!isInSD(fLat, fLng) || !isInSD(tLat, tLng)) return;

      try {
        const dEl = document.createElement("div");
        dEl.style.cssText = "background:#FFD100;width:34px;height:34px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(255,209,0,0.15)";
        const marker = new tt.Marker({ element: dEl })
          .setLngLat([fLng, fLat])
          .addTo(map);
        marker.getElement().addEventListener("click", () => setSelected(ride));
        markersRef.current.push(marker);

        const tEl = document.createElement("div");
        tEl.style.cssText = "background:#0033A0;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white";
        const tMarker = new tt.Marker({ element: tEl }).setLngLat([tLng, tLat]).addTo(map);
        markersRef.current.push(tMarker);

        const routeId = `route-${ride.id}`;
        map.addSource(routeId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [[fLng, fLat], [tLng, tLat]]
            }
          }
        });
        map.addLayer({
          id: routeId,
          type: "line",
          source: routeId,
          paint: { "line-color": "#FFD100", "line-width": 2, "line-dasharray": [2, 1] }
        });
        routesRef.current.push(routeId);
      } catch (e) {
        console.warn("Fallo al renderizar ride en AdminMap:", ride.id, e);
      }
    });
  }, [activeRides, mapReady]);

  useEffect(() => () => { 
    if (mapInstRef.current) { 
      mapInstRef.current.remove(); 
      mapInstRef.current = null; 
    } 
  }, []);

  return (
    <div className="fade-up">
      <PageHeader title="Mapa en Vivo" subtitle={`${activeRides.length} viajes activos en este momento`} />
      <div style={{ 
        display: "flex", 
        gap: 16, 
        minHeight: 500, 
        position: "relative",
        flexWrap: "wrap"
      }}>
        <div style={{ 
          flex: "1 1 500px", 
          position: "relative", 
          borderRadius: 16, 
          overflow: "hidden", 
          border: "1px solid #e2e8f0",
          minHeight: 400
        }}>
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          {!mapReady && (
            <div style={{ position: "absolute", inset: 0, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <div style={{ width: 36, height: 36, border: "3px solid #0033A0", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          )}

          <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 14px", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Leyenda Administrativa</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, color: "#1e293b" }}>
                <div style={{ width: 12, height: 12, background: "#FFD100", borderRadius: "50%", border: "2px solid white" }} /> Conductor Activo
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, color: "#1e293b" }}>
                <div style={{ width: 12, height: 12, background: "#0033A0", borderRadius: "2px", border: "2px solid white" }} /> Punto de Destino
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", top: 16, right: 16, background: "#0033A0", color: "white", borderRadius: 24, padding: "8px 16px", zIndex: 10, fontWeight: 700, fontSize: 12, boxShadow: "0 4px 12px rgba(0,61,165,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
            {activeRides.length} VIAJES ACTIVOS
          </div>
        </div>

        <div style={{ 
          width: 300, 
          flex: "1 1 300px",
          background: "#ffffff", 
          color: "#0033A0", 
          border: "1px solid #e2e8f0", 
          borderRadius: 16, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden",
          maxHeight: 600
        }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", fontWeight: 700, fontSize: 13 }}>Lista de Viajes</div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {activeRides.map(r => (
              <button key={r.id} onClick={() => setSelected(r)} style={{ textAlign: "left", padding: 12, borderRadius: 12, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${selected?.id === r.id ? "#0033A0" : "#e2e8f0"}`, background: selected?.id === r.id ? "rgba(0,61,165,0.03)" : "transparent", transition: "all 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{r.driverName}</span><span style={{ color: "#0033A0", fontWeight: 800, fontSize: 12 }}>RD$ ${r.price}</span></div>
                <div style={{ color: "#64748b", fontSize: 10 }}>{r.time} • {r.from.split(",")[0]} → {r.to.split(",")[0]}</div>
              </button>
            ))}
            {activeRides.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 12 }}>Sin viajes en curso</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
