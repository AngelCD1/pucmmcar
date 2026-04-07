import React from "react";
import { useApp } from "../contexts/AppContext";
import { Card } from "../components/common/Card";
import { PageHeader } from "../components/layout/PageHeader";
import { Badge } from "../components/common/Badge";

export function Activity() {
  const { user, rides, isDark } = useApp();

  // Consolidar actividades: Viajes y Canjes
  const myRedemptions = (user?.redeemedCodes ?? []).map(c => {
    const ts = c.redeemedAtIso ? new Date(c.redeemedAtIso).getTime() : 0;
    return {
      id: c.code,
      type: "redemption",
      title: `Canje: ${c.rewardTitle}`,
      date: c.redeemedAt,
      status: "completed",
      points: 0,
      timestamp: ts
    };
  });

  const combinedActivities = [
    ...(rides ?? []).filter(r => 
      (r.driverId === user?.id || r.passengers?.includes(user?.id)) && 
      (r.status === "completed" || r.status === "cancelled")
    ).map(r => {
      let ts = 0;
      try {
        if (r.date) {
          const time = r.time === "AHORA" ? "00:00" : (r.time?.includes(":") ? r.time : "00:00");
          ts = new Date(`${r.date}T${time}`).getTime() || 0;
        }
      } catch (e) { ts = 0; }
      
      return {
        id: r.id,
        type: "ride",
        title: r.driverId === user?.id ? `Condujiste a ${r.to}` : `Viajaste a ${r.to}`,
        date: `${r.date} ${r.time}`,
        status: r.status,
        points: r.driverId === user?.id ? 50 : 10,
        timestamp: ts
      };
    }),
    ...myRedemptions
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fade-up max-w-2xl mx-auto space-y-6 pb-12 font-sans">
      <PageHeader title="Tu Actividad" />
      <div className="flex flex-col gap-4">
        {combinedActivities.length === 0 && (
          <Card className="text-center py-20 shadow-xl">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aún no hay registros de actividad</p>
          </Card>
        )}
        {combinedActivities.map(act => (
          <Card key={act.id} className="group p-6 flex items-center gap-6 shadow-sm hover:shadow-xl hover:border-navy/10 transition-all">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${act.status === 'cancelled' ? 'bg-pucmm-red/10 text-pucmm-red' : act.type === 'ride' ? 'bg-navy/10 text-navy' : 'bg-green-500/10 text-green-600'}`}>
              {act.status === 'cancelled' ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : act.type === "ride" ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-black text-navy dark:text-white text-sm italic tracking-tight">{act.title}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{act.date}</p>
            </div>
            
            <div className="text-right">
              <Badge color={act.status === "completed" ? "green" : act.status === "cancelled" ? "red" : "yellow"} className="text-[8px] font-black uppercase tracking-widest mb-2 px-3 py-1">
                {act.status === "completed" ? "COMPLETADO" : act.status === "cancelled" ? "CANCELADO" : "PENDIENTE"}
              </Badge>
              {act.points > 0 && (
                <div className="text-[11px] font-black text-green-600 flex items-center justify-end gap-1">
                  <span className="text-[8px] opacity-70">GANASTE</span>
                  +{act.points} PTS
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
