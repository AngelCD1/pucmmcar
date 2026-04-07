export const genId = () => Math.random().toString(36).substr(2, 9);

export const genPassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  return pw;
};

export const now = () => new Date().toLocaleString();

export const formatFriendlyDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-DO", { day: "numeric", month: "short" });
};

export const genStudentId = () => `101${Math.floor(10000 + Math.random() * 90000)}`;

export const genDiscountCode = (name) => {
  const prefix = name.split(" ")[0].toUpperCase().slice(0, 4);
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `PUCMM-${prefix}-${suffix}`;
};

export const ini = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";

export const getMapTile = () => ({
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
