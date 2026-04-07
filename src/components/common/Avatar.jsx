import React, { useRef } from "react";
import { ini } from "../../utils";

export function Avatar({ user, size = 40, editable = false, onUpload }) {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpload && onUpload(ev.target.result);
    reader.readAsDataURL(f);
  };
  const sz = { width: size, height: size, borderRadius: size / 4, flexShrink: 0 };
  return (
    <div style={{ position: "relative", display: "inline-block", borderRadius: sz.borderRadius, overflow: "hidden" }} className="group">
      {user?.photo ? (
        <img src={user.photo} alt={user.name} style={{ ...sz, objectFit: "cover", border: "2px solid #FFD100" }} />
      ) : (
        <div style={{
          ...sz, background: "linear-gradient(135deg,#FFD100,#FFC000)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#0033A0", fontWeight: 900, fontSize: size * 0.35,
          border: "2px solid rgba(0,51,160,0.2)",
        }}>
          {ini(user?.name)}
        </div>
      )}
      {editable && (
        <div 
          onClick={() => fileRef.current?.click()} 
          style={{
            position: "absolute", inset: 0, 
            background: "rgba(0,31,84,0.6)", 
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer"
          }} 
          className="opacity-0 hover:opacity-100 transition-opacity duration-300 z-10"
        >
          <svg width={size * 0.3} height={size * 0.3} fill="none" viewBox="0 0 24 24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>
      )}
    </div>
  );
}
