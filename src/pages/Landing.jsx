import React from "react";
import { BackgroundCarousel } from "../components/layout/BackgroundCarousel";

export function Landing({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans bg-navy">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80')" }} 
      />
      <div className="absolute inset-0 z-0 bg-[#0A2342]/80 dark:bg-[#0f172a]/90 backdrop-blur-[2px]"></div>

      <div className="fade-up w-full max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-5 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gold/20 blur-2xl group-hover:bg-gold/30 transition-all duration-700 rounded-full" />
              <img 
                src="https://i.postimg.cc/zXGbj4g9/Whats-App-Image-2026-03-09-at-5-27-37-PM.jpg" 
                alt="PUCMMCAR Logo" 
                className="w-20 h-20 rounded-2xl object-cover shadow-2xl relative z-10 border border-white/10"
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-6xl font-black tracking-tighter text-white drop-shadow-2xl italic leading-none">PUCMM<span className="text-gold">CAR</span></span>
              <div className="w-full h-1 bg-gold mt-1 rounded-full scale-x-100 origin-left" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-black tracking-[0.2em] uppercase mb-4 opacity-90">Comunidad Segura</h1>
          <p className="text-white/60 text-base max-w-lg mx-auto font-medium leading-relaxed">
            La red oficial de movilidad compartida para la comunidad de la <span className="text-gold font-bold">PUCMM</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <button 
            onClick={() => onSelect("student")} 
            className="group relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 text-left transition-all duration-500 hover:border-gold/50 hover:-translate-y-2 hover:bg-white/[0.15] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-gold/30 transition-all duration-700" />
            <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-black/10">
              <svg className="w-8 h-8 text-white group-hover:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 italic tracking-tight group-hover:text-gold transition-colors">Portal Estudiantil</h2>
            <p className="text-white/80 text-sm font-medium leading-relaxed mb-8">Viaja seguro, comparte trayectos y acumula beneficios exclusivos para el campus.</p>
            <div className="flex items-center gap-3 text-gold font-black text-xs tracking-widest uppercase group-hover:gap-5 transition-all">
              Ingresar Ahora 
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>

          <button 
            onClick={() => onSelect("admin")} 
            className="group relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 text-left transition-all duration-500 hover:border-white/40 hover:-translate-y-2 hover:bg-white/[0.15] overflow-hidden"
          >
            <div className="absolute top-6 right-8 bg-white/20 border border-white/30 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Restringido</div>
            <div className="w-16 h-16 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-black/10">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-4 italic tracking-tight">Panel Administrativo</h2>
            <p className="text-white/80 text-sm font-medium leading-relaxed mb-8">Supervisión integral de la movilidad y validación de credenciales institucionales.</p>
            <div className="text-white font-black text-xs tracking-widest uppercase">Acceso Interno</div>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { t: "Verificado", d: "ID Institucional", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { t: "Seguro", d: "Seguimiento GPS", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
            { t: "Comunidad", d: "PUCMM Exclusivo", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
            { t: "Beneficios", d: "Gana Puntos", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V15" }
          ].map((item) => (
            <div key={item.t} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 text-center group hover:bg-white/[0.05] transition-all">
              <div className="text-gold mb-4 flex justify-center group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              </div>
              <p className="font-black text-white text-xs uppercase tracking-widest mb-1">{item.t}</p>
              <p className="text-white/40 text-[10px] font-bold uppercase">{item.d}</p>
            </div>
          ))}
        </div>

        <footer className="text-center text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-20 pt-8 border-t border-white/5">
          © {new Date().getFullYear()} Pontificia Universidad Católica Madre y Maestra · Santo Domingo - Santiago
        </footer>
      </div>
    </div>
  );
}
