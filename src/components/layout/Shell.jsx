import React from "react";
import { useApp } from "../../contexts/AppContext";
import { Avatar } from "../common/Avatar";
import { 
  Search, 
  Map as MapIcon, 
  Car, 
  Plus, 
  Star, 
  Activity as ActivityIcon, 
  User, 
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  AlertTriangle,
  Trophy
} from "lucide-react";

export function Shell({ children }) {
  const { isDark, setIsDark, user, logout, view, setView, setSosOpen, setUser, notifications } = useApp();
  
  const isDriver = user?.role === "driver";
  
  const nav = [
    { id: "search", label: "Buscar", icon: <Search size={22} /> },
    { id: "map", label: "Mapa", icon: <MapIcon size={22} /> },
    { id: "myrides", label: "Mis Viajes", icon: (
      <div className="relative">
        <Car size={22} />
        {notifications && Object.values(notifications).reduce((a, b) => a + b, 0) > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" />
        )}
      </div>
    )},
    ...(isDriver ? [{ id: "createride", label: "Publicar", icon: <Plus size={22} /> }] : []),
    { id: "rewards", label: "Premios", icon: <Star size={22} /> },
    { id: "leaderboard", label: "Ranking", icon: <Trophy size={22} /> },
    { id: "profile", label: "Perfil", icon: <User size={22} /> },
  ];



  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${isDark ? 'dark dark-mode' : 'light-mode'}`}>
      
      {/* ─── SIDEBAR (Desktop) ─── */}
      <aside className="sidebar hidden md:flex">
        <div className="sidebar-geo"></div>
        <div className="sidebar-geo2"></div>

        <div className="sb-brand">
          <div className="sb-logo">
            <div className="sb-logo-inner">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
                <rect x="9" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" className="text-navy-2"/>
                <circle cx="12" cy="21" r="1" fill="var(--gold)"/>
                <circle cx="20" cy="21" r="1" fill="var(--gold)"/>
              </svg>
            </div>
          </div>
          <span className="sb-wordmark">PUCMM<em>CAR</em></span>
        </div>

        <nav className="sb-nav">
          <span className="sb-section">Principal</span>

          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`sb-item ${view === item.id ? 'active' : ''}`}
            >
              <span className="sb-icon">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sb-foot">
          <div className="sb-darkmode" onClick={() => setIsDark(!isDark)}>
            {isDark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="18.36" x2="5.64" y2="19.78"/><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
            {isDark ? 'Modo Claro' : 'Modo Oscuro'}
          </div>

          <div className="sb-user">
            <div className="sb-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="sb-uinfo">
              <div className="sb-uname truncate">{user?.name?.split(' ')[0]}</div>
              <div className="sb-ubadge">
                <div className="badge-dot"></div>
                <span className="sb-upts">{user?.points || 0} pts &middot; Bronce</span>
              </div>
            </div>
            <div className="logout-btn" title="Cerrar sesión" onClick={logout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <main className="main flex-1 min-w-0 relative transition-all duration-300" style={{ background: 'var(--surface)' }}>
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 sticky top-0 z-30 backdrop-blur-md border-b border-slate-200 dark:border-slate-800" style={{ background: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)" }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-navy flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round"/>
                <rect x="9" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" className="text-navy dark:text-white"/>
              </svg>
            </div>
            <span className="font-bold text-navy dark:text-white">PUCMMCAR</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2.5 rounded-xl transition-all active:scale-90 border ${isDark ? 'bg-slate-800 border-slate-700 text-yellow-300' : 'bg-indigo-50 border-indigo-100 text-indigo-600'} shadow-sm`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Avatar user={user} size={32} />
            <button 
              onClick={logout} 
              className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full border border-red-100 dark:border-red-500/20 active:scale-90 transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="w-full max-w-5xl mx-auto p-4 md:p-10 pb-32 md:pb-10">
          {children}
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-4 py-3 pb-8 z-40 flex justify-between items-center shadow-lg" style={{ background: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)" }}>
          {nav.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                view === item.id 
                  ? (isDark ? 'text-[#FDB913] scale-110' : 'text-[#0A2342] scale-110') 
                  : 'text-gray-400'
              }`}
            >
              <div className={`p-2 rounded-2xl ${view === item.id ? (isDark ? 'bg-[#FDB913]/10' : 'bg-[#0A2342]/5') : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

    </div>
  );
}
