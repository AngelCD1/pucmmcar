import { useState } from "react";
import {
  Car,
  Bell as BellIcon,
  Globe as GlobeIcon,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

export default function Header({ mobile }: { mobile?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  const { user } = useAuth(); // CORRECCIÓN: usar usuario real del contexto
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const toggleLang = () => setLang(lang === 'en' ? 'es' : 'en');

  if (mobile) {
    return (
      <header className="relative flex items-center justify-between p-4 bg-navy border-b border-navy-dark/20 z-50">
        <div className="flex items-center gap-2">
          <Car className="text-gold w-6 h-6" />
          <span className="text-lg font-black text-white italic tracking-tighter">PUCMMcar</span>
        </div>
        <div className="flex items-center gap-4">
          <div
            onClick={toggleLang}
            className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-sm cursor-pointer"
          >
            <GlobeIcon className="w-4 h-4" />
            <span className="uppercase">{lang}</span>
          </div>
          {/* CORRECCIÓN: iniciales dinámicas desde AuthContext */}
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy font-black text-sm shadow-lg shadow-gold/20">
            {user?.initials ?? "?"}
          </div>
          <button
            className="text-slate-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#1e293b] border-b border-slate-800 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-white font-black hover:text-gold transition-colors py-2 uppercase tracking-widest text-xs">
              {t('findRide')}
            </Link>
            <Link to="/driver-console" onClick={() => setMenuOpen(false)} className="text-navy-light font-black hover:text-white transition-colors py-2 uppercase tracking-widest text-xs">
              {t('postTrip')}
            </Link>
            <Link to="/my-rides" onClick={() => setMenuOpen(false)} className="text-navy-light font-black hover:text-white transition-colors py-2 uppercase tracking-widest text-xs">
              {t('myRides')}
            </Link>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-navy border-b border-navy-dark/10 shadow-lg">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Car className="text-gold w-6 h-6" />
          <span className="text-lg font-black text-white italic tracking-tighter">PUCMMcar</span>
        </div>
        <nav className="flex items-center gap-8 font-black text-[10px] uppercase tracking-[0.2em]">
          <Link to="/dashboard" className="text-white hover:text-gold transition-colors">{t('findRide')}</Link>
          <Link to="/driver-console" className="text-navy-light hover:text-white transition-colors">{t('postTrip')}</Link>
          <Link to="/my-rides" className="text-navy-light hover:text-white transition-colors">{t('myRides')}</Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div
          onClick={toggleLang}
          className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700 text-sm hover:bg-slate-800 cursor-pointer transition-colors"
        >
          <GlobeIcon className="w-4 h-4" />
          <span className="uppercase">{lang}</span>
        </div>

        {/* CORRECCIÓN: notificaciones con estado de alternancia */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative text-slate-400 hover:text-white transition-colors"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-8 w-72 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-xl p-4 z-50">
              <p className="text-white font-bold mb-3 text-sm">Notificaciones</p>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-200">Ana Martinez confirmó tu reserva</p>
                    <p className="text-slate-500 text-xs">Hace 5 min</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-200">Tu viaje del Viernes está completo</p>
                    <p className="text-slate-500 text-xs">Hace 2 horas</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CORRECCIÓN: datos de usuario dinámicos desde AuthContext */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] font-black text-white uppercase tracking-wider">{user?.name ?? "—"}</div>
            <div className="text-[9px] font-bold text-pucmm-blue-light uppercase tracking-widest">{user?.studentId ?? "—"}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-pucmm-yellow flex items-center justify-center text-pucmm-blue font-black shadow-lg shadow-pucmm-yellow/10">
            {user?.initials ?? "?"}
          </div>
        </div>
      </div>
    </header>
  );
}
