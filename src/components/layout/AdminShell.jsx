import React from "react";
import { useApp } from "../../contexts/AppContext";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Map as MapIcon, 
  Car, 
  AlertTriangle,
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";

export function AdminShell({ children }) {
  const { logout, view, setView, isDark, setIsDark, rides, incidents } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const nav = [
    { id: "admin_dash", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "admin_students", label: "Estudiantes", icon: <Users size={20} /> },
    { id: "admin_verify", label: "Verificaciones", icon: <ShieldCheck size={20} /> },
    { id: "admin_map", label: "Mapa en Vivo", icon: <MapIcon size={20} /> },
    { id: "admin_rides", label: "Viajes", icon: <Car size={20} /> },
    { id: "admin_sos", label: "SOS / Incidentes", icon: (
      <div className="relative">
        <AlertTriangle size={20} />
        {incidents.filter(i => i.status === "pending").length > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>
    )},
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${isDark ? 'bg-[#001435] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-pucmm-blue text-white sticky top-0 z-50 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <img 
            src="https://i.postimg.cc/zXGbj4g9/Whats-App-Image-2026-03-09-at-5-27-37-PM.jpg" 
            alt="Logo" 
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-black text-lg tracking-tight">PUCMM<span className="text-pucmm-blue-light">ADMIN</span></span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-800 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar (Desktop & Mobile Overlay) */}
      <aside className={`
        fixed inset-0 z-40 md:relative md:z-auto transition-transform duration-300 transform
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-72 bg-pucmm-blue-dark text-slate-300 flex flex-col border-r border-white/5 shadow-2xl
      `}>
        <div className="p-8 hidden md:flex items-center gap-3">
          <img 
            src="https://i.postimg.cc/zXGbj4g9/Whats-App-Image-2026-03-09-at-5-27-37-PM.jpg" 
            alt="Logo" 
            className="w-10 h-10 rounded-xl shadow-2xl"
          />
          <div className="flex flex-col">
            <span className="font-black text-xl text-white tracking-tight leading-tight">PUCMMCAR</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-pucmm-blue-light">Panel Central</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0">
          <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Navegación</p>
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                view === item.id 
                  ? 'bg-pucmm-blue text-white shadow-lg shadow-pucmm-blue/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-4 border-t border-white/5 bg-pucmm-blue-dark/50">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-pucmm-yellow rounded-xl flex items-center justify-center text-pucmm-blue shadow-lg font-black italic">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">Admin PUCMM</p>
              <p className="text-[10px] text-pucmm-blue-light font-bold uppercase tracking-wider">Superuser</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-xs font-bold"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              {isDark ? 'Claro' : 'Oscuro'}
            </button>
            <button 
              onClick={logout}
              className="px-4 py-3 bg-pucmm-red/10 text-pucmm-red rounded-xl hover:bg-pucmm-red hover:text-white transition-all group"
            >
              <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-20 md:pb-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
