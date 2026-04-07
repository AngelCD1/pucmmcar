import React, { useState } from "react";
import { Star, Map as MapIcon } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { LEVELS, CAREERS } from "../constants";
import { Avatar } from "../components/common/Avatar";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { Btn } from "../components/common/Btn";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";
import { PageHeader } from "../components/layout/PageHeader";
import { UserRankCard } from "../components/srmi/UserRankCard";
import { MedalGrid } from "../components/srmi/MedalGrid";

export function Profile() {
  const { user, setUser, setHomeLocation, setView, isDark, addVehicle, removeVehicle, setFavoriteVehicle } = useApp();
  
  const currentLevel = [...LEVELS].reverse().find(l => (user?.points ?? 0) >= l.minPoints) || LEVELS[0];
  const [editing, setEditing] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vhForm, setVhForm] = useState({ brand: "", model: "", year: "", plate: "", color: "" });
  const [form, setForm] = useState({ 
    name: user?.name || "", 
    phone: user?.phone || "", 
    career: user?.career || "", 
    studentId: user?.studentId || "" 
  });

  const tripsToNextReward = Math.max(0, 5 - (user?.rides ?? 0));
  const nextMilestoneText = tripsToNextReward > 0
    ? `Te faltan ${tripsToNextReward} viajes para tu próximo café gratis.`
    : "¡Felicidades! Ya puedes reclamar tu recompensa en la tienda.";

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!vhForm.brand || !vhForm.plate) return;
    await addVehicle(vhForm);
    setShowAddVehicle(false);
    setVhForm({ brand: "", model: "", year: "", plate: "", color: "" });
  };

  const save = () => { 
    setUser(form); 
    setEditing(false); 
  };
  
  const isDriver = user?.role === "driver";

  return (
    <div className="max-w-2xl mx-auto fade-up space-y-6 pb-24 font-sans px-4">
      <PageHeader title="Mi Perfil" />

      <div className="flex justify-end pr-2 -mt-2">
        <button 
          onClick={() => setEditing(!editing)} 
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy dark:hover:text-gold flex items-center gap-1 transition-colors"
        >
          {editing ? "Cancelar Edición" : "Ajustes de Perfil"}
        </button>
      </div>

      <UserRankCard user={user} onPhotoUpload={(photo) => setUser({ ...user, photo })} />
      <MedalGrid user={user} />

      {/* 2. NEW USER MOTIVATOR */}
      {(user?.rides ?? 0) < 3 && (
        <Card className="p-6 border-gold/30 bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] shadow-lg animate-fade-in border-2 border-dashed relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/5 pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-md">
               <Star className="text-gold" fill="currentColor" size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-navy dark:text-gold uppercase tracking-widest italic">Aventurero Incipiente</h4>
              <p className="text-[11px] font-bold text-slate-500 leading-tight">Completa {(3 - (user?.rides ?? 0))} viajes más para desbloquear recompensas premium.</p>
            </div>
            <Btn size="sm" onClick={() => setView("search")} className="bg-navy text-white text-[9px] font-black px-4 h-9 shadow-lg active:scale-95 transition-all">IR A VIAJAR</Btn>
          </div>
        </Card>
      )}


      {/* 4. TICKET SECTION: MIS CANJES (For Cafeteria) */}
      {(user?.redeemedCodes || []).length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mis Cupones & Tickets ({(user?.redeemedCodes || []).length})</h3>
            <span className="text-[9px] font-bold text-slate-300">Presenta en caja</span>
          </div>
          <div className="grid gap-3">
            {(user?.redeemedCodes || []).map((c, i) => (
              <div key={i} style={{ background: isDark ? "#0f172a" : "#ffffff", border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}` }} className="flex rounded-3xl overflow-hidden shadow-md group border-l-4 border-l-gold hover:shadow-xl transition-all">
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={12} className="text-gold" fill="currentColor" />
                    <span className="text-xs font-black text-navy dark:text-white uppercase italic">{c.rewardTitle}</span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.redeemedAt}</p>
                </div>
                <div style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }} className="px-6 flex flex-col items-center justify-center border-l-2 border-dashed border-slate-200 dark:border-slate-700 relative min-w-[120px]">
                   <div className="absolute top-0 left-0 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full border border-slate-200 dark:border-slate-800" style={{ background: isDark ? "#050c18" : "#f8fafc" }} />
                   <div className="absolute bottom-0 left-0 -ml-1.5 -mb-1.5 w-3 h-3 rounded-full border border-slate-200 dark:border-slate-800" style={{ background: isDark ? "#050c18" : "#f8fafc" }} />
                   <div className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase mb-1">CÓDIGO</div>
                   <div className="font-mono text-sm font-black text-navy dark:text-gold tracking-widest">{c.code}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* 6. EDIT FORM */}
      {editing && (
        <Card className="p-8 border-gold/20 bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] animate-slide-up shadow-xl border">
          <div className="text-[10px] font-black text-navy dark:text-gold uppercase tracking-[0.3em] mb-6 text-center">Modificar Mi Información</div>
          <div className="grid gap-4">
            <Input label="Nombre completo" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-white dark:bg-slate-800" />
            <Input label="Teléfono" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-white dark:bg-slate-800" />
            <Select label="Carrera" value={form.career} onChange={e => setForm(p => ({ ...p, career: e.target.value }))} className="bg-white dark:bg-slate-800">
              {CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Btn onClick={save} className="w-full h-14 bg-navy text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-navy/20 active:scale-95 transition-all">Guardar Cambios</Btn>
          </div>
        </Card>
      )}


      {/* 8. VERIFICATION STATUS */}
      <Btn variant="secondary" onClick={() => setView("verify")} className="w-full h-16 rounded-[1.5rem] bg-white dark:bg-[#1E1E1E] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center group hover:border-navy/30 transition-all">
        <span className="text-[10px] font-black text-slate-400 group-hover:text-navy uppercase tracking-[0.3em]">Estado de Verificación</span>
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-2 h-2 rounded-full ${user?.idVerified === true ? 'bg-green-500 animate-pulse' : 'bg-gold'}`} />
          <span className="text-xs font-black text-navy dark:text-white uppercase tracking-widest">
            {user?.idVerified === true ? "DOCUMENTACIÓN VALIDADA" : "VERIFICACIÓN PENDIENTE"}
          </span>
        </div>
      </Btn>

      {/* 9. VEHICLES SECTION */}
      {isDriver && (
        <Card className="p-8 border-navy/10 bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-navy dark:text-white uppercase tracking-widest">Mis Vehículos</h3>
            <Btn size="sm" variant="primary" onClick={() => setShowAddVehicle(!showAddVehicle)} className="h-10 px-6 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-md">
              {showAddVehicle ? "Cerrar" : "Agregar"}
            </Btn>
          </div>

          {showAddVehicle && (
            <Card className="p-6 mb-8 bg-gold/5 border-gold/20 rounded-[1.5rem] animate-slide-up border-2">
              <form onSubmit={handleAddVehicle} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Marca" value={vhForm.brand} onChange={e => setVhForm(p => ({ ...p, brand: e.target.value }))} placeholder="Toyota" required />
                  <Input label="Modelo" value={vhForm.model} onChange={e => setVhForm(p => ({ ...p, model: e.target.value }))} placeholder="Corolla" required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Año" value={vhForm.year} onChange={e => setVhForm(p => ({ ...p, year: e.target.value }))} placeholder="2022" />
                  <Input label="Color" value={vhForm.color} onChange={e => setVhForm(p => ({ ...p, color: e.target.value }))} placeholder="Gris" />
                  <Input label="Placa" value={vhForm.plate} onChange={e => setVhForm(p => ({ ...p, plate: e.target.value.toUpperCase() }))} placeholder="A123456" required />
                </div>
                <Btn type="submit" className="w-full h-12 bg-navy text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg">Guardar Vehículo</Btn>
              </form>
            </Card>
          )}

          <div className="space-y-4">
            {(user?.vehicles || []).length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-[#1E1E1E]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay vehículos registrados</p>
              </div>
            )}
            {(user?.vehicles || []).map(v => (
              <div key={v.id} className={`flex items-center gap-6 p-6 rounded-[1.5rem] bg-white dark:bg-[#1E1E1E] border-2 transition-all ${v.isFavorite ? 'border-gold/30 shadow-md' : 'border-slate-100 dark:border-slate-800 hover:border-navy/10 shadow-sm'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${v.isFavorite ? 'bg-gold text-navy shadow-lg' : 'bg-white dark:bg-slate-700 text-slate-400 shadow-sm'}`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>
                </div>
                <div className="flex-1">
                  <div className="font-black text-navy dark:text-white text-sm italic">{v.brand} {v.model} <span className="text-[10px] font-bold text-slate-400 not-italic">({v.year})</span></div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Placa: {v.plate} &bull; {v.color}</div>
                </div>
                <div className="text-right">
                  <Badge color={v.status === "approved" ? "green" : v.status === "pending" ? "yellow" : "red"} className="text-[8px] font-black uppercase tracking-widest mb-3 px-3 py-1">
                    {v.status === "approved" ? "Verificado" : v.status === "pending" ? "Pendiente" : "Rechazado"}
                  </Badge>
                  <div className="flex gap-4">
                    {!v.isFavorite && <button onClick={() => setFavoriteVehicle(v.id)} className="text-[9px] font-black text-gold hover:text-navy uppercase tracking-widest transition-colors">Favorito</button>}
                    <button onClick={() => removeVehicle(v.id)} className="text-[9px] font-black text-pucmm-red hover:opacity-70 uppercase tracking-widest transition-colors">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 10. SECURITY */}
      <ChangePasswordCard isDark={isDark} />
    </div>
  );
}

function ChangePasswordCard({ isDark }) {
  const { changePassword, user, resetPassword } = useApp();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setErr("");
    if (!current || !next || !confirm) { setErr("Completa todos los campos."); return; }
    if (next.length < 6) { setErr("Mínimo 6 caracteres."); return; }
    if (next !== confirm) { setErr("Las contraseñas no coinciden."); return; }
    setLoading(true);
    const error = await changePassword(current, next);
    setLoading(false);
    if (error) setErr(error);
    else { 
      setOk(true); 
      setCurrent(""); 
      setNext(""); 
      setConfirm(""); 
      setTimeout(() => { 
        setOk(false); 
        setOpen(false); 
      }, 2500); 
    }
  };

  return (
    <Card className="p-8 border-navy/10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-navy dark:text-white uppercase tracking-widest">Seguridad</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Cambiar contraseña</p>
          </div>
        </div>
        <Btn variant="secondary" size="sm" onClick={() => { setOpen(o => !o); setErr(""); setOk(false); }} className="h-10 px-6 rounded-xl text-[10px] font-black tracking-widest uppercase">
          {open ? "Cancelar" : "Modificar"}
        </Btn>
      </div>

      {open && (
        <div className="mt-8 space-y-4 animate-slide-down">
          {ok && (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <p className="text-[11px] font-bold text-green-600 uppercase">Contraseña actualizada con éxito</p>
            </div>
          )}

          <Input label="Contraseña actual" type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••" className="bg-slate-50 dark:bg-slate-800/50" />
          <Input label="Nueva contraseña" type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="Mínimo 6 caracteres" className="bg-slate-50 dark:bg-slate-800/50" />
          <Input label="Confirmar contraseña" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" className="bg-slate-50 dark:bg-slate-800/50" />

          {err && (
            <div className="flex items-center gap-2 text-[10px] font-black text-pucmm-red uppercase tracking-widest ml-2 italic">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {err}
            </div>
          )}

          <div className="flex flex-col gap-4 mt-6">
            <Btn onClick={handle} disabled={loading} className="w-full h-14 bg-navy text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-navy/20">
              {loading ? "ACTUALIZANDO..." : "GUARDAR NUEVA CLAVE"}
            </Btn>

            <button
              type="button"
              onClick={() => {
                if (user?.email) resetPassword(user.email);
              }}
              className="text-[10px] font-black text-slate-400 hover:text-navy uppercase tracking-widest text-center transition-colors underline decoration-gold decoration-2 underline-offset-4"
            >
              ¿Olvidaste tu contraseña? Enviar correo de recuperación
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
