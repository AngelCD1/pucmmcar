import React from "react";
import { useApp } from "../../contexts/AppContext";

export function Input({ label, ...props }) {
  const { isDark } = useApp();
  return (
    <div className="w-full">
      {label && <div className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>}
      <input 
        className={`w-full h-[52px] rounded-xl px-4 text-sm font-medium outline-none transition-all border-2
          ${isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-gold/50' : 'bg-slate-50 border-slate-100 text-navy focus:border-gold'}
          ${props.className || ''}`}
        style={props.style}
        {...props} 
      />
    </div>
  );
}
