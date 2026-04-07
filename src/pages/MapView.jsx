import React, { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../contexts/AppContext";
import { PUCMM_LOCATIONS, MAP_CONFIG } from "../constants";
import { useMapSDK } from "../hooks/useMapSDK";
import { Avatar } from "../components/common/Avatar";
import { Btn } from "../components/common/Btn";
import { BottomSheet } from "../components/common/BottomSheet";
import { ChevronRight, Filter, MapPin, Navigation, ArrowLeft, Star, Map as MapIcon } from "lucide-react";

export function MapView() {

  const { mapRide, setView, setMapRide, bookRide, user, rides } = useApp();
  const mapRef = useRef(null);
  const mapInstRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedRide, setSelectedRide] = useState(mapRide);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const markersRef = useRef([]);
  const routesRef = useRef([]);

  // --- CONFIGURACIÓN SANTO DOMINGO ---
  const SD_BOUNDS = {
    latMin: 18.35, latMax: 18.60,
    lngMin: -70.10, lngMax: -69.75
  };

  const activeRides = React.useMemo(() =>
    rides.filter(r => r.status === "active"),
    [rides]);

  const isValidNumber = (v) => v !== null && v !== undefined && v !== '' && !isNaN(Number(v)) && isFinite(Number(v)) && Number(v) !== 0;

  const isInSD = (lat, lng) =>
    lat >= SD_BOUNDS.latMin && lat <= SD_BOUNDS.latMax &&
    lng >= SD_BOUNDS.lngMin && lng <= SD_BOUNDS.lngMax;

  // 1. INICIALIZACIÓN DEL MAPA
  useMapSDK(mapRef, (tt) => {
    if (mapInstRef.current) return;

    // Centro por defecto: PUCMM Santo Domingo
    const center = (mapRide && isValidNumber(mapRide.fromLng) && isValidNumber(mapRide.fromLat))
      ? [Number(mapRide.fromLng), Number(mapRide.fromLat)]
      : [-69.9333, 18.4682];

    const map = tt.map({
      key: MAP_CONFIG.tomtomKey,
      container: mapRef.current,
      center: center,
      zoom: 14,
      dragPan: true,
      // Restringir que el usuario se salga de Santo Domingo
      maxBounds: [[-70.15, 18.30], [-69.70, 18.65]]
    });

    mapInstRef.current = map;

    map.on("load", () => {
      setMapReady(true);

      // Marcadores de Campus PUCMM
      PUCMM_LOCATIONS.forEach(loc => {
        const campusEl = document.createElement("div");
        campusEl.className = "relative flex items-center justify-center cursor-pointer group";
        campusEl.innerHTML = `
          <div class="relative w-10 h-10 bg-white dark:bg-slate-800 rounded-xl border-4 border-navy dark:border-gold shadow-lg flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 bg-gold/10"></div>
            <img src="https://i.postimg.cc/zXGbj4g9/Whats-App-Image-2026-03-09-at-5-27-37-PM.jpg" class="w-full h-full object-cover" />
          </div>
        `;
        new tt.Marker({ element: campusEl }).setLngLat([loc.lng, loc.lat]).addTo(map);
      });
    });
  });

  // 2. RENDERIZADO DINÁMICO DE RIDES (Escudo Anti-Null)
  useEffect(() => {
    const map = mapInstRef.current;
    if (!map || !mapReady) return;

    // Limpieza profunda de memoria
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    routesRef.current.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    routesRef.current = [];

    activeRides.forEach(ride => {
      // Conversión forzada a números
      const fLat = parseFloat(ride.fromLat);
      const fLng = parseFloat(ride.fromLng);
      const tLat = parseFloat(ride.toLat);
      const tLng = parseFloat(ride.toLng);

      // FILTRO MAESTRO: Ignorar si los datos están mal o fuera de Santo Domingo
      if (!isValidNumber(fLat) || !isValidNumber(fLng) || !isInSD(fLat, fLng)) return;
      if (!isValidNumber(tLat) || !isValidNumber(tLng) || !isInSD(tLat, tLng)) return;

      try {
        // Elemento visual del marcador de origen (Conductor esperando)
        const originEl = document.createElement("div");
        originEl.className = "flex items-center justify-center cursor-pointer";
        originEl.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-orange-500/30 rounded-full animate-ping"></div>
            <div class="relative w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-xl"></div>
          </div>
        `;

        const mOrigin = new tt.Marker({ element: originEl })
          .setLngLat([fLng, fLat])
          .addTo(map);

        originEl.addEventListener('click', () => {
          map.flyTo({ center: [fLng, fLat], zoom: 16, duration: 1000 });
          setSelectedRide(ride);
          setIsSheetOpen(true);
        });
        markersRef.current.push(mOrigin);

        // Marcador Destino (Punto Azul)
        const destEl = document.createElement("div");
        destEl.className = "w-4 h-4 bg-navy rounded-full border-2 border-white shadow-md";
        const mDest = new tt.Marker({ element: destEl })
          .setLngLat([tLng, tLat])
          .addTo(map);
        markersRef.current.push(mDest);

        // Dibujar línea punteada entre origen y destino
        const routeId = `route-${ride.id}`;
        map.addSource(routeId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: { type: "LineString", coordinates: [[fLng, fLat], [tLng, tLat]] }
          }
        });
        map.addLayer({
          id: routeId,
          type: "line",
          source: routeId,
          paint: { "line-color": "#0033A0", "line-width": 3, "line-dasharray": [2, 1], "line-opacity": 0.5 }
        });
        routesRef.current.push(routeId);

      } catch (err) {
        console.error("Error en renderizado TomTom:", err);
      }
    });
  }, [activeRides, mapReady]);

  // 3. CLEANUP TOTAL
  useEffect(() => {
    return () => {
      if (mapInstRef.current) {
        mapInstRef.current.remove(); // Vital para evitar errores de WebGL
        mapInstRef.current = null;
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col md:relative md:h-[calc(100vh-120px)] md:rounded-3xl md:overflow-hidden md:mt-4">
      {/* Botón Volver y Contador */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none md:hidden">
        <button
          onClick={() => { setView("search"); setMapRide(null); }}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 pointer-events-auto active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="bg-navy px-4 py-2 rounded-2xl text-white font-black text-[10px] shadow-xl pointer-events-auto uppercase tracking-widest">
          {activeRides.length} VIAJES EN SD
        </div>
      </div>

      {/* Mapa Container */}
      <div className="flex-1 relative bg-slate-100">
        <div ref={mapRef} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Detalles del Viaje Seleccionado */}
      {selectedRide && isSheetOpen && (
        <BottomSheet onClose={() => setIsSheetOpen(false)}>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                {selectedRide.driverName.charAt(0)}
              </div>
              <div>
                <h3 className="font-black text-navy text-lg leading-tight">{selectedRide.driverName}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destino: {selectedRide.destinationName}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Precio</p>
                <p className="text-xl font-black text-green-600">RD$ {selectedRide.price}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Btn
                onClick={() => {
                  bookRide(selectedRide.id);
                  setIsSheetOpen(false);
                }}
                className="flex-1 h-14 bg-navy font-black rounded-2xl shadow-lg"
              >
                RESERVAR ASIENTO
              </Btn>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}