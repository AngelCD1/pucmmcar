import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { Btn } from "../components/common/Btn";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { PageHeader } from "../components/layout/PageHeader";

export function Verify() {
  const { user, verifyLicense, verifyStudentId } = useApp();
  const [licFile, setLicFile] = useState(null);
  const [idFile, setIdFile] = useState(null);

  const FileUpload = ({ file, onFile, icon, label }) => (
    <div style={{ border: `2px dashed ${file ? "rgba(34,197,94,0.4)" : "#1e293b"}`, borderRadius: 12, padding: 24, textAlign: "center", position: "relative", cursor: "pointer" }}>
      <input type="file" accept="image/*,.pdf" onChange={e => onFile(e.target.files[0])} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 2 }} />
      {file ? <div><div style={{ color: "#003DA5", fontWeight: 700 }}> {file.name}</div></div> : <><div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div><div style={{ color: "#6C757D", fontSize: 13 }}>{label}</div></>}
    </div>
  );

  return (
    <div style={{ maxWidth: 600 }} className="fade-up">
      <PageHeader title="Verificación de Identidad" />
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: "#003DA5" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><line x1="15" y1="8" x2="19" y2="8"></line><line x1="15" y1="12" x2="19" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>
            </div>
            <div><div style={{ fontWeight: 700 }}>ID Estudiantil PUCMM</div><div style={{ color: "#6C757D", fontSize: 12 }}>Foto del carnet universitario vigente</div></div>
          </div>
          <Badge color={user?.idVerified === true ? "green" : user?.idVerified === "pending" ? "yellow" : "red"}>{user?.idVerified === true ? "Verificado" : user?.idVerified === "pending" ? "En revisión" : "No verificado"}</Badge>
        </div>
        {user?.idVerified !== true && user?.idVerified !== "pending" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <FileUpload file={idFile} onFile={setIdFile} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>} label="Haz clic para subir foto del carnet" />
            <Btn disabled={!idFile} style={{ width: "100%", justifyContent: "center", opacity: idFile ? 1 : 0.4 }} onClick={() => { if (idFile) verifyStudentId(); }}>Enviar para verificación</Btn>
          </div>
        )}
      </Card>
      {user?.role === "driver" && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ color: "#003DA5" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><line x1="15" y1="8" x2="19" y2="8"></line><line x1="15" y1="12" x2="19" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>
              </div>
              <div><div style={{ fontWeight: 700 }}>Licencia de Conducir</div></div>
            </div>
            <Badge color={user?.licenseVerified === true ? "green" : user?.licenseVerified === "pending" ? "yellow" : "red"}>{user?.licenseVerified === true ? "Verificada" : user?.licenseVerified === "pending" ? "En revisión" : "Requerida"}</Badge>
          </div>
          {user?.licenseVerified !== true && user?.licenseVerified !== "pending" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FileUpload file={licFile} onFile={setLicFile} icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>} label="Subir licencia de conducir" />
              <Btn disabled={!licFile} style={{ width: "100%", justifyContent: "center", opacity: licFile ? 1 : 0.4 }} onClick={() => { if (licFile) verifyLicense(); }}>Enviar licencia</Btn>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
