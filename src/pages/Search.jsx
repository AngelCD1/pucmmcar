import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { PUCMM_LOCATIONS } from "../constants";
import { Card } from "../components/common/Card";
import { Btn } from "../components/common/Btn";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import { Avatar } from "../components/common/Avatar";
import { Badge } from "../components/common/Badge";
import { PageHeader } from "../components/layout/PageHeader";

export function Search() {
  const { rides, user, bookRide, setView, setMapRide, startLiveTracking, calcDiscount, isDark, tomtomSearch, tomtomReverseGeocode, getDistance, getPriceEstimate, formatFriendlyDate, createRequest, requests, acceptRequest, cancelRequest } = useApp();
  const [fromQuery, setFromQuery] = useState("");
  const [fromLoc, setFromLoc] = useState(null);
  const [dest, setDest] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sortBy, setSortBy] = useState("srmi");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [bookedIds, setBookedIds] = useState([]);
  const [bookingId, setBookingId] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestMode, setRequestMode] = useState("instant"); // "instant" | "scheduled"
  const [instantReq, setInstantReq] = useState({ from: null, to: PUCMM_LOCATIONS[0], price: 250 });
  const [showReservations, setShowReservations] = useState(true); 
  const [pricingMode, setPricingMode] = useState("rapido");
  const [proposedPrice, setProposedPrice] = useState("");

  const myPendingRequest = requests.find(r => r.passengerId === user?.id && r.status === "pending");

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, [fromQuery, dest, date, sortBy]);

  // GPS Auto-Fetch on mount
  useEffect(() => {
    if (!fromLoc && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const addr = await tomtomReverseGeocode(latitude, longitude);
        setFromQuery(addr);
        const newFromLoc = { name: addr, lat: latitude, lon: longitude };
        setFromLoc(newFromLoc);
        
        const dist = await getDistance(newFromLoc.lat, newFromLoc.lon ?? newFromLoc.lng, instantReq.to.lat, instantReq.to.lon ?? instantReq.to.lng);
        if (dist) {
          const calculatedPrice = Math.round(150 + (dist * 15));
          setInstantReq(p => ({ ...p, price: calculatedPrice }));
        }
      });
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (fromQuery.length > 2 && fromQuery !== fromLoc?.name) {
        const suggest = await tomtomSearch(fromQuery);
        setFromSuggestions(suggest);
      } else {
        setFromSuggestions([]);
      }
    };
    const debounceTimer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(debounceTimer);
  }, [fromQuery, fromLoc?.name, tomtomSearch]);

  const handleFromChange = (val) => {
    setFromQuery(val);
    if (!val) { setFromLoc(null); setFromSuggestions([]); return; }
    
    // Ensure the fromLoc object exists even if a suggestion is not clicked
    setFromLoc({ name: val, lat: 18.486, lon: -69.941 });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const addr = await tomtomReverseGeocode(latitude, longitude);
      setFromQuery(addr);
      const newFromLoc = { name: addr, lat: latitude, lon: longitude };
      setFromLoc(newFromLoc);

      const dist = await getDistance(newFromLoc.lat, newFromLoc.lon ?? newFromLoc.lng, instantReq.to.lat, instantReq.to.lon ?? instantReq.to.lng);
      if (dist) {
        const calculatedPrice = Math.round(150 + (dist * 15));
        setInstantReq(p => ({ ...p, price: calculatedPrice }));
      }
    });
  };

  let filtered = rides.filter(r => {
    if (r.status !== "active") return false;
    if (dest && !r.to.includes(dest)) return false;
    if (date && r.date !== date) return false;
    if (fromQuery && !r.from.toLowerCase().includes(fromQuery.toLowerCase())) return false;
    
    // Safety Gender Filter
    if (user?.role !== "admin" && r.driverId !== user?.id) {
       if (r.gender === "female" && user?.gender !== "female") return false;
       if (r.gender === "male" && user?.gender !== "male") return false;
    }

    return true;
  });

  if (sortBy === "price") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.driverRating - a.driverRating);
  else if (sortBy === "srmi") {
    filtered = [...filtered].sort((a, b) => {
      const scoreA = (a.driverPoints || 0) + (a.driverRating || 0) * 50;
      const scoreB = (b.driverPoints || 0) + (b.driverRating || 0) * 50;
      return scoreB - scoreA;
    });
  }
  else filtered = [...filtered].sort((a, b) => a.time.localeCompare(b.time));

  const handleBook = async (id) => {
    setBookingId(id);
    const result = await bookRide(id);
    if (result?.ok) setBookedIds(p => [...p, id]);
    setBookingId(null);
  };

  const SkeletonCard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3].map(i => (
        <Card key={i} style={{ padding: 24, animation: "pulse 2s infinite" }}>
          <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: isDark ? "#1e293b" : "#f1f5f9" }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: "40%", height: 16, background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 4, marginBottom: 8 }} />
              <div style={{ width: "20%", height: 12, background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ width: "100%", height: 40, background: isDark ? "#1e293b" : "#f1f5f9", borderRadius: 8 }} />
        </Card>
      ))}
    </div>
  );

  const isDriver = user?.role === "driver";
  const myReservations = rides.filter(r => r.driverId === user?.id && r.status === "active" && r.passengers?.length > 0);
  const ini = (name) => name ? name.charAt(0).toUpperCase() : "?";

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-500" style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}>
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-10" style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, ${isDark ? '#FFCC00' : '#003366'} 1px, transparent 0)`, 
          backgroundSize: '32px 32px' 
        }} />
        <div className="absolute top-[20%] right-[10%] w-96 h-96 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] right-[30%] w-64 h-64 bg-gold-dim/20 rounded-full blur-3xl opacity-50" />
        
        {/* Fake dotted lines indicating shared detours in map background */}
        <svg className="absolute inset-0 w-full h-full opacity-20 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100 200 Q 300 50 500 300 T 900 150" fill="transparent" stroke="#0033A0" strokeWidth="3" strokeDasharray="8 8" />
          <path d="M 100 200 Q 200 150 250 180 T 400 220" fill="transparent" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

    <div className="relative z-10 max-w-5xl mx-auto space-y-8 pb-24 md:pb-10 font-sans">
      
      {/* ─── PAGE HEADER ─── */}
      <div className="page-header">
        <div className="ph-left">
          <div className="ph-eyebrow">
            <div className="ph-dot"></div>
            <span className="ph-date">{today} &nbsp;·&nbsp; Campus PUCMM</span>
          </div>
          <div className="ph-title">¡Bienvenido, <span>{user?.name?.split(' ')[0]}</span>!</div>
          <div className="ph-sub flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-gold/10 text-gold px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {user?.role === 'driver' ? 'Conductor verificado' : 'Pasajero verificado'}
            </span>
            <span className="opacity-50 hidden sm:inline">&middot;</span>
            <span className="w-full sm:w-auto mt-1 sm:mt-0">¿Cuál es el plan para hoy?</span>
          </div>
        </div>

        <button className="sos-btn" onClick={() => setView('admin_sos' /* or trigger modal */)}>
          <div className="sos-pulse"></div>
          S.O.S.
        </button>
      </div>

      {myPendingRequest && !isDriver ? (
        <div 
          style={{ 
            background: isDark ? "#1e293b" : "#ffffff", 
            border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}` 
          }}
          className="rounded-[2.5rem] p-10 shadow-2xl text-center py-20 animate-in fade-in zoom-in duration-500"
        >
          <div className="w-32 h-32 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
            <Avatar user={user} size={80} />
          </div>
          <h2 className="text-3xl font-black text-navy dark:text-white mb-3">Buscando conductor...</h2>
          <p className="text-txt-2 font-medium mb-10 max-w-sm mx-auto text-sm">Tu solicitud de viaje fue enviada a los conductores activos. Te notificaremos cuando alguien acepte el viaje.</p>
          <div className="flex justify-center">
            <Btn variant="outline" onClick={() => cancelRequest(myPendingRequest.id)} className="border-danger text-danger hover:bg-danger/5 transition-all font-bold text-sm px-8">
              CANCELAR BÚSQUEDA
            </Btn>
          </div>
        </div>
      ) : (
        <>
          {/* MODE SELECTOR */}
          {!isDriver && (
            <div className={`flex ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'} p-1.5 rounded-[2.5rem] shadow-inner mb-8 mt-2 max-w-md mx-auto relative overflow-hidden border border-transparent dark:border-slate-800`}>
              <button 
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] font-black text-[11px] tracking-[0.15em] transition-all duration-500 z-10 ${requestMode === "instant" ? 'bg-gold text-navy shadow-lg scale-[1.02] dark:bg-gold dark:text-navy' : 'text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white'}`}
                onClick={() => setRequestMode("instant")}
              >
                <div className={`p-1.5 rounded-lg ${requestMode === "instant" ? 'bg-gold/10 dark:bg-navy/10' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <svg className="w-4 h-4 text-gold dark:text-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                SALIDA AHORA
                {requestMode === "instant" && <div className="w-1.5 h-1.5 bg-gold dark:bg-navy rounded-full animate-pulse ml-1" />}
              </button>
              <button 
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[2rem] font-black text-[11px] tracking-[0.15em] transition-all duration-500 z-10 ${requestMode === "scheduled" ? 'bg-navy dark:bg-slate-700 text-white shadow-xl scale-[1.02]' : 'text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white'}`}
                onClick={() => setRequestMode("scheduled")}
              >
                <div className={`p-1.5 rounded-lg ${requestMode === "scheduled" ? 'bg-white/10' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                PROGRAMAR
              </button>
            </div>
          )}

          {isDriver && (
            <div className={`flex ${isDark ? 'bg-slate-800/30' : 'bg-slate-50'} p-1.5 rounded-[2.5rem] shadow-inner mb-8 mt-2 max-w-md mx-auto border border-transparent dark:border-slate-800`}>
              <button 
                className={`flex-1 py-4 rounded-[2rem] font-black text-[11px] tracking-[0.15em] transition-all duration-500 ${showReservations ? 'bg-navy text-white shadow-xl shadow-navy/30' : 'text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white'}`}
                onClick={() => setShowReservations(true)}
              >
                MIS RESERVAS
              </button>
              <button 
                className={`flex-1 py-4 rounded-[2rem] font-black text-[11px] tracking-[0.15em] transition-all duration-500 ${!showReservations ? 'bg-gold text-navy shadow-xl shadow-gold/30' : 'text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white'}`}
                onClick={() => setShowReservations(false)}
              >
                BUSCAR VIAJES
              </button>
            </div>
          )}

      {isDriver && !showReservations && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <div className="relative w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            <span className="text-xs font-black tracking-wider text-green-600 uppercase tracking-widest">Buscando solicitudes en vivo...</span>
          </div>

          <div className="grid gap-4">
            {requests.filter(r => r.status === "pending" && r.passengerId !== user.id).map(req => (
              <div 
                key={req.id} 
                style={{ 
                  background: isDark ? "#1e293b" : "#ffffff", 
                  border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}` 
                }}
                className="group rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Avatar user={{ name: req.passengerName, photo: req.passengerPhoto }} size={56} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-lg">{req.passengerName}</h3>
                        <Badge color="green" className="text-[8px] px-2 py-0.5">Verificado PUCMM</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mt-0.5">
                        <span className="text-gold">★ 4.9</span>
                        <span className="opacity-40">•</span>
                        <span>Estudiante de Ingeniería</span>
                        <span className="opacity-40">•</span>
                        <span>12 Viajes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-pucmm-blue">RD$ {(req.price ?? 0)}</div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400">EFECTIVO</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recoger en</p>
                    <p className="text-sm font-bold truncate">{req.from}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destino</p>
                    <p className="text-sm font-bold truncate text-pucmm-blue">{req.to}</p>
                  </div>
                </div>

                <Btn block onClick={() => acceptRequest(req.id)} className="h-14 text-sm font-black">
                  ACEPTAR SOLICITUD
                </Btn>
              </div>
            ))}

            {requests.filter(r => r.status === "pending" && r.passengerId !== user.id).length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V14a2 2 0 002 2h.5m-15.3 3c.172-1.678 1.408-3 3-3a5.002 5.002 0 015 5M12 2a10 10 0 110 20 10 10 0 010-20z" /></svg>
                </div>
                <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg">No hay solicitudes activas</h3>
                <p className="text-slate-500 font-bold max-w-xs mx-auto mt-1 text-sm">Te avisaremos cuando alguien necesite transporte.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {isDriver && showReservations && (
        <section className="space-y-6">
          <h2 className="text-xs font-black tracking-widest text-slate-400 uppercase">Reservas Confirmadas ({myReservations.length})</h2>
          
          <div className="grid gap-4">
            {myReservations.map(r => (
              <div 
                key={r.id} 
                style={{ 
                  background: isDark ? "#1e293b" : "#ffffff", 
                  border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}` 
                }}
                className="rounded-[2rem] p-6 shadow-xl overflow-hidden relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h3 className="font-black text-lg text-pucmm-blue dark:text-pucmm-blue-light leading-tight">Viaje Programado</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 font-sans">
                      {r.date} &bull; {r.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase font-sans mb-2 inline-block">CONFIRMADO</span>
                    <div className="text-2xl font-black text-pucmm-blue">RD$ {(r.price ?? 0)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Pasajeros:</span>
                  {r.passengers?.map(pId => (
                    <div key={pId} className="flex-shrink-0 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700/50">
                      <div className="w-5 h-5 bg-pucmm-blue rounded-lg flex items-center justify-center text-[10px] text-white font-black italic">
                        {ini(pId)}
                      </div>
                      <span className="text-[10px] font-bold">Reserva</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Btn variant="outline" size="sm" onClick={() => setView("myrides")} className="flex-1">GESTIONAR</Btn>
                  <Btn size="sm" onClick={() => setView("map")} className="flex-1 bg-pucmm-blue">VER MAPA</Btn>
                </div>
              </div>
            ))}

            {myReservations.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h3 className="font-bold text-slate-400 text-sm">Sin reservaciones pendientes</h3>
              </div>
            )}
          </div>
        </section>
      )}

      {(!isDriver) && (
        <section className="space-y-8">
          {/* Main Booking Mode Toggle - Removed redundant toggle here since we moved it up */}

          {requestMode === "instant" ? (
            <div className="mt-8 flex justify-center w-full">
              <div className="bg-white dark:bg-[#1E1E1E] shadow-xl dark:shadow-2xl rounded-[1.5rem] p-6 w-full max-w-md border border-gray-100 dark:border-slate-800 relative">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-lg font-bold text-[#0A2342] dark:text-white">Solicitar Aventón</h2>
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">En Vivo</span>
                </div>

                <div className="relative flex flex-col gap-4 mb-8">
                  {/* Connection line */}
                  <div className="absolute left-[11px] top-[24px] bottom-[24px] w-px border-l-2 border-dashed border-gray-200 dark:border-slate-700 pointer-events-none"></div>

                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 flex items-center justify-center z-10 bg-white dark:bg-slate-900 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0A2342] dark:bg-blue-400" />
                    </div>
                    <div className="flex-1 relative">
                      <input 
                        value={fromQuery} 
                        onChange={e => handleFromChange(e.target.value)} 
                        placeholder="¿Dónde te buscamos?"
                        className="w-full bg-transparent border-b border-gray-200 dark:border-slate-700 px-2 py-3.5 text-sm font-medium focus:border-[#0A2342] dark:focus:border-blue-400 focus:outline-none transition-all dark:text-white text-gray-900"
                      />
                      <button 
                        onClick={useCurrentLocation}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A2342] dark:hover:text-blue-400 transition-colors"
                        title="Usar mi ubicación"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
                      </button>
                      
                      {fromSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#1E1E1E] rounded-md border border-gray-100 dark:border-[#2C2C2C] shadow-lg overflow-hidden py-1">
                          {fromSuggestions.map(s => (
                            <button key={s.lat + s.lon} onClick={async () => { 
                              setFromQuery(s.name); setFromLoc(s); setFromSuggestions([]); 
                              const dist = await getDistance(s.lat, s.lon ?? s.lng, instantReq.to.lat, instantReq.to.lon ?? instantReq.to.lng);
                              if (dist) {
                                const calculatedPrice = Math.round(150 + (dist * 15));
                                setInstantReq(p => ({ ...p, price: calculatedPrice }));
                              }
                            }} className="w-full text-left p-3 hover:bg-[#F9FAFB] dark:hover:bg-[#2C2C2C] transition-colors border-b border-gray-50 dark:border-[#2C2C2C] last:border-0">
                              <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{s.name}</p>
                              <p className="text-xs text-gray-500 truncate">{s.address}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 flex items-center justify-center z-10 bg-white dark:bg-slate-900 relative">
                      <div className="w-2.5 h-2.5 bg-gray-300 dark:bg-slate-600 rounded-sm" />
                    </div>
                    <div className="flex-1 relative">
                      <select 
                        value={instantReq.to.name} 
                        className="w-full bg-transparent border-b border-gray-200 dark:border-slate-700 px-2 py-3.5 pr-10 text-sm font-medium focus:border-[#0A2342] dark:focus:border-blue-400 focus:outline-none transition-all appearance-none dark:text-white text-gray-900"
                        onChange={async e => {
                          const loc = PUCMM_LOCATIONS.find(l => l.name === e.target.value);
                          setInstantReq(p => ({ ...p, to: loc }));
                          if (fromLoc) {
                            const dist = await getDistance(fromLoc.lat, fromLoc.lon ?? fromLoc.lng, loc.lat, loc.lon ?? loc.lng);
                            if (dist) {
                              const calculatedPrice = Math.round(150 + (dist * 15));
                              setInstantReq(p => ({ ...p, price: calculatedPrice }));
                            }
                          }
                        }}
                      >
                        {PUCMM_LOCATIONS.map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INTELLIGENT PRICING OPTIONS */}
                <div className="mb-6 space-y-3 mt-4 border-t border-gray-100 dark:border-[#2C2C2C] pt-6">
                  
                  {/* Modo Ahorro */}
                  <button 
                    onClick={() => setPricingMode("ahorro")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${pricingMode === "ahorro" ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#2C2C2C] hover:bg-gray-50 dark:hover:bg-[#252525]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${pricingMode === "ahorro" ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-gray-400'}`}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      </div>
                      <div>
                        <div className="font-extrabold text-[15px] text-gray-900 dark:text-gray-100">Viaje Compartido</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Mayor espera &middot; ETA: 8 min</div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="font-black text-lg text-gray-900 dark:text-white">RD$ {Math.round((instantReq.price || 250) * 0.7)}</div>
                      <div className="text-[10px] font-black text-navy bg-gold dark:bg-gold dark:text-navy uppercase tracking-widest px-2 py-1 rounded-md mt-1">Ahorro RD$ {Math.round((instantReq.price || 250) * 0.3)}</div>
                    </div>
                  </button>

                  {/* Modo Rápido */}
                  <button 
                    onClick={() => setPricingMode("rapido")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${pricingMode === "rapido" ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#2C2C2C] hover:bg-gray-50 dark:hover:bg-[#252525]'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${pricingMode === "rapido" ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-gray-400'}`}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div>
                        <div className="font-extrabold text-[15px] text-gray-900 dark:text-gray-100">Viaje Directo</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Menor espera &middot; ETA: 3 min</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-lg text-gray-900 dark:text-white">RD$ {instantReq.price || 250}</div>
                    </div>
                  </button>

                  {/* Negociación */}
                  <div className={`w-full flex flex-col p-4 rounded-xl border-2 transition-all ${pricingMode === "negociacion" ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#2C2C2C] hover:bg-gray-50 dark:hover:bg-[#252525] cursor-pointer'}`} onClick={() => { if(pricingMode !== "negociacion") setPricingMode("negociacion"); }}>
                    <div className="flex items-center justify-between pointer-events-none w-full">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${pricingMode === "negociacion" ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-gray-400'}`}>
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        </div>
                        <div>
                          <div className="font-extrabold text-[15px] text-gray-900 dark:text-gray-100">Propón tu Precio</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Tú decides qué ofertar</div>
                        </div>
                      </div>
                      {pricingMode !== "negociacion" && (
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-500">Sugerido</div>
                          <div className="text-lg font-black text-gray-900 dark:text-gray-100">~ RD$ {Math.round((instantReq.price || 250) * 0.8)}</div>
                        </div>
                      )}
                    </div>
                    
                    {pricingMode === "negociacion" && (
                      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-500/30 flex items-center gap-3 pointer-events-auto">
                        <span className="font-black text-gray-500 dark:text-gray-400 text-lg">RD$</span>
                        <input 
                          type="number" 
                          min="0"
                          value={proposedPrice}
                          onChange={(e) => {
                             const val = e.target.value;
                             if (Number(val) < 0) return;
                             setProposedPrice(val);
                          }}
                          placeholder={Math.round((instantReq.price || 250) * 0.8).toString()}
                          className="flex-1 min-w-0 bg-white dark:bg-[#1E1E1E] border border-blue-200 dark:border-blue-500/50 rounded-lg px-4 py-3 text-xl font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-300 dark:placeholder-gray-600"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  disabled={isRequesting}
                  className={`w-full ${isRequesting ? 'bg-gray-400' : 'bg-[#FDB913] hover:bg-[#efa902]'} text-[#0A2342] font-black text-[15px] py-4 rounded-xl transition-all shadow-md active:scale-[0.98] outline-none border-none tracking-wide flex items-center justify-center gap-2`}
                  onClick={async () => {
                    if (isRequesting) return;
                    setIsRequesting(true);
                    try {
                      const finalLoc = fromLoc || { name: fromQuery || "Punto de Encuentro", lat: 18.486, lon: -69.941 };
                      let finalPrice = instantReq.price || 250;
                      if (pricingMode === "ahorro") finalPrice = Math.round(finalPrice * 0.7);
                      if (pricingMode === "negociacion") finalPrice = Math.max(0, Number(proposedPrice) || Math.round(finalPrice * 0.8));
                      
                      await createRequest({ ...instantReq, from: finalLoc, price: finalPrice, pricingMode });
                    } finally {
                      setIsRequesting(false);
                    }
                  }}
                >
                  {isRequesting ? 'Procesando...' : 'Confirmar Viaje'}
                  {!isRequesting && <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
            <div className="space-y-8">
              {/* Scheduled Filters */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-navy/10 text-navy rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <h3 className="font-black text-navy dark:text-blue-100 tracking-tight">Filtrar Búsqueda</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Partida</p>
                    <div className="relative group">
                      <input 
                        value={fromQuery} 
                        onChange={e => handleFromChange(e.target.value)} 
                        placeholder="Ej. Piantini..." 
                        className={`w-full h-14 border-2 border-transparent rounded-2xl px-5 text-sm font-bold outline-none transition-all
                          ${isDark ? 'bg-slate-800 text-white focus:border-white/10' : 'bg-slate-50 text-navy focus:border-navy/20'}`}
                      />
                      {fromSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden py-1">
                          {fromSuggestions.map(s => (
                            <button key={s.lat + s.lon} onClick={() => { setFromQuery(s.name); setFromLoc(s); setFromSuggestions([]); }} className="w-full text-left p-4 hover:bg-navy/5 transition-colors border-b border-slate-100 dark:border-white/5 last:border-0">
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{s.name}</p>
                              <p className="text-[10px] text-slate-400 truncate mt-1">{s.address}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Campus</p>
                    <div className="relative">
                      <select 
                        value={dest} 
                        onChange={e => setDest(e.target.value)} 
                        className={`w-full h-14 border-2 border-transparent rounded-2xl px-5 pr-10 text-sm font-bold outline-none transition-all appearance-none cursor-pointer
                          ${isDark ? 'bg-slate-800 text-white focus:border-white/10' : 'bg-slate-50 text-navy focus:border-navy/20'}`}
                      >
                        <option value="" className={isDark ? "bg-slate-900" : "bg-white"}>Cualquier campus</option>
                        {PUCMM_LOCATIONS.map(d => <option key={d.name} value={d.name} className={isDark ? "bg-slate-900" : "bg-white"}>{d.name}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Fecha</p>
                    <input 
                      type="date" 
                      value={date} 
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setDate(e.target.value)} 
                      className={`w-full h-14 border-2 border-transparent rounded-2xl px-5 text-sm font-bold outline-none transition-all
                        ${isDark ? 'bg-slate-800 text-white focus:border-white/10' : 'bg-slate-50 text-navy focus:border-navy/20'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Rides List */}
              <div className="grid gap-6">
                {isLoading ? <SkeletonCard /> : filtered.map(r => {
                  const isBooked = r.passengers.includes(user?.id) || bookedIds.includes(r.id);
                  const isOwn = r.driverId === user?.id;
                  const { pct } = calcDiscount(r);
                  const discounted = Math.round((r.price ?? 0) * (1 - pct / 100));

                  return (
                    <div 
                      key={r.id} 
                      style={{ 
                        background: isDark ? "#1e293b" : "#ffffff", 
                        border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}` 
                      }}
                      className="ride-card"
                    >
                      <div className="rc-top-bar" style={{ background: isOwn ? 'var(--navy-2)' : undefined }}></div>
                      <div className="rc-body">
                        <div className="rc-header mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar user={{ name: r.driverName, photo: r.driverPhoto }} size={56} />
                            <div>
                              <div className="rc-title text-base">{r.driverName}</div>
                              <div className="flex items-center gap-1.5 text-gold text-xs font-bold">
                                <span>★ {r.driverRating}</span>
                                <span className="text-txt-3 font-medium ml-1">• {r.vehicle}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="price-num text-2xl">
                               <span className="price-currency text-xs mt-1">RD$</span>
                               {discounted ?? 0}
                             </div>
                             {pct > 0 && <span className="text-[9px] font-black text-success uppercase">-{pct}% OFF</span>}
                          </div>
                        </div>

                        <div className="rc-fields mb-6">
                           <div className="bg-surface rounded-2xl p-4 border border-border">
                              <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center gap-1 mt-1">
                                  <div className="w-2 h-2 rounded-full bg-navy-3" />
                                  <div className="w-px h-6 bg-border-2 dashed" />
                                  <div className="w-2 h-2 rounded-sm bg-gold" />
                                </div>
                                <div className="flex-1 space-y-4">
                                  <div>
                                    <p className="field-lbl text-[8px] mb-0.5">Recogida</p>
                                    <p className="font-bold text-xs line-clamp-2 whitespace-normal pr-2">{r.from}</p>
                                  </div>
                                  <div>
                                    <p className="field-lbl text-[8px] mb-0.5">Destino</p>
                                    <p className="font-bold text-xs line-clamp-2 whitespace-normal text-navy-3 pr-2">{r.to}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Preferences Chemistry Badges */}
                              {((r.preferences && r.preferences.length > 0) || r.gender !== "both") && (
                                <div className="mt-4 pt-3 border-t border-border-2 flex flex-wrap gap-2">
                                  {r.gender === "female" && (
                                    <span className="flex items-center gap-1.5 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 px-2 py-1 rounded shadow-sm text-[9px] font-black uppercase tracking-wider">
                                       🌸 Solo Chicas
                                    </span>
                                  )}
                                  {r.gender === "male" && (
                                    <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded shadow-sm text-[9px] font-black uppercase tracking-wider">
                                       👨 Solo Chicos
                                    </span>
                                  )}
                                  {r.preferences?.includes("ac") && <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded shadow-sm text-[9px] font-black uppercase tracking-wider">❄️ A/C Full</span>}
                                  {r.preferences?.includes("music") && <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded shadow-sm text-[9px] font-black uppercase tracking-wider">🎵 Música</span>}
                                  {r.preferences?.includes("talk") && <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded shadow-sm text-[9px] font-black uppercase tracking-wider">🗣️ Sociable</span>}
                                  {r.preferences?.includes("quiet") && <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded shadow-sm text-[9px] font-black uppercase tracking-wider">🤫 Viaje Callado</span>}
                                  {r.preferences?.includes("nosmoke") && <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded shadow-sm text-[9px] font-black uppercase tracking-wider">🚭 Sin Fumar</span>}
                                </div>
                              )}
                           </div>
                        </div>

                        <div className="rc-foot border-t-0 pt-2 pb-2 px-2">
                           <div className="flex items-center gap-4 text-[10px] font-bold text-txt-3 uppercase tracking-wider">
                              <span className="flex items-center gap-1.5">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {r.time}
                              </span>
                              <span className={`flex items-center gap-1.5 ${r.seatsLeft > 0 ? 'text-success' : 'text-danger'}`}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                {(r.seatsLeft ?? 0)} ASIENTOS
                              </span>
                           </div>
                           <div className="flex gap-2">
                             <button onClick={() => { setMapRide(r); setView("map"); }} className="p-2.5 rounded-xl border border-border text-txt-2 hover:bg-surface transition-all">
                               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                             </button>
                             {isOwn ? (
                               <button disabled className="px-6 py-2.5 rounded-xl bg-surface-2 text-txt-3 text-xs font-bold cursor-not-allowed">MI VIAJE</button>
                             ) : isBooked ? (
                               <button onClick={() => setView('myrides')} className="px-6 py-2.5 rounded-xl bg-success text-white text-xs font-bold shadow-lg shadow-success/20">RESERVADO</button>
                             ) : (
                               <button onClick={() => handleBook(r.id)} disabled={bookingId === r.id} className="px-6 py-2.5 rounded-xl bg-navy text-white text-xs font-bold shadow-lg shadow-navy/20 active:scale-95 transition-all">RESERVAR</button>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 && !isLoading && (
                <div 
                  style={{ 
                    background: isDark ? "#1e293b" : "#ffffff", 
                    border: `2px dashed ${isDark ? "#334155" : "#e2e8f0"}` 
                  }}
                  className="py-16 text-center rounded-[22px]"
                >
                  <h3 className="text-lg font-bold text-txt-2 mb-2">Terreno Despejado 🌿</h3>
                  <p className="text-sm text-txt-3 mb-8">Nadie ha publicado rutas hacia acá aún. ¡Sé el primero, publica una solicitud y gana puntos SRMI de Ecomovilidad!</p>
                  <button 
                    onClick={() => setView("createride")}
                    className="px-8 py-3 bg-[#FDB913] text-[#0A2342] rounded-xl font-bold shadow-lg shadow-[#FDB913]/20 transition-all hover:scale-105"
                  >
                    Publicar Solicitud y Ganar PM
                  </button>
                </div>
              )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* STATS ROW */}
          <div className="stats-row mt-12">
            <div className="stat-card gold-accent">
              <div className="stat-ic gold-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>
              </div>
              <div className="stat-num">{rides.length}</div>
              <div className="stat-lbl">Viajes Activos</div>
              <div className="stat-sub gold">Campus Santiago &middot; CSTA</div>
            </div>
            
            <div className="stat-card blue-accent">
              <div className="stat-ic blue-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div className="stat-num">{user?.points ?? 0}</div>
              <div className="stat-lbl">Tus Puntos</div>
              <div className="stat-sub blue">Nivel Bronce</div>
            </div>

            <div className="stat-card green-accent">
              <div className="stat-ic green-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div className="stat-num">RD$ 450</div>
              <div className="stat-lbl">Ahorro Promedio</div>
              <div className="stat-sub green">Por semana</div>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  );
}
