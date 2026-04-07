import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { useMapSDK } from "../hooks/useMapSDK";
import { Btn } from "../components/common/Btn";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Navigation, ShieldAlert } from "lucide-react"; 
import { MAP_CONFIG } from "../constants";

export function LiveTrack({ onFinishRide }) {
  const { liveTracking, rides, setView, setSosOpen, user, startRide, confirmRide, cancelRide, triggerSOS, showToast } = useApp();
  const mapRef = useRef(null);
  const mapInstRef = useRef(null);
  const fbUnsubRef = useRef(null);
  const driverMarkerRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [source, setSource] = useState("estimacion");
  const [eta, setEta] = useState("--");
  const [alerts, setAlerts] = useState({ pickup: false, destination: false });
  const [pinInput, setPinInput] = useState("");

  const ride = rides.find(r => r.id === liveTracking);

  // --- VALIDACIÓN Y LÍMITES DE SANTO DOMINGO ---
  const isValidNumber = (v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v)) && isFinite(Number(v)) && Number(v) !== 0;

  const SD_BOUNDS = {
    latMin: 18.35, latMax: 18.60,
    lngMin: -70.10, lngMax: -69.75
  };

  const isInSD = (lat, lng) =>
    lat >= SD_BOUNDS.latMin && lat <= SD_BOUNDS.latMax &&
    lng >= SD_BOUNDS.lngMin && lng <= SD_BOUNDS.lngMax;

  // Distancia Haversine para alertas de proximidad
  const getDist = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const actualizarMarcadorEnMapa = useCallback((driverLat, driverLng) => {
    const lat = Number(driverLat);
    const lng = Number(driverLng);

    // ESCUDO: Solo mover marcador si los datos son válidos y están en SD
    if (!isValidNumber(lat) || !isValidNumber(lng) || !isInSD(lat, lng) || !driverMarkerRef.current) return;

    driverMarkerRef.current.setLngLat([lng, lat]);

    if (ride) {
      // Lógica de llegada al pickup (300 metros)
      if (ride.status === "active" && !alerts.pickup) {
        const d = getDist(lat, lng, Number(ride.fromLat), Number(ride.fromLng));
        if (d < 300) {
          showToast("📍 El conductor está cerca del punto de recogida", "info");
          setAlerts(p => ({ ...p, pickup: true }));
        }
      }
      // Lógica de llegada al destino (300 metros)
      if (ride.status === "on-way" && !alerts.destination) {
        const d = getDist(lat, lng, Number(ride.toLat), Number(ride.toLng));
        if (d < 300) {
          showToast("🏁 Estás llegando a PUCMM", "success");
          setAlerts(p => ({ ...p, destination: true }));
        }
      }

      // ETA Simple basado en distancia
      const dist = getDist(lat, lng, Number(ride.toLat), Number(ride.toLng));
      const mins = Math.max(1, Math.round((dist / 1000) * 3)); // Estimación: 3 min por km en SD
      setEta(`~${mins} min`);
    }
  }, [ride, alerts, showToast]);

  // 1. INICIALIZACIÓN DEL MAPA
  useMapSDK(mapRef, (tt) => {
    if (mapInstRef.current || !ride) return;

    const center = (isValidNumber(ride.fromLng) && isValidNumber(ride.fromLat))
      ? [Number(ride.fromLng), Number(ride.fromLat)]
      : [-69.9333, 18.4682];

    const map = tt.map({
      key: MAP_CONFIG.tomtomKey,
      container: mapRef.current,
      center: center,
      zoom: 15,
      dragPan: true,
    });

    mapInstRef.current = map;

    map.on("load", () => {
      setMapReady(true);

      // Marker Destino (PUCMM)
      const tLat = Number(ride.toLat);
      const tLng = Number(ride.toLng);
      const fLat = Number(ride.fromLat);
      const fLng = Number(ride.fromLng);

      if (isValidNumber(tLat) && isValidNumber(tLng)) {
        const destEl = document.createElement("div");
        destEl.innerHTML = `<div style="background:#0033A0; width:34px; height:34px; border-radius:50%; border:4px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold;">P</div>`;
        new tt.Marker({ element: destEl })
          .setLngLat([tLng, tLat])
          .addTo(map);
      }

      // Marker Conductor (Auto/Puntero)
      if (isValidNumber(fLat) && isValidNumber(fLng)) {
        const driverEl = document.createElement("div");
        driverEl.innerHTML = `<div style="background:#FFD100; width:30px; height:30px; border-radius:50%; border:3px solid #1e293b; box-shadow:0 0 15px rgba(255,209,0,0.5); display:flex; align-items:center; justify-content:center;">🚗</div>`;

        driverMarkerRef.current = new tt.Marker({ element: driverEl })
          .setLngLat([fLng, fLat])
          .addTo(map);
      }
    });
  });

  // 2. SINCRONIZACIÓN FIREBASE (Solo si hay cambios reales)
  useEffect(() => {
    if (!ride?.id || !mapReady) return;

    const rideRef = doc(db, "rides", ride.id);
    fbUnsubRef.current = onSnapshot(rideRef, (snap) => {
      const data = snap.data();
      if (data && isValidNumber(data.driverLat) && isValidNumber(data.driverLng)) {
        actualizarMarcadorEnMapa(data.driverLat, data.driverLng);
        setSource("firebase");
      }
    });

    return () => { if (fbUnsubRef.current) fbUnsubRef.current(); };
  }, [ride?.id, mapReady, actualizarMarcadorEnMapa]);

  // 3. CLEANUP (Previene fugas de memoria y errores WebGL)
  useEffect(() => {
    return () => {
      if (fbUnsubRef.current) fbUnsubRef.current();
      if (mapInstRef.current) {
        mapInstRef.current.remove();
        mapInstRef.current = null;
      }
    };
  }, []);

  if (!ride) return <div className="p-20 text-center font-black uppercase tracking-widest text-navy animate-pulse">Sincronizando trayecto...</div>;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Header Estilizado */}
      <div className="flex items-center justify-between py-4 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setView("myrides")} className="flex items-center gap-2 text-navy dark:text-blue-400 text-[10px] font-black uppercase tracking-tighter">
          <Navigation className="w-3 h-3 rotate-180 fill-current" /> Volver
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-black text-[10px] tracking-widest text-navy dark:text-white uppercase">En Vivo</span>
        </div>
        <button onClick={() => setSosOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-[10px] font-black transition-all active:scale-95 shadow-lg shadow-red-500/20">SOS</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden">
        {/* Mapa con bordes suaves */}
        <div className="flex-[2] relative rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl min-h-[350px]">
          <div ref={mapRef} className="w-full h-full" />
          {!mapReady && (
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-navy border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Info Panel Lateral */}
        <div className="flex-1 max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl flex flex-col gap-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-navy dark:bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
              {ride.driverName.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-navy dark:text-white text-lg">{ride.driverName}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toyota Corolla • {ride.carPlate || 'A123456'}</p>
            </div>
          </div>

          <div className="p-6 bg-navy dark:bg-blue-900 rounded-[1.5rem] text-white shadow-inner">
            <p className="text-[9px] font-black uppercase opacity-50 mb-1">Tiempo de llegada</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter">{eta}</span>
            </div>
            <div className="mt-3 py-1 px-3 bg-white/10 rounded-lg inline-flex items-center gap-2 text-[9px] font-black uppercase">
              {source === 'firebase' ? '🛰️ Señal GPS Satelital' : '⚡ Calculando ruta...'}
            </div>
          </div>

          <div className="space-y-3 mt-auto">
            {ride.status === "active" && user.id === ride.driverId && (
              <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-[10px] font-black text-center text-slate-500 uppercase tracking-widest">Verificación de Pasajero</p>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="PIN DE 4 DÍGITOS"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl font-black bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl h-14 tracking-[0.5em] focus:border-navy focus:ring-0 outline-none"
                />
                <Btn 
                  size="xl" 
                  disabled={pinInput.length !== 4}
                  className="w-full bg-green-500 hover:bg-green-600 h-14 font-black rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={async () => {
                    const ok = await startRide(ride.id, pinInput);
                    if (ok) setPinInput("");
                  }}
                >
                  INICIAR RECOGIDA
                </Btn>
              </div>
            )}
            {ride.status === "active" && user.id !== ride.driverId && (
              <div className="p-4 bg-gold/10 border-2 border-gold/30 rounded-[1.5rem] mt-4 flex justify-between items-center animate-in fade-in zoom-in-95 duration-500 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/20 rounded-full blur-xl -mr-10 -mt-10 pointer-events-none" />
                <div>
                  <p className="text-[10px] font-black uppercase text-gold-dark dark:text-gold-light mb-1 tracking-widest">Pin de Abordaje</p>
                  <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 max-w-[140px] leading-tight">Díctale este código al conductor para iniciar el viaje.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-gold/20 text-2xl font-black tracking-widest text-navy dark:text-white">
                  {ride.pickupPin || "0000"}
                </div>
              </div>
            )}
            {ride.status === "on-way" && user.id === ride.driverId && (
              <Btn size="xl" className="w-full bg-navy hover:bg-indigo-900 h-14 font-black rounded-2xl shadow-lg shadow-navy/20 text-white" onClick={() => confirmRide(ride.id)}>FINALIZAR VIAJE</Btn>
            )}
            <button
              onClick={() => setSosOpen(true)}
              className="w-full py-4 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldAlert size={14} /> Reportar Emergencia S.O.S
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}