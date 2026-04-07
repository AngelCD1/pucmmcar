import React, { useState } from "react";
import * as Icons from "lucide-react";
import { MEDAL_CATALOG } from "../../utils/srmiUtils";

export function MedalGrid({ user }) {
  // To keep Tooltip logic simple without complex external libraries
  const [hovered, setHovered] = useState(null);

  const stats = {
    rides: user?.rides || 0,
    totalKm: user?.totalKm || 0,
    rating: user?.rating || 0,
    cancelledRides: user?.cancelledRides || 0,
    lastWeekRides: user?.lastWeekRides || 0,
    streak: user?.streak || 0,
  };

  return (
    <div className="bg-slate-950 p-6 md:p-8 rounded-[2.5rem] border border-slate-800 relative z-0">
      <h3 className="text-white font-black text-lg italic tracking-tighter mb-6 flex items-center gap-2">
        <Icons.Award className="text-gold" size={20} />
        Vitrina de Medallas
      </h3>

      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {MEDAL_CATALOG.map((medal) => {
          const isUnlocked = medal.condition(stats);
          const IconComponent = Icons[medal.icon];

          return (
            <div 
              key={medal.id}
              className="relative group flex justify-center"
              onMouseEnter={() => setHovered(medal.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className={`
                flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300
                ${isUnlocked 
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-gold/50 shadow-[0_0_15px_rgba(255,209,0,0.2)] hover:scale-110 hover:-translate-y-1' 
                  : 'bg-slate-900 border-2 border-slate-800 opacity-50 grayscale hover:opacity-80'
                }
              `}>
                {IconComponent && (
                  <IconComponent 
                    size={28} 
                    className={isUnlocked ? 'text-gold fill-gold/20' : 'text-slate-600'} 
                  />
                )}
              </div>

              {/* Tooltip */}
              {hovered === medal.id && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-slate-800 border border-slate-700 text-white rounded-xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{medal.type}</div>
                  <div className="font-black text-sm mb-1">{medal.name}</div>
                  <div className="text-xs text-slate-300 font-medium">{medal.req}</div>
                  {isUnlocked && (
                    <div className="mt-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                      <Icons.CheckCircle2 size={12} /> Desbloqueada
                    </div>
                  )}
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
