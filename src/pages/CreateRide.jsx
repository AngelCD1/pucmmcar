import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { PUCMM_LOCATIONS, POPULAR_PLACES, MAP_CONFIG } from "../constants";
import { Card } from "../components/common/Card";
import { Btn } from "../components/common/Btn";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import {
  CheckCircle2,
  MapPin,
  Clock,
  Car,
  Users,
  Calendar,
  ArrowRight,
  Info
} from "lucide-react";

export function CreateRide() {
  const { createRide, createRequest, user, isDark, setView } = useApp();
  const [isLocating, setIsLocating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getInitialVehicle = () => {
    const favorite = user?.vehicles?.find(v => v.isFavorite);
    const first = user?.vehicles?.[0];
    const v = favorite || first;
    if (!v) return { name: "", plate: "" };
    return { name: `${v.brand} ${v.model}`, plate: v.plate };
  };

  const initialV = getInitialVehicle();

  const [scheduleMode, setScheduleMode] = useState("now");
  const [pricingMode, setPricingMode] = useState("auto");
  const [isCustomVehicle, setIsCustomVehicle] = useState(false);
  const [customVehicle, setCustomVehicle] = useState("");
  const [customPlate, setCustomPlate] = useState("");
  const [f, setF] = useState({
    from: "", fromLat: null, fromLng: null,
    to: "PUCMM Santo Domingo", toLat: 18.4682, toLng: -69.9333,
    date: new Date().toISOString().split("T")[0],
    time: "",
    seats: "3", price: "250",
    vehicle: initialV.name,
    plate: initialV.plate,
    gender: "both", preferences: [],
    recurring: "none"
  });
  const [done, setDone] = useState(false);
  const [fromSugg, setFromSugg] = useState([]);

  // Intelligent Pricing Calculation
  const suggestPrice = (seats) => {
    // Base rate calculation (e.g., 150 base + 50 per seat)
    return 150 + (parseInt(seats) * 35);
  };

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (pricingMode === "auto") {
      set("price", suggestPrice(f.seats).toString());
    }
  }, [pricingMode, f.seats]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Tu navegador no soporta geolocalización");
    setIsLocating(true);
    setIsSuccess(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          // TomTom Reverse Geocoding
          const key = MAP_CONFIG.tomtomKey || 'uP9S8GvRGs2EAXN4G6L1p6G7p6zG9Yy9';
          const r = await fetch(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${key}`);
          const d = await r.json();
          const addr = d.addresses?.[0]?.address?.freeformAddress || "Mi ubicación actual";
          set("from", addr);
        } catch (e) {
          set("from", "Mi ubicación actual");
        }
        set("fromLat", lat);
        set("fromLng", lng);
        setIsLocating(false);
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      },
      (err) => {
        alert("Permisos de ubicación denegados. Activa el GPS.");
        setIsLocating(false);
      }
    );
  };

  const isDriver = user?.role === "driver";

  if (done) return (
    <div className="max-w-md mx-auto py-20 px-6 text-center animate-in zoom-in-95 duration-500 font-sans">
      <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
        <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
        <CheckCircle2 size={48} className="text-success relative z-10" />
      </div>

      <h2 className="text-3xl font-black mb-4 tracking-tight text-navy dark:text-white">
        {isDriver ? "¡Viaje publicado!" : "¡Solicitud enviada!"}
      </h2>

      <p className="text-txt-2 font-medium mb-10 leading-relaxed max-w-sm mx-auto">
        {isDriver
          ? "Tu ruta ya es visible para toda la comunidad PUCMM. Te notificaremos cuando alguien reserve."
          : "Tu solicitud ha sido enviada. Los conductores cerca de ti podrán aceptarla en cualquier momento."
        }
      </p>

      <div className="space-y-4">
        <button
          onClick={() => setDone(false)}
          className="w-full h-16 bg-navy text-white rounded-2xl font-black text-lg shadow-xl shadow-navy/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          CREAR OTRO
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 text-txt-3 font-bold text-xs uppercase tracking-widest hover:text-navy transition-colors"
        >
          VOLVER AL INICIO
        </button>
      </div>
    </div>
  );

  const handle = (e) => {
    e.preventDefault();
    if (!f.from || (scheduleMode === "scheduled" && !f.time)) return;

    const vehicleName = isCustomVehicle ? customVehicle : f.vehicle;
    const vehiclePlate = isCustomVehicle ? customPlate : f.plate;

    const rideData = {
      ...f,
      vehicle: vehicleName || "Vehículo personal",
      plate: vehiclePlate || "—",
      date: new Date().toISOString().split("T")[0],
      time: scheduleMode === "now" ? "AHORA" : f.time,
      from: { name: f.from, lat: f.fromLat, lon: f.fromLng },
      to: { name: f.to, lat: f.toLat, lon: f.toLng }
    };

    if (isDriver) createRide(rideData);
    else createRequest({ ...rideData, status: "scheduled" });
    setDone(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-32 font-sans mt-4">
      <div className="page-header">
        <div className="ph-left">
          <div className="ph-eyebrow">
            <div className="ph-dot"></div>
            <span className="ph-date">FORMULARIO DE VIAJE</span>
          </div>
          <div className="ph-title">
            {isDriver ? "Publicar mi " : "Pedir un "}<span>{isDriver ? "Ruta" : "Aventón"}</span>
          </div>
          <div className="ph-sub">
            {isDriver
              ? "Comparte tu viaje y ayuda a otros compañeros a llegar al campus."
              : "Cuéntanos a dónde vas para que un conductor te contacte."
            }
          </div>
        </div>
      </div>

      <form onSubmit={handle} className="space-y-6">
        {/* Route Section */}
        <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy/10 text-navy rounded-xl flex items-center justify-center">
              <MapPin size={18} />
            </div>
            <h3 className="font-black text-navy dark:text-blue-100 tracking-tight">Detalles de la Ruta</h3>
          </div>

            <div className="space-y-6">
              <div className="relative">
                <Input
                  label="Punto de Recogida"
                  value={f.from}
                  onChange={e => {
                    set("from", e.target.value);
                    if (e.target.value.length > 1)
                      setFromSugg(POPULAR_PLACES.filter(p => p.name.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 5));
                    else setFromSugg([]);
                  }}
                  placeholder="¿Desde dónde sales?"
                  required
                  style={{ paddingRight: '100px' }}
                  className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white transition-all ring-offset-0 focus:ring-4 focus:ring-navy/10"
                />
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className={`absolute right-3 bottom-[7px] h-10 px-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm 
                    ${isLocating ? 'bg-slate-100 text-slate-400' : isSuccess ? 'bg-green-500 text-white shadow-green-200' : 'bg-gold/10 text-gold hover:bg-navy hover:text-white group/btn'}`}
                >
                  {isLocating ? (
                    <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                  ) : isSuccess ? (
                    <CheckCircle2 size={14} className="animate-in zoom-in-50" />
                  ) : (
                    <MapPin size={14} className="group-hover/btn:animate-bounce" />
                  )}
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {isLocating ? 'Capturando...' : isSuccess ? '¡Listo!' : 'Mi Ubicación'}
                  </span>
                </button>
                
                {fromSugg.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-3 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden py-2 animate-in slide-in-from-top-2 duration-200">
                    {fromSugg.map(s => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => { set("from", s.name); set("fromLat", s.lat); set("fromLng", s.lng); setFromSugg([]); }}
                        className="w-full text-left px-5 py-3 hover:bg-navy/10 dark:hover:bg-navy/30 transition-colors group"
                      >
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-navy transition-colors">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Lugar popular</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Select
                label="Destino Final"
                value={f.to}
                className="bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white ring-offset-0 focus:ring-4 focus:ring-navy/10"
                onChange={e => {
                  const loc = [...PUCMM_LOCATIONS, ...POPULAR_PLACES].find(l => l.name === e.target.value);
                  setF(p => ({ ...p, to: e.target.value, toLat: loc?.lat, toLng: loc?.lng || loc?.lon }));
                }}
              >
                {PUCMM_LOCATIONS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                <optgroup label="— Regreso —">{POPULAR_PLACES.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}</optgroup>
              </Select>
            </div>
        </Card>

        {/* Schedule Section */}
        <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy/10 text-navy rounded-xl flex items-center justify-center">
              <Clock size={18} />
            </div>
            <h3 className="font-black text-navy dark:text-blue-100 tracking-tight">Horario de Salida</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setScheduleMode("now")}
              className={`group flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden ${scheduleMode === "now" ? 'bg-gold border-gold text-navy shadow-[0_0_30px_rgba(250,204,21,0.3)] scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-navy dark:hover:text-white'}`}
            >
              <div className={`mb-2 p-2 rounded-xl ${scheduleMode === "now" ? 'bg-navy/10' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <Clock size={20} className="relative z-10" />
              </div>
              <span className="font-black text-[10px] tracking-[0.2em] relative z-10">SALIDA INMEDIATA</span>
              {scheduleMode === "now" && (
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-2 h-2 bg-navy rounded-full animate-pulse" />
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setScheduleMode("scheduled")}
              className={`group flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden ${scheduleMode === "scheduled" ? 'bg-navy border-navy text-white shadow-[0_0_30px_rgba(0,51,160,0.3)] scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-navy dark:hover:text-white'}`}
            >
              <div className={`mb-2 p-2 rounded-xl ${scheduleMode === "scheduled" ? 'bg-white/10' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <Calendar size={20} className="relative z-10" />
              </div>
              <span className="font-black text-[10px] tracking-[0.2em] relative z-10">PROGRAMAR VIAJE</span>
            </button>
          </div>

          {scheduleMode === "scheduled" && (
            <div className="animate-in slide-in-from-top-4 duration-500 ease-out">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Hora</p>
                <div className="relative">
                  <select
                    value={f.time}
                    onChange={e => set("time", e.target.value)}
                    required
                    className={`w-full h-14 border-2 border-transparent rounded-2xl px-5 pr-10 text-sm font-bold outline-none transition-all appearance-none cursor-pointer
                      ${isDark ? 'bg-slate-800 text-white focus:border-white/10' : 'bg-slate-100 text-navy focus:border-navy/20'}`}
                  >
                    <option value="" className={isDark ? "bg-slate-800" : "bg-white"}>Selecciona la hora</option>
                    {Array.from({ length: 32 }).map((_, i) => {
                      const totalMins = 6 * 60 + i * 30; // Starts at 6:00 AM
                      const h = Math.floor(totalMins / 60);
                      const m = totalMins % 60;
                      
                      const now = new Date();
                      const currentMins = now.getHours() * 60 + now.getMinutes();
                      const isPast = totalMins <= currentMins + 15;

                      const ampm = h >= 12 ? 'PM' : 'AM';
                      const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
                      const displayM = m.toString().padStart(2, '0');
                      const valH = h.toString().padStart(2, '0');
                      const val = `${valH}:${displayM}`;
                      
                      return (
                        <option 
                          key={val} 
                          value={val} 
                          disabled={isPast}
                          className={isDark ? "bg-slate-800 text-white" : "bg-white text-navy"}
                        >
                          {`${displayH}:${displayM} ${ampm}`} {isPast ? '(Pasado)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Clock size={16} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-5 bg-navy/5 dark:bg-navy/20 rounded-3xl border border-navy/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-navy/5 rounded-full -mr-8 -mt-8" />
            <Info size={16} className="text-navy dark:text-gold-light flex-shrink-0 relative z-10" />
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-widest font-black text-navy dark:text-navy-light mb-0.5">Política de Reserva</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">
                Ahora puedes programar con anticipación y obtener beneficios por reserva temprana.
              </p>
            </div>
          </div>
        </Card>

        {/* Vehicle & Details */}
        <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy/10 text-navy rounded-xl flex items-center justify-center">
              {isDriver ? <Car size={18} /> : <Users size={18} />}
            </div>
            <h3 className="font-black text-navy dark:text-blue-100 tracking-tight">
              {isDriver ? "Vehículo y Precio" : "Detalles del Pedido"}
            </h3>
          </div>

          <div className="space-y-8">
            {isDriver && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Selecciona tu Vehículo</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(user?.vehicles || []).map(v => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => { set("vehicle", `${v.brand} ${v.model}`); set("plate", v.plate); setIsCustomVehicle(false); }}
                        className={`text-left p-5 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden group ${!isCustomVehicle && f.plate === v.plate ? 'bg-navy text-white border-navy shadow-lg' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        disabled={v.status !== "approved" && v.status !== "pending"}
                      >
                        <div className="relative z-10">
                          <h4 className="font-black text-sm uppercase tracking-tight">{v.brand} {v.model}</h4>
                          <p className={`text-[10px] font-bold ${!isCustomVehicle && f.plate === v.plate ? 'text-white/80' : 'text-slate-400'}`}>PLACA: {v.plate}</p>
                          {v.status !== "approved" && <span className="inline-block mt-2 px-2 py-0.5 bg-gold text-navy text-[8px] font-black rounded-full uppercase">Pendiente</span>}
                        </div>
                        {(!isCustomVehicle && f.plate === v.plate) && <div className="absolute top-2 right-2"><CheckCircle2 size={16} /></div>}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCustomVehicle(true)}
                      className={`text-center p-5 rounded-3xl border-2 transition-all duration-300 ${isCustomVehicle ? 'bg-navy text-white border-navy shadow-lg' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 group'}`}
                    >
                      <span className="font-black text-sm uppercase tracking-tight transition-all group-hover:tracking-[0.1em]">OTRO VEHÍCULO</span>
                    </button>
                  </div>
                </div>

                {isCustomVehicle && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                    <Input label="Modelo" value={customVehicle} onChange={e => setCustomVehicle(e.target.value)} placeholder="Toyota Corolla" className="bg-slate-50 dark:bg-slate-800 border-0" />
                    <Input label="Placa" value={customPlate} onChange={e => setCustomPlate(e.target.value.toUpperCase())} placeholder="A123456" className="bg-slate-50 dark:bg-slate-800 border-0" />
                  </div>
                )}

                <Select
                  label="Capacidad (Asientos)"
                  value={f.seats}
                  className="bg-slate-50 dark:bg-slate-800 border-0"
                  onChange={e => set("seats", e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} asiento(s)</option>)}
                </Select>
              </div>
            )}

            <div className="space-y-8">
              {isDriver && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo de Precio Inteligente</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'auto', label: 'AUTO', desc: 'Sugerido' },
                        { id: 'flex', label: 'FLEX', desc: 'Ajustable' },
                        { id: 'negated', label: 'NEGOC.', desc: 'Próximamente' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          disabled={m.id === 'negated'}
                          onClick={() => setPricingMode(m.id)}
                          className={`p-3 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center gap-1 ${pricingMode === m.id ? 'bg-navy text-white border-navy shadow-lg shadow-navy/20' : 'bg-gray-100 dark:bg-gray-700 border-transparent text-slate-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                          <span className="text-[10px] font-black tracking-tight">{m.label}</span>
                          <span className="text-[8px] font-bold opacity-60 leading-none">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-[2rem] border border-blue-100 dark:border-blue-800 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-800 dark:text-blue-200/80 uppercase tracking-widest">Simulación Ganancias Reales</p>
                        <div className="text-3xl font-black text-blue-700 dark:text-white">
                          RD$ {(parseInt(f.price) || 0) * (parseInt(f.seats) || 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-blue-400 dark:text-gray-400 uppercase">Capacidad</p>
                        <p className="text-sm font-black text-blue-900 dark:text-white uppercase">{f.seats} Asientos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-200/50 dark:bg-blue-500/20 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 bg-blue-700 dark:bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">
                        {pricingMode === 'auto' ? 'Sugerencia del Sistema' : 'Modo Flexible Activo'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="relative group">
                  <Input
                    label={isDriver ? (pricingMode === 'auto' ? "Precio Sugerido" : "Precio Unitario") : "Presupuesto"}
                    type="number"
                    value={f.price}
                    readOnly={pricingMode === 'auto'}
                    onChange={e => set("price", e.target.value)}
                    min="50" max="2000"
                    style={{ paddingLeft: '78px' }}
                    className={`font-black text-xl transition-all border-0 ${pricingMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'text-white' : 'text-navy'}`}
                  />
                  <span className={`absolute left-5 bottom-[14px] font-black text-lg ${isDark ? 'text-gold' : 'text-navy/40'}`}>RD$</span>
                  {pricingMode === 'flex' && (
                    <div className="mt-2 ml-1 flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-gold rounded-full" />
                      <p className="text-[8px] font-black text-gold uppercase tracking-wider">Rango recomendado: {Math.floor(suggestPrice(f.seats) * 0.8)} - {Math.floor(suggestPrice(f.seats) * 1.2)} RD$</p>
                    </div>
                  )}
                </div>
                <Select
                  label="Repetir Viaje"
                  value={f.recurring}
                  className="bg-slate-50 dark:bg-slate-800 border-0"
                  onChange={e => set("recurring", e.target.value)}
                >
                  <option value="none">Solo hoy</option>
                  <option value="daily">Todos los días Laborales</option>
                  <option value="weekly">Semanalmente</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        <div className="pt-6">
          <button
            type="submit"
            className={`w-full h-20 rounded-[2rem] font-black text-xl tracking-tight shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 group ${isDriver ? 'bg-navy text-white shadow-navy/30' : 'bg-navy text-white shadow-lg shadow-navy/20'}`}
          >
            {isDriver ? "PUBLICAR MI VIAJE" : "PUBLICAR SOLICITUD"}
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
