import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, User, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProfileSidebar() {
  const { t } = useLanguage();

  const navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('driverConsole'), path: '/driver-console', icon: Car },
    { name: t('myProfile'), path: '/profile', icon: User },
    { name: t('settings'), path: '/settings', icon: Settings },
  ];

  return (
    <div className="bg-pucmm-blue-dark rounded-2xl p-4 md:p-6 flex flex-col items-center border border-white/10 shadow-xl shadow-black/20">
      <div className="hidden md:flex flex-col items-center w-full">
        <div className="w-24 h-24 rounded-full bg-pucmm-yellow flex items-center justify-center text-pucmm-blue text-3xl font-black mb-4 shadow-lg shadow-pucmm-yellow/20 border-4 border-pucmm-blue">
          JB
        </div>
        <h2 className="text-xl font-bold text-white">Jonathan Báez</h2>
        <p className="text-slate-400 text-sm mb-3">ID: 10161606</p>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 mb-8">
          {t('verifiedStudent')}
        </span>
      </div>

      <nav className="w-full flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-colors font-medium whitespace-nowrap",
                isActive 
                  ? "bg-white/10 text-pucmm-yellow shadow-inner" 
                  : "text-pucmm-blue-light hover:text-white hover:bg-white/5"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm md:text-base">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="w-full mt-2 md:mt-4 pt-2 md:pt-4 border-t border-slate-800 hidden md:block">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors w-full font-medium">
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}
