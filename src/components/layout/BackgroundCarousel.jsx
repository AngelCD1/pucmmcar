import React, { useState, useEffect } from "react";

export function BackgroundCarousel({ isLightOverlay = false }) {
  const [idx, setIdx] = useState(0);
  const images = [
    "https://i.postimg.cc/K8Q5YBhV/66b54f6898c26-06f3817d-fachada-pucmm-jpg.webp",
    "https://i.postimg.cc/fy4cPvYD/8-Actualidad-14-1p01.webp",
    "https://i.postimg.cc/qq8sHCGW/servicio-cafe-santo-domingo-csd-1.webp"
  ];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {images.map((img, i) => (
        <div key={img} style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center",
          opacity: i === idx ? 0.4 : 0, transition: "opacity 1.5s ease-in-out",
        }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: isLightOverlay ? "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.95))" : "linear-gradient(to bottom, rgba(0,61,165,0.85), rgba(0,61,165,0.98))" }} />
    </div>
  );
}
