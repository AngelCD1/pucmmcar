import { useEffect } from "react";

export function useMapSDK(mapRef, onReady, deps = []) {
  useEffect(() => {
    const load = () => {
      // TomTom Maps CSS
      if (!document.getElementById("tt-css")) {
        const link = document.createElement("link");
        link.id = "tt-css"; link.rel = "stylesheet";
        link.href = "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css";
        document.head.appendChild(link);
      }
      
      const init = () => {
        if (window.tt) {
          onReady(window.tt);
        }
      };

      if (window.tt) init();
      else {
        const existing = document.getElementById("tt-js");
        if (existing) {
          existing.addEventListener("load", init);
          return;
        }
        // TomTom Maps JS
        const s = document.createElement("script");
        s.id = "tt-js";
        s.src = "https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js";
        s.onload = init;
        document.head.appendChild(s);
      }
    };
    if (mapRef.current) load();
  }, deps);
}
