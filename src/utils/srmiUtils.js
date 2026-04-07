export const RANKS = [
  { id: "hierro", name: "Hierro", min: 0, max: 400, color: "text-gray-500", border: "border-gray-500", glow: "shadow-gray-500/20", icon: "🛡️" },
  { id: "bronce", name: "Bronce", min: 400, max: 800, color: "text-amber-700", border: "border-amber-700", glow: "shadow-amber-700/20", icon: "🥉" },
  { id: "plata", name: "Plata", min: 800, max: 1200, color: "text-slate-300", border: "border-slate-300", glow: "shadow-slate-300/30", icon: "🥈" },
  { id: "oro", name: "Oro", min: 1200, max: 2000, color: "text-yellow-400", border: "border-yellow-400", glow: "shadow-yellow-400/40", icon: "🥇" },
  { id: "platino", name: "Platino", min: 2000, max: 3000, color: "text-cyan-400", border: "border-cyan-400", glow: "shadow-cyan-400/50", icon: "💎" },
  { id: "esmeralda", name: "Esmeralda", min: 3000, max: 4500, color: "text-emerald-400", border: "border-emerald-400", glow: "shadow-emerald-400/50", icon: "💠" },
  { id: "diamante", name: "Diamante", min: 4500, max: 6000, color: "text-fuchsia-400", border: "border-fuchsia-400", glow: "shadow-fuchsia-400/60", icon: "✨" },
  { id: "maestro", name: "Maestro", min: 6000, max: 8000, color: "text-red-500", border: "border-red-500", glow: "shadow-red-500/70", icon: "🔥" },
  { id: "retador", name: "Retador", min: 8000, max: Infinity, color: "text-rose-400", border: "border-rose-400", glow: "shadow-rose-400/80 animate-pulse", icon: "👑" },
];

export function calculateRank(points = 0) {
  const pts = Math.max(0, points);
  const currentRank = [...RANKS].reverse().find(r => pts >= r.min) || RANKS[0];
  
  // Calculate Progress Output
  const isRetador = currentRank.id === "retador";
  const progressText = isRetador 
    ? "Top Ranking (Infinito)" 
    : `${pts} / ${currentRank.max} PM`;
  
  const percentage = isRetador 
    ? 100 
    : Math.min(100, Math.round(((pts - currentRank.min) / (currentRank.max - currentRank.min)) * 100));

  // Determine Division (IV to I) for ranks below Master
  let division = "";
  if (!["maestro", "retador"].includes(currentRank.id)) {
    if (percentage < 25) division = "IV";
    else if (percentage < 50) division = "III";
    else if (percentage < 75) division = "II";
    else division = "I";
  }

  return {
    ...currentRank,
    division,
    fullName: division ? `${currentRank.name} ${division}` : currentRank.name,
    progressText,
    percentage,
  };
}

export const MEDAL_CATALOG = [
  { id: "mov_1", name: "Primer Viaje", type: "movilidad", req: "Completar 1 viaje", icon: "Car", condition: (u) => (u.rides || 0) >= 1 },
  { id: "mov_50", name: "Viajero Constante", type: "movilidad", req: "50 viajes completados", icon: "Star", condition: (u) => (u.rides || 0) >= 50 },
  { id: "eco_100", name: "Eco Protector", type: "ecologico", req: "100kg CO2 ahorrado", icon: "Leaf", condition: (u) => (u.totalKm || 0) * 0.2 >= 100 },
  { id: "eco_500", name: "Héroe Verde", type: "ecologico", req: "500kg CO2 ahorrado", icon: "Trees", condition: (u) => (u.totalKm || 0) * 0.2 >= 500 },
  { id: "rep_5", name: "Excelencia", type: "reputacion", req: "Rating de 5.0 mantenido", icon: "Award", condition: (u) => (u.rating || 0) >= 4.9 },
  { id: "rep_nocancel", name: "Confiable", type: "reputacion", req: "100 viajes sin cancelar", icon: "ShieldCheck", condition: (u) => (u.rides || 0) >= 100 && (u.cancelledRides || 0) === 0 },
  { id: "act_10", name: "Semana Activa", type: "actividad", req: "10 viajes en 7 días", icon: "Flame", condition: (u) => (u.lastWeekRides || 0) >= 10 },
  { id: "act_3streak", name: "Racha", type: "actividad", req: "3 días seguidos", icon: "Zap", condition: (u) => (u.streak || 0) >= 3 },
];

export const POINTS_TABLE = {
  DRIVER_RIDE: 20,
  PASSENGER_RIDE: 12,
  PUNCTUALITY: 8,
  FULL_CAR: 40,
  CO2_KG: 2, // 2 points per KG saved
  FIVE_STAR: 10,
  CANCEL_PENALTY: -15,
  MAX_DAILY_POINTS: 150
};
