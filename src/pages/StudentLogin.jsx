import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";

export function StudentLogin({ onBack }) {
  const { login, resetPassword } = useApp();
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState("passenger");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!em) { setErr("Ingresa tu correo institucional."); return; }
    setLoading(true); setErr("");
    const error = await resetPassword(em);
    if (error) setErr(error);
    else setShowReset(false);
    setLoading(false);
  };

  const handle = async (e) => {
    e.preventDefault();
    if (!em || !pw) { setErr("Completa todos los campos."); return; }
    setLoading(true); setErr("");
    const error = await login(em, pw, role);
    if (error) setErr(error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001F54] via-navy to-[#001F54] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(255,209,0,0.15)_0%,transparent_70%)] blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(105,179,231,0.15)_0%,transparent_70%)] blur-[60px] pointer-events-none" />

      <div className="fade-up w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-10 shadow-2xl relative z-10 border border-white/10">
        <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-navy transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Volver
        </button>

        <div className="text-center mb-10 mt-4">
          <div className="relative inline-block group mb-6">
            <div className="absolute inset-0 bg-navy/10 blur-xl group-hover:bg-navy/20 transition-all rounded-full" />
            <img src="https://i.postimg.cc/zXGbj4g9/Whats-App-Image-2026-03-09-at-5-27-37-PM.jpg" alt="PUCMMCAR Logo" className="w-20 h-20 rounded-2xl object-cover shadow-xl relative z-10 border border-slate-100 dark:border-slate-800" />
          </div>
          <h1 className="text-4xl font-black text-navy dark:text-white italic tracking-tighter leading-none mb-2">PUCMM<span className="text-gold">CAR</span></h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Portal Estudiantil</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5 mb-8 border border-slate-200/50 dark:border-slate-700">
          <button type="button" onClick={() => setRole("passenger")} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${role === 'passenger' ? 'bg-white dark:bg-slate-700 text-navy shadow-lg shadow-black/5 dark:text-white' : 'text-slate-500'}`}>Pasajero</button>
          <button type="button" onClick={() => setRole("driver")} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${role === 'driver' ? 'bg-white dark:bg-slate-700 text-navy shadow-lg shadow-black/5 dark:text-white' : 'text-slate-500'}`}>Conductor</button>
        </div>

        <form onSubmit={showReset ? handleReset : handle} className="space-y-6">
          {!showReset ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-navy/60 uppercase tracking-[0.2em] ml-2">Correo Institucional</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-navy transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <input type="email" value={em} onChange={e => setEm(e.target.value)} placeholder="usuario@ce.pucmm.edu.do" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-navy dark:text-white outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-slate-400 placeholder:font-medium" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-black text-navy/60 uppercase tracking-[0.2em]">Contraseña</label>
                  <button type="button" onClick={() => setShowReset(true)} className="text-[9px] font-black text-navy hover:text-navy-light uppercase tracking-widest underline decoration-gold decoration-2 underline-offset-4">¿Olvidaste tu clave?</button>
                </div>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-navy transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </span>
                  <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-14 pr-14 text-sm font-bold text-navy dark:text-white outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 transition-all placeholder:text-slate-400" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy transition-colors">
                    {showPw ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center p-6 bg-navy/5 rounded-[2rem] border border-navy/10">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-navy dark:text-gold shadow-lg mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-sm font-black text-navy uppercase tracking-widest leading-none mb-2">Recuperar Acceso</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">Te enviaremos un correo institucional para restablecer tu contraseña.</p>
              </div>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-navy transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input type="email" value={em} onChange={e => setEm(e.target.value)} placeholder="usuario@ce.pucmm.edu.do" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-navy dark:text-white outline-none focus:border-navy/30 focus:ring-4 focus:ring-navy/5 transition-all" />
              </div>
              <button type="button" onClick={() => setShowReset(false)} className="text-[10px] font-black text-slate-400 hover:text-navy uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7" /></svg>
                Cancelar y volver
              </button>
            </div>
          )}

          {err && (
            <div className="bg-pucmm-red/10 border border-pucmm-red/20 rounded-2xl p-4 flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 text-pucmm-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-[11px] font-bold text-pucmm-red uppercase leading-tight">{err}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gold hover:bg-[#e6bd00] active:scale-[0.98] text-navy font-black text-sm uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-gold/20 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-navy border-t-transparent rounded-full animate-spin" />
            ) : (
              showReset ? "ENVIAR ENLACE" : "INICIAR SESIÓN"
            )}
            {!loading && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Uso Institucional Exclusivo</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} Pontificia Universidad Católica Madre y Maestra</p>
        </div>
      </div>
    </div>
  );
}
