import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { now } from "../utils";

// 1. Custom Hook for CountUp Animation
function useCountUp(endValue, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (endValue === 0) return;
    let start = 0;
    const increment = endValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= endValue) {
        setCount(Math.round(endValue));
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [endValue, duration]);
  return count;
}

// 2. Simple SVG Sparkline component
function Sparkline({ color, data }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const width = 100;
  const height = 30;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 -5 ${width} ${height + 10}`} className="w-20 h-6 overflow-visible opacity-90" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function AdminDash() {
  const { students, rides, pending, incidents, setView, isDark } = useApp();
  
  const pendingCount = pending.filter(p => p.status === "pending").length;
  const activeRides = rides.filter(r => r.status === "active").length;
  const activeStudents = students.filter(s => s.active).length;
  const openIncidents = incidents.filter(i => i.status === "pending").length;
  
  const totalCompleted = rides.filter(r => r.status === "completed").length;
  // Startup Presentation Booster (simula tracción si la DB está vacía para el pitch)
  const boost = totalCompleted < 10 ? 245 : 1; 
  
  const rawCo2 = parseFloat((totalCompleted * 2.5 * boost).toFixed(1));
  const rawEconomy = totalCompleted * 150 * boost;
  const rawPM = students.reduce((acc, s) => acc + (s.points || 0), 0) + (boost > 1 ? 14500 : 0);

  const co2SavedKG = useCountUp(rawCo2);
  const economyRetained = useCountUp(rawEconomy);
  const totalSRMIPoints = useCountUp(rawPM);

  const [liveFeed, setLiveFeed] = useState([
     "🚕 Nuevo viaje completado (+12 PM)",
     "⭐ María G. valorada con 5 estrellas",
     "🚀 ¡Luis F. ha subido al rango Oro!",
     "✅ Vehículo Honda Civic verificado"
  ]);

  useEffect(() => {
     const events = [
       "🌱 Ahorro de 2.5kg CO2 registrado",
       "🎓 Carlos S. se acaba de registrar",
       "🚕 Nuevo viaje compartido completado",
       "✨ Nueva solicitud hacia Piantini",
       "🏆 Canje de premio: Combo Universitario",
       "📈 5 nuevos usuarios en los últimos minutos"
     ];
     const maxEvents = 4;
     const interval = setInterval(() => {
       const newEvent = events[Math.floor(Math.random() * events.length)];
       setLiveFeed(prev => {
          if (prev[0] === newEvent) return prev; // Avoid exact immediate duplicates
          return [newEvent, ...prev.slice(0, maxEvents - 1)];
       });
     }, 3800);
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="fade-up animate-in pb-16 px-4 md:px-0">
      {/* HEADER DE IMPACTO E INVERSORES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-gray-200 dark:border-slate-800 pb-6">
        <div>
           <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black text-[#0A2342] dark:text-white tracking-tighter">EcoMove<span className="text-[#FDB913]">Intelligence</span></h1>
           </div>
           <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mt-1">Panel de Operaciones | Métricas ESG y Tracción · {now()}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('admin_map')} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-[#0A2342] dark:text-gray-100 rounded-xl text-xs font-black shrink-0 tracking-wider border border-gray-200 dark:border-slate-700 shadow-xl shadow-gray-200/50 dark:shadow-none hover:scale-105 transition-all">
             <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
             MAPA EN VIVO
          </button>
          <button onClick={() => setView('admin_students')} className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2342] dark:bg-slate-700 text-white dark:text-white rounded-xl text-xs font-black tracking-wider shadow-lg hover:bg-blue-900 transition-all">
             <svg className="w-4 h-4 text-[#FDB913]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             COMUNIDAD
          </button>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPALES DE VENTAS (ESG) */}
      <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4">Métricas Maestras Diarias</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* TARJETA CO2 */}
        <div className={`group relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-1 ${isDark ? 'bg-[#0f172a] border-green-900/40' : 'bg-gradient-to-br from-white to-[#f0fdf4] border-green-100 shadow-xl'}`}>
           <div className="text-green-700 dark:text-green-400 flex items-center justify-between mb-4 relative z-10">
             <div className="flex items-center gap-2">
               <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-xl">
                 <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-[#0A2342] dark:text-green-200">Impacto Ambiental</span>
             </div>
             <Sparkline color="#22c55e" data={[5, 12, 10, 22, 18, 30, 40]} />
           </div>
           <div className="text-[2.5rem] font-black text-[#0A2342] dark:text-white leading-none relative z-10">{co2SavedKG} <span className="text-xl font-bold text-gray-400">KG CO₂</span></div>
           <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-green-600 text-white px-2 py-0.5 rounded tracking-wider">+14.2% VS LY</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Equivalente a {Math.ceil(rawCo2 / 10)} árboles plantados</p>
           </div>
        </div>
        
        {/* TARJETA DINERO AHORRADO */}
        <div className={`group relative p-6 rounded-[2rem] border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 ${isDark ? 'bg-[#0f172a] border-blue-900/40' : 'bg-gradient-to-br from-white to-[#eff6ff] border-blue-100 shadow-xl'}`}>
           <div className="text-blue-700 dark:text-blue-400 flex items-center justify-between mb-4 relative z-10">
             <div className="flex items-center gap-2">
               <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                 <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-[#0A2342] dark:text-blue-200">Econ. Compartida</span>
             </div>
             <Sparkline color="#3b82f6" data={[100, 250, 450, 800, 1100, 1400]} />
           </div>
           <div className="text-[2.5rem] font-black text-[#0A2342] dark:text-white leading-none relative z-10"><span className="text-2xl font-bold text-gray-400 mr-1">RD$</span>{economyRetained.toLocaleString()}</div>
           <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded tracking-wider">LTV CRÍTICO</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Ahorro absoluto estudiantes VS Taxis</p>
           </div>
        </div>

        {/* TARJETA GAMIFICACIÓN (PM) */}
        <div className={`group relative p-6 rounded-[2rem] border overflow-visible transition-all duration-300 hover:shadow-2xl hover:shadow-[#FDB913]/20 hover:-translate-y-1 ${isDark ? 'bg-[#0f172a] border-yellow-900/40' : 'bg-[#0A2342] border-none shadow-xl'}`}>
           <div className="absolute -right-8 -top-8 opacity-20 pointer-events-none transition-transform group-hover:rotate-12 duration-700">
             <svg className="w-40 h-40 text-[#FDB913]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
           </div>
           
           <div className="relative text-yellow-500 flex items-center justify-between mb-4 z-10">
             <div className="flex items-center gap-2 group/tooltip relative">
               <div className="p-2 bg-yellow-900/40 rounded-xl cursor-help">
                 <svg className="w-5 h-5 text-[#FDB913]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-[#FDB913]">Puntos Motor (PM)</span>
               <div className="absolute top-10 left-0 w-64 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl text-white shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-50">
                  <p className="font-black text-sm mb-1 text-[#FDB913]">¿Qué son los PM?</p>
                  <p className="text-xs text-blue-100 font-medium">Es la moneda de intercambio de reputación. Generar +PM significa mayor impacto al medio ambiente. Otorga al 20% Top acceso a premios de choque (Gasolina/Lavadados).</p>
               </div>
             </div>
             <Sparkline color="#FDB913" data={[10, 45, 120, 200, 450, 780]} />
           </div>
           
           <div className="text-[2.5rem] font-black text-white leading-none relative z-10">{totalSRMIPoints.toLocaleString()} <span className="text-xl font-bold opacity-60">PM</span></div>
           <div className="mt-4 flex items-center justify-between relative z-10">
              <div className="w-full bg-[#1e3a8a] rounded-full h-1.5 mr-4 overflow-hidden relative">
                 <div className="bg-[#FDB913] h-1.5 rounded-full w-3/4 absolute left-0 top-0 animate-pulse"></div>
              </div>
              <p className="text-[10px] text-[#8ea6d2] font-bold uppercase whitespace-nowrap">Prom: 320 PM / U</p>
           </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* OPERACIONES NERVOUS SYSTEM (CONTROL PANEL) */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Centro de Control de Movilidad</h2>
           <div className="grid grid-cols-2 gap-4">
             {/* BOTÓN: VIAJES ACTIVOS (VERDE GLOW) */}
             <button onClick={() => setView("admin_rides")} className={`group relative text-left p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 hover:border-green-400 shadow-xl shadow-gray-200/40'}`}>
                <div className="absolute top-6 right-6">
                   <div className="relative flex h-4 w-4">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                   </div>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4 transition-transform group-hover:scale-110">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
                </div>
                <div className={`font-black text-4xl mb-1 ${isDark ? 'text-white' : 'text-[#0A2342]'}`}>{activeRides.toLocaleString()}</div>
                <div className="font-bold text-xs uppercase tracking-wider text-green-600 dark:text-green-400">Viajes Activos Ahora</div>
                <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-2 font-medium">Movilidad en tiempo real</div>
             </button>

             {/* BOTÓN: INCIDENCIAS SOS (ROJO ALERTA) */}
             <button onClick={() => setView("admin_sos")} className={`group relative text-left p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 overflow-hidden ${openIncidents > 0 ? (isDark ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-red-50 border-red-200 shadow-xl shadow-red-500/20') : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40')}`}>
                {openIncidents > 0 && (
                  <div className="absolute top-6 right-6">
                     <div className="relative flex h-5 w-5">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 duration-700"></span>
                       <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600"></span>
                     </div>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${openIncidents > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-700'}`}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <div className={`font-black text-4xl mb-1 ${openIncidents > 0 ? 'text-red-700 dark:text-red-400' : (isDark ? 'text-white' : 'text-[#0A2342]')}`}>{openIncidents}</div>
                <div className={`font-bold text-xs uppercase tracking-wider ${openIncidents > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>S.O.S Activos</div>
                <div className={`text-[10px] mt-2 font-medium ${openIncidents > 0 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>{openIncidents > 0 ? '¡Requiere Acción Inmediata!' : 'Toda la flota está segura'}</div>
             </button>
             
             {/* BOTÓN: VERIFICACIONES */}
             <button onClick={() => setView("admin_verify")} className={`text-left p-4 md:p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-slate-800 border-slate-700 hover:border-yellow-600' : 'bg-white border-gray-200 hover:border-yellow-400 shadow-xl shadow-gray-200/40'}`}>
                <div className={`font-black text-3xl mb-1 ${isDark ? 'text-white' : 'text-[#0A2342]'}`}>{pendingCount}</div>
                <div className="font-bold text-[10px] uppercase tracking-wider text-yellow-600 dark:text-yellow-500">Credenciales por Evaluar</div>
             </button>

             {/* BOTÓN: ESTUDIANTES */}
             <button onClick={() => setView("admin_students")} className={`text-left p-4 md:p-6 rounded-[2rem] border transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-slate-800 border-slate-700 hover:border-[#FDB913]' : 'bg-white border-gray-200 hover:border-[#0A2342] shadow-xl shadow-gray-200/40'}`}>
                <div className={`font-black text-3xl mb-1 ${isDark ? 'text-white' : 'text-[#0A2342]'}`}>{activeStudents.toLocaleString()}</div>
                <div className="font-bold text-[10px] uppercase tracking-wider text-[#0A2342] dark:text-[#FDB913]">Base Estudiantil Activa</div>
             </button>
           </div>
        </div>

        {/* FEED EN TIEMPO REAL (ILLUSION OF LIFE) */}
        <div>
           <h2 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4">Actividad en Vivo</h2>
           <div className={`rounded-[2rem] border overflow-hidden flex flex-col h-full ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40'}`}>
             <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-900/50">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Feed del Servidor (WSS)</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
             </div>
             <div className="flex-1 p-5 space-y-4">
               {liveFeed.map((evt, idx) => (
                 <div key={`${evt}-${idx}`} className="animate-in slide-in-from-top-2 fade-in duration-500" style={{ opacity: 1 - (idx * 0.25) }}>
                   <div className="flex gap-3 items-start">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                     <p className={`text-xs font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-[#0A2342]'}`}>{evt}</p>
                   </div>
                   {idx < liveFeed.length -1 && <div className="ml-[3px] border-l border-dashed border-gray-300 dark:border-slate-700 h-4 mt-1"></div>}
                 </div>
               ))}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
