import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { REWARDS_PASSENGER, REWARDS_DRIVER, LEVELS, CHALLENGES } from "../constants";
import { Card } from "../components/common/Card";
import { Btn } from "../components/common/Btn";
import { PageHeader } from "../components/layout/PageHeader";

export function Rewards() {
  const { user, redeemReward, isDark } = useApp();
  const [filter, setFilter] = useState(user?.role === "admin" ? "passenger" : (user?.role || "passenger"));

  const userPoints = Number(user?.points ?? 0);
  const currentLevel = [...LEVELS].reverse().find(l => userPoints >= l.minPoints) || LEVELS[0];
  const levelIdx = LEVELS.indexOf(currentLevel);
  const nextLevel = LEVELS[levelIdx + 1] || null;
  const ptsForNext = nextLevel ? Math.max(0, nextLevel.minPoints - userPoints) : 0;
  
  const progressToNext = nextLevel 
    ? Math.min(100, Math.round(((userPoints - currentLevel.minPoints) / Math.max(1, nextLevel.minPoints - currentLevel.minPoints)) * 100)) 
    : 100;

  const list = filter === "driver" ? REWARDS_DRIVER : REWARDS_PASSENGER;

  return (
    <div className="max-w-5xl mx-auto pb-24 font-sans">
      <PageHeader title="Puntos & Recompensas" subtitle="Gana puntos por cada viaje y canjéalos por beneficios" />

      {/* ── SECCIÓN MIS PUNTOS ──────────────────────────────────── */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm border border-gray-100 dark:border-[#2C2C2C] p-6 mb-10 mt-2 max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
           <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-[#2C2C2C] flex items-center justify-center text-3xl shrink-0 border border-slate-100 dark:border-[#333]">
                {currentLevel.icon}
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 dark:text-[#A0AAB2] tracking-widest uppercase mb-1">Mi Nivel Actual</div>
                <div className="text-xl font-black text-[#0A2342] dark:text-[#F3F4F6]">{currentLevel.name}</div>
              </div>
           </div>
           <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-gray-100 dark:border-[#2C2C2C] pt-6 md:pt-0 md:pl-8 min-w-[140px]">
              <div className="text-[10px] font-bold text-gray-500 dark:text-[#A0AAB2] tracking-widest uppercase mb-1">Tus Puntos</div>
              <div className="text-4xl font-black text-[#FDB913] leading-none">{userPoints.toLocaleString()}</div>
           </div>
        </div>
        {nextLevel && (
          <div className="mt-6 pt-5 border-t border-gray-50 dark:border-[#2C2C2C]">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-[#A0AAB2] mb-2 uppercase tracking-wide">
               <span>Progreso a {nextLevel.name}</span>
               <span>Faltan {ptsForNext} pts</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 dark:bg-[#2C2C2C] rounded-full overflow-hidden">
              <div className="h-full bg-[#FDB913] rounded-full transition-all duration-1000" style={{ width: `${progressToNext}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* TABS SENTADOS */}
      <div className="flex justify-center border-b border-gray-200 dark:border-[#2C2C2C] mb-8 max-w-[400px] mx-auto">
        <button 
          onClick={() => setFilter("passenger")}
          className={`flex-1 pb-3 text-[13px] font-bold tracking-wide transition-colors uppercase ${filter === "passenger" ? 'text-[#0A2342] dark:text-[#F3F4F6] border-b-2 border-[#0A2342] dark:border-[#F3F4F6]' : 'text-gray-400 dark:text-[#A0AAB2] hover:text-[#0A2342] dark:hover:text-[#F3F4F6]'}`}
        >
          Pasajero
        </button>
        <button 
          onClick={() => setFilter("driver")}
          className={`flex-1 pb-3 text-[13px] font-bold tracking-wide transition-colors uppercase ${filter === "driver" ? 'text-[#0A2342] dark:text-[#F3F4F6] border-b-2 border-[#0A2342] dark:border-[#F3F4F6]' : 'text-gray-400 dark:text-[#A0AAB2] hover:text-[#0A2342] dark:hover:text-[#F3F4F6]'}`}
        >
          Conductor
        </button>
      </div>

      {/* REWARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {list.map(r => {
          const unlocked = userPoints >= (Number(r.cost) || 0);
          return (
            <div key={r.id} className={`bg-white dark:bg-[#1E1E1E] rounded-lg border flex flex-col items-center text-center p-8 transition-all relative overflow-hidden ${unlocked ? 'border-gray-200 dark:border-[#2C2C2C] shadow-sm hover:shadow-md' : 'border-dashed border-gray-200 dark:border-[#2C2C2C] opacity-80'}`}>
              <div className="text-5xl mb-5">{r.icon}</div>
              <h3 className="font-bold text-[15px] text-[#0A2342] dark:text-white mb-3 leading-tight">{r.name}</h3>
              <p className="text-xs text-gray-500 dark:text-[#A0AAB2] mb-8 flex-1 leading-relaxed">{r.desc}</p>
              
              <div className="w-full mt-auto">
                 <div className="flex justify-center items-center gap-1.5 mb-4">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Costo</span>
                   <span className={`text-sm font-black ${unlocked ? 'text-[#0A2342] dark:text-[#F3F4F6]' : 'text-gray-400 dark:text-gray-500'}`}>{r.cost} pts</span>
                 </div>
                 
                 <button
                   onClick={() => redeemReward(r.id)}
                   disabled={!unlocked}
                   className={`w-full py-3 rounded-lg text-xs font-bold transition-all uppercase tracking-wide ${unlocked ? 'bg-[#FDB913] hover:bg-[#efa902] text-[#0A2342] shadow-sm active:scale-[0.98]' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-400 border-none cursor-not-allowed'}`}
                 >
                   {unlocked ? "Canjear Recompensa" : "Puntos Insuficientes"}
                 </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* EXTRAS */}
      {CHALLENGES.filter(c => c.type === filter).length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-100 dark:border-[#2C2C2C]">
          <h2 className="text-sm font-black text-[#0A2342] dark:text-[#F3F4F6] uppercase tracking-widest mb-6 text-center">Desafíos Especiales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHALLENGES.filter(c => c.type === filter).map(c => (
              <div key={c.id} className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-gray-100 dark:border-[#2C2C2C] p-5 flex items-center gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#FDB913]/10 text-[#FDB913] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.45.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0A2342] dark:text-[#F3F4F6] mb-1">{c.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-[#A0AAB2] mb-3">{c.desc}</p>
                  <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">+ {c.reward}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
