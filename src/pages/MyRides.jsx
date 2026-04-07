import React, { useState, useRef } from "react";
import { useApp } from "../contexts/AppContext";
import { Btn } from "../components/common/Btn";
import { 
  History, 
  Car, 
  Users, 
  MessageSquare, 
  Navigation, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Chat } from "./Chat";

export function MyRides() {
  const { rides, user, finishRide, cancelRide, startLiveTracking, startPublishingLocation, setSosOpen, setView, isDark, notifications, clearNotifications } = useApp();
  const myDriverRides = rides.filter(r => r.driverId === user?.id);
  const myPassengerRides = rides.filter(r => r.passengers?.includes(user?.id));
  const [chatRide, setChatRide] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const stopGpsRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Todos'); // 'Todos' | 'Programados' | 'Completados'
  const [gamificationData, setGamificationData] = useState(null);

  const StatusPill = ({ status }) => {
    if (status === "active") return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-[10px] font-bold uppercase">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Activo
      </span>
    );
    if (status === "completed") return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0A2342]/10 dark:bg-blue-900/30 text-[#0A2342] dark:text-blue-400 rounded text-[10px] font-bold uppercase">
        <CheckCircle2 size={10} />
        Completado
      </span>
    );
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded text-[10px] font-bold uppercase">
        <XCircle size={10} />
        Cancelado
      </span>
    );
  };

  const toggleGps = (rideId) => {
    if (publishing === rideId) { stopGpsRef.current?.(); stopGpsRef.current = null; setPublishing(null); }
    else { if (stopGpsRef.current) stopGpsRef.current(); stopGpsRef.current = startPublishingLocation(rideId); setPublishing(rideId); }
  };

  const allFilteredRides = user?.role === "driver" ? myDriverRides : myPassengerRides;
  const filteredRidesByTab = allFilteredRides.filter(r => {
    if (activeTab === 'Todos') return true;
    if (activeTab === 'Programados' && r.status === 'active') return true;
    if (activeTab === 'Completados' && r.status === 'completed') return true;
    return false;
  });

  return (
    <div className="max-w-[800px] mx-auto space-y-8 pb-32 font-sans mt-4">
      <div className="page-header mb-6">
         <div className="ph-left">
           <div className="ph-eyebrow">
             <div className="ph-dot"></div>
             <span className="ph-date dark:text-[#A0AAB2]">GESTIÓN DE VIAJES</span>
           </div>
           <div className="ph-title dark:text-[#F3F4F6]">Mis <span>Viajes</span></div>
           <div className="ph-sub dark:text-[#A0AAB2]">Gestiona tu historial y seguimiento en tiempo real en el campus.</div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#2C2C2C] mb-6">
        {['Todos', 'Programados', 'Completados'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-6 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-[#0A2342] dark:text-[#F3F4F6] border-b-2 border-[#0A2342] dark:border-[#F3F4F6]' : 'text-gray-500 dark:text-[#A0AAB2] hover:text-gray-700 dark:hover:text-[#F3F4F6]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredRidesByTab.map(r => {
           const myPrice = user?.role === "driver" ? (r.price ?? 0) : (r[`passengerPrice_${user?.id}`] ?? (r.price ?? 0));
           return (
            <div 
              key={r.id} 
              className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm border border-gray-100 dark:border-[#2C2C2C] overflow-hidden"
            >
              <div className="flex flex-col md:flex-row items-center justify-between p-5 gap-4">
                {/* Left: Icon & Date */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-[#2C2C2C] text-[#0A2342] dark:text-[#A0AAB2] flex items-center justify-center shrink-0">
                    <Car size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#0A2342] dark:text-[#F3F4F6]">{r.date}</div>
                    <div className="text-xs text-gray-500 dark:text-[#A0AAB2]">{r.time}</div>
                  </div>
                </div>
                
                {/* Center: Route */}
                <div className="flex-1 px-2 md:px-6 flex flex-col items-start md:items-center text-left md:text-center w-full">
                  <div className="flex items-center gap-2 text-[15px] font-semibold text-[#0A2342] dark:text-[#F3F4F6]">
                    <span className="truncate max-w-[150px]">{r.from}</span>
                    <ArrowRight size={14} className="text-gray-400 dark:text-[#A0AAB2]" />
                    <span className="truncate max-w-[150px]">{r.to}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-[#A0AAB2] mt-1">{user?.role === "driver" ? `Pasajeros: ${r.passengers?.length || 0}/${r.seats || 0}` : `Conductor: ${r.driverName}`}</div>
                </div>
                
                {/* Right: Price & Status */}
                <div className="text-left md:text-right w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center">
                  <div className="text-xl font-bold text-[#0A2342] dark:text-[#F3F4F6]">RD$ {myPrice}</div>
                  <div className="mt-1"><StatusPill status={r.status} /></div>
                </div>
              </div>

              {/* Actions Footer for active rides */}
              {r.status === "active" && (
                <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-gray-50 dark:bg-[#1A1A1A] border-t border-gray-100 dark:border-[#2C2C2C]">
                    <div className="relative">
                      <Btn variant="outline" size="sm" onClick={() => { setChatRide(r); clearNotifications(r.id); }} className="h-9 px-4 text-xs font-semibold bg-white dark:bg-[#1E1E1E] dark:text-[#F3F4F6] dark:border-[#2C2C2C]">
                        <MessageSquare size={14} className="mr-2 inline" /> CHAT
                      </Btn>
                      {notifications[r.id] > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-[#1E1E1E] shadow-sm">
                          {notifications[r.id]}
                        </div>
                      )}
                    </div>

                    {user?.role === "driver" ? (
                      <>
                        <button 
                          onClick={() => toggleGps(r.id)}
                          className={`h-9 px-4 rounded-md font-semibold text-xs transition-colors flex items-center gap-2 ${publishing === r.id ? 'bg-green-600 text-white' : 'bg-[#E2E8F0] dark:bg-[#2C2C2C] text-[#0A2342] dark:text-[#F3F4F6]'}`}
                        >
                          <Navigation size={14} className={publishing === r.id ? 'animate-bounce' : ''} />
                          {publishing === r.id ? "GPS ACTIVO" : "COMPARTIR GPS"}
                        </button>
                        <Btn size="sm" onClick={() => {
                          finishRide(r.id);
                          setGamificationData({ saved: Math.floor(Math.random() * 80) + 40, co2: (Math.random() * 2 + 0.5).toFixed(1) });
                        }} className="h-9 px-4 bg-green-600 text-white font-semibold text-xs ml-auto">COMPLETAR</Btn>
                        <button onClick={() => cancelRide(r.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors ml-4 uppercase">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => startLiveTracking(r.id)}
                          className="h-9 px-4 bg-[#0A2342] dark:bg-blue-600 text-white rounded-md font-semibold text-xs shadow-sm flex items-center gap-2"
                        >
                          <Navigation size={14} /> SEGUIMIENTO
                        </button>
                        <button onClick={() => setSosOpen(true)} className="ml-auto h-9 px-4 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-md flex items-center gap-2 font-semibold text-xs uppercase hover:bg-red-100 transition-colors">
                          <AlertTriangle size={14} /> SOS
                        </button>
                      </>
                    )}
                </div>
              )}
            </div>
           );
        })}

        {filteredRidesByTab.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-[#1E1E1E] rounded-lg border border-dashed border-gray-200 dark:border-[#2C2C2C] mt-4">
            <div className="w-16 h-16 bg-gray-50 dark:bg-[#2C2C2C] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
               <History size={32} />
            </div>
            <h2 className="text-lg font-bold text-[#0A2342] dark:text-[#F3F4F6] mb-1">Sin viajes aquí</h2>
            <p className="text-sm text-gray-500 dark:text-[#A0AAB2]">No hay viajes que coincidan con esta categoría.</p>
          </div>
        )}
      </div>

      {chatRide && <Chat rideId={chatRide.id} ride={chatRide} onClose={() => setChatRide(null)} />}

      {/* Gamification Modal */}
      {gamificationData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl animate-slide-up border border-gold/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDB913]/10 blur-3xl rounded-full -mr-16 -mt-16" />
            <div className="mx-auto w-16 h-16 bg-[#FDB913]/20 border border-[#FDB913]/30 rounded-2xl flex items-center justify-center mb-6 text-[#FDB913] animate-bounce shadow-lg shadow-[#FDB913]/10">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black italic text-[#0A2342] dark:text-white mb-2">¡Viaje Completado!</h2>
            <p className="text-sm font-semibold text-gray-500 dark:text-[#A0AAB2] mb-6">Gracias por contribuir a una movilidad más inteligente en el campus.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0A2342]/5 dark:bg-[#0A2342]/30 rounded-2xl p-4 border border-[#0A2342]/10">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Ahorro Estimado</div>
                <div className="text-2xl font-black text-green-600">RD$ {gamificationData.saved}</div>
              </div>
              <div className="bg-[#16a34a]/5 dark:bg-[#16a34a]/10 rounded-2xl p-4 border border-[#16a34a]/20">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1">Impacto Verde (CO₂)</div>
                <div className="text-2xl font-black text-[#16a34a]">{gamificationData.co2} kg</div>
              </div>
            </div>

            <button 
              onClick={() => setGamificationData(null)}
              className="w-full bg-[#0A2342] hover:bg-[#0f3460] text-white font-semibold text-sm py-4 rounded-xl transition-colors shadow-lg active:scale-95"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
