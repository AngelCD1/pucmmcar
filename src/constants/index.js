export const MAP_CONFIG = {
  center: [18.465, -69.932],
  zoom: 13,
  style: "main",
  tomtomKey: "weym3X4TbDKsaONl9n67jlbiAWy1ZND7",
};

export const MAP_SDK_URLS = {
  js: "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js",
  css: "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css",
};

export const PUCMM_LOCATIONS = [
  { name: "Edificio A1 (Administrativo)", address: "Av Simón Bolívar 87, Santo Domingo 32832", lat: 18.460833, lng: -69.932778 },
  { name: "Edificio B1 (Aulas/Orientación)", address: "Cerca de Calle Julia G. Madsen", lat: 18.459312, lng: -69.932918 },
  { name: "Edificio B2 (Docencia)", address: "Sur del Edificio B1", lat: 18.458765, lng: -69.932731 },
];

export const POPULAR_PLACES = [
  { name: "Blue Mall", lat: 18.4735, lng: -69.9402 },
  { name: "Agora Mall", lat: 18.4838, lng: -69.9395 },
  { name: "Sambil", lat: 18.4812, lng: -69.9168 },
  { name: "Downtown Center", lat: 18.4518, lng: -69.9572 },
  { name: "Parque Mirador Sur", lat: 18.4485, lng: -69.9468 },
  { name: "Plaza Central", lat: 18.4715, lng: -69.9318 },
  { name: "Jardín Botánico", lat: 18.4915, lng: -69.9442 },
  { name: "Piantini (Zona Comercial)", lat: 18.4725, lng: -69.9382 },
  { name: "Naco (Zona Residencial)", lat: 18.4795, lng: -69.9322 },
  { name: "Bella Vista mall", lat: 18.4525, lng: -69.9432 },
  { name: "Evaristo Morales", lat: 18.4685, lng: -69.9412 },
  { name: "Los Prados", lat: 18.4755, lng: -69.9512 },
  { name: "Alma Rosa", lat: 18.4855, lng: -69.8712 },
  { name: "San Isidro", lat: 18.4955, lng: -69.8212 },
  { name: "Arroyo Hondo", lat: 18.5055, lng: -69.9412 },
  { name: "El portal", lat: 18.4415, lng: -69.9242 },
  { name: "Honduras", lat: 18.4355, lng: -69.9312 },
  { name: "Kilometro 9 (Mella)", lat: 18.4855, lng: -69.9612 },
];

export const SOS_CONTACTS = [
  { name: "Seguridad PUCMM", phone: "809-535-0111", icon: "shield" },
  { name: "Emergencias (911)", phone: "911", icon: "ambulance" },
  { name: "Asistencia Vial", phone: "*444", icon: "wrench" },
  { name: "Familiares (ICE)", phone: "Contacto SOS", icon: "home" },
];
export const REWARDS_PASSENGER = [
  { id: 1, name: "20% Descuento", cost: 30, type: "discount", icon: "Percent", desc: "Aplícalo a tu próximo viaje programado." },
  { id: 2, name: "Media Tarifa", cost: 60, type: "discount", icon: "Tag", desc: "Paga solo el 50% de tu próximo viaje." },
  { id: 3, name: "Viaje Gratis", cost: 120, type: "ride", icon: "Car", desc: "Tu próximo viaje en ruta habitual es 100% gratis." },
  { id: 4, name: "Asiento VIP", cost: 150, type: "priority", icon: "Star", desc: "Prioridad al reservar en autos Premium." }
];

export const REWARDS_DRIVER = [
  { id: 1, name: "Bono Combustible 500", cost: 200, icon: "Fuel", desc: "Bono de RD$500 en estaciones afiliadas." },
  { id: 4, name: "Bono Combustible 1000", cost: 400, icon: "Fuel", desc: "Bono de RD$1,000 en estaciones afiliadas." },
  { id: 2, name: "Lavado de Auto", cost: 100, icon: "Droplet", desc: "Lavado exterior gratis en autodetailing asociado." },
  { id: 3, name: "Cambio de Aceite", cost: 300, icon: "Wrench", desc: "Descuento especial del 40% en cambio de aceite." }
];


export const CHALLENGES = [
  { id: "ch1", title: "Madrugador", desc: "Realiza 3 viajes antes de las 8:00 AM", reward: "150 pts", type: "passenger" },
  { id: "ch2", title: "Eco-Amigo", desc: "Viaja con el mismo conductor 5 veces", reward: "200 pts", type: "passenger" },
  { id: "ch3", title: "Capitán", desc: "Completa 10 viajes con 3+ pasajeros", reward: "500 pts", type: "driver" },
  { id: "ch4", title: "Guía PUCMM", desc: "Lleva un estudiante de nuevo ingreso", reward: "100 pts", type: "driver" },
];

export const LEVELS = [
  { name: "Bronce", minPoints: 0, color: "#64748b", icon: "🥉" },
  { name: "Plata", minPoints: 500, color: "#94a3b8", icon: "🥈" },
  { name: "Oro", minPoints: 1500, color: "#ffd700", icon: "🥇" },
  { name: "Platino", minPoints: 3000, color: "#69B3E7", icon: "💎" },
  { name: "Leyenda", minPoints: 5000, color: "#003DA5", icon: "👑" },
];

export const CAREERS = [
  "Ingeniería de Sistemas", "Ingeniería Civil", "Ingeniería Industrial", "Ingeniería Mecatrónica",
  "Medicina", "Derecho", "Administración de Empresas", "Arquitectura", "Diseño e Interiorismo",
  "Comunicación Social", "Psicología", "Economía", "Marketing", "Negocios Internacionales"
];

export const ADMIN_WHITELIST = [
  "admin1@pucmm.edu.do",
  "admin2@pucmm.edu.do",
  "admin@pucmm.edu.do"
];
