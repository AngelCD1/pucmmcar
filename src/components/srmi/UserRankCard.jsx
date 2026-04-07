import React from "react";
import { Avatar } from "../common/Avatar";
import { calculateRank } from "../../utils/srmiUtils";

export function UserRankCard({ user, onPhotoUpload }) {
  const points = user?.puntos || user?.points || 0; // fallback if points is not updated
  const rank = calculateRank(points);
  const co2 = ((user?.totalKm || 0) * 0.2).toFixed(1); // 0.2kg roughly per km
  const isRetador = rank.id === "retador";

  return (
    <div className={`relative overflow-hidden bg-slate-950 rounded-[2.5rem] p-8 border border-slate-800 ${rank.glow}`}>
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-20 -mt-20 opacity-20 bg-current ${rank.color}`} />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        
        {/* Avatar with Dynamic Border */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-full border-4 ${rank.border} blur-sm opacity-50`}></div>
          <div className={`relative rounded-full border-4 ${rank.border} bg-slate-900 p-1`}>
            <Avatar user={user} size={110} editable={true} onUpload={onPhotoUpload} />
          </div>
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border ${rank.border} px-3 py-1 rounded-full flex items-center justify-center`}>
             <span className="text-sm">{rank.icon}</span>
          </div>
        </div>

        {/* User Stats */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1">{user?.name}</h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 justify-center md:justify-start">
            <span className={`text-lg font-black tracking-widest uppercase ${rank.color} ${isRetador ? 'animate-pulse' : ''}`}>
              {rank.fullName}
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {points} PM Acumulados
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-sm mb-2 relative">
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
              <span>Progreso de Nivel</span>
              <span className={rank.color}>{rank.progressText}</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${rank.border.replace('border-', 'bg-')} transition-all duration-1000 ease-out`} 
                style={{ width: `${rank.percentage}%` }}
              >
                {/* Inner Glow in bar */}
                <div className="w-full h-full bg-white/20"></div>
              </div>
            </div>
          </div>

          {/* Small Stats Row */}
          <div className="flex items-center justify-center md:justify-start gap-6 mt-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <div className="text-white font-black text-xs">{co2} kg</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-black">CO2 Evitado</div>
              </div>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              <div>
                <div className="text-white font-black text-xs">{user?.rating?.toFixed(1) || "5.0"}</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Reputación</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
