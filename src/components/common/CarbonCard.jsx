import React from 'react';
import { Leaf, Info } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

/**
 * CarbonCard - Componente reutilizable de sostenibilidad para PUCMMCAR.
 * 
 * Calculado basado en el factor de emisión:
 * - Vehículo promedio de gasolina: 0.171 kg de CO₂/km
 * - Viaje compartido (carpooling): ~0.042 kg de CO₂/km por persona
 * - Ahorro neto estimado: ~0.13 kg de CO₂/km
 */

const CO2_SAVED_PER_KM = 0.13; // kg de CO₂ ahorrados por km en viaje compartido

export const CarbonCard = ({ totalKm = 0 }) => {
  const { isDark } = useApp();
  const kmClean = (totalKm ?? 0);
  const savedCO2 = kmClean * CO2_SAVED_PER_KM;
  const treesSaved = Math.floor(savedCO2 / 21); // ~21kg CO2 absorbidos por año por un árbol

  const ecoMessage = treesSaved > 0
    ? `Has salvado el equivalente a ${treesSaved} árbol(es) con tus viajes shared.`
    : "Cada km compartido reduce tu huella. ¡Empieza hoy!";

  const goal = 5; // kg CO2 milestone
  const progress = Math.min((savedCO2 / goal) * 100, 100);

  return (
    <div 
      style={{ 
        background: isDark ? "#1e293b" : "#ffffff", 
        border: `1px solid ${isDark ? "#334155" : "#f1f5f9"}` 
      }} 
      className="rounded-[2.5rem] p-8 shadow-lg overflow-hidden relative group transition-all hover:border-green-100 dark:hover:border-green-900/30 animate-fade-in"
    >
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-full blur-3xl opacity-60 pointer-events-none group-hover:scale-125 transition-transform duration-700" />

      <div className="relative flex flex-col md:flex-row items-center gap-8">
        <div className={`w-20 h-20 ${isDark ? 'bg-green-600/10' : 'bg-green-50'} rounded-3xl flex items-center justify-center shrink-0 shadow-inner`}>
          <Leaf className="text-green-600 dark:text-green-400 w-10 h-10 animate-bounce-slow" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <h3 className="text-navy dark:text-white font-black text-2xl italic tracking-tighter">Impacto Ecológico</h3>
            <div className="group/info relative">
              <Info size={14} className="text-slate-300 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[9px] rounded-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none font-bold italic shadow-xl z-50">
                Ahorro estimado de 0.13kg de CO₂ por cada km compartido.
              </div>
            </div>
          </div>

          <p className="text-green-600 dark:text-green-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">{ecoMessage}</p>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-black text-navy dark:text-white tracking-tighter italic">{savedCO2.toFixed(2)}</span>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">kg CO₂ ahorrados</span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>{Math.round(progress)}% de meta alcanzado</span>
              <span>Siguiente Logro: {goal}kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
