import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { PageHeader } from "../components/layout/PageHeader";
import { Avatar } from "../components/common/Avatar";
import { calculateRank } from "../utils/srmiUtils";
import { Trophy, Flame, ChevronUp, Leaf } from "lucide-react";

export function Leaderboard() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("points", "desc"), limit(20));
        const snap = await getDocs(q);
        const users = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        setTopUsers(users);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, []);

  return (
    <div className="max-w-2xl mx-auto fade-up space-y-6 pb-24 font-sans px-4">
      <PageHeader title="Ranking Global" />

      <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20 opacity-50" />

        <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2 flex items-center gap-3">
          <Trophy className="text-emerald-500" size={28} />
          Líderes de Ecomovilidad
        </h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
          Los mayores contribuyentes ambientales
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Leaf size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">¿Qué son los PM?</h4>
              <div className="text-xs text-slate-400 font-medium leading-relaxed space-y-3">
                <p>
                  Los <strong className="text-emerald-400">Puntos de Movilidad (PM)</strong> son recompensas por compartir viajes y reducir CO₂.<br />
                  Mientras más usas la app, más PM acumulas y mayor es tu impacto.
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {topUsers.map((u, i) => {
              const rankInfo = calculateRank(u.points || 0);
              const isTop3 = i < 3;

              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:-translate-y-1 ${i === 0 ? 'bg-gradient-to-r from-rose-500/20 to-transparent border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)]' :
                      i === 1 ? 'bg-gradient-to-r from-slate-400/20 to-transparent border-slate-400/50' :
                        i === 2 ? 'bg-gradient-to-r from-amber-700/20 to-transparent border-amber-700/50' :
                          'bg-slate-900 border-slate-800'
                    }`}
                >
                  <div className={`w-8 font-black text-xl italic text-center ${i === 0 ? 'text-rose-400' :
                      i === 1 ? 'text-slate-300' :
                        i === 2 ? 'text-amber-600' :
                          'text-slate-600'
                    }`}>
                    #{i + 1}
                  </div>

                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full border-2 ${rankInfo.border} blur-[2px] opacity-50`}></div>
                    <div className={`relative rounded-full border-2 ${rankInfo.border} p-0.5 bg-slate-900`}>
                      <Avatar user={u} size={48} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-white text-base leading-tight">
                          {u.name}
                        </h3>
                        <div className={`text-[10px] font-black uppercase tracking-widest ${rankInfo.color}`}>
                          {rankInfo.fullName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-white flex items-center justify-end gap-1">
                          <Flame size={14} className="text-orange-500" />
                          {u.points || 0}
                        </div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">PM Totales</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {topUsers.length === 0 && (
              <div className="text-center py-10">
                <p className="text-slate-500 font-bold">Nadie ha dominado la liga aún.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
