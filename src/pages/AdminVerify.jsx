import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { Avatar } from "../components/common/Avatar";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { Btn } from "../components/common/Btn";
import { PageHeader } from "../components/layout/PageHeader";

export function AdminVerify() {
  const { pending, adminApprove, adminReject, isDark } = useApp();
  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const filtered = pending.filter(p => tab === "all" ? true : p.status === tab);
  const statusColor = { pending: "yellow", approved: "green", rejected: "red" };
  const statusLabel = { pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado" };

  return (
    <div className="fade-up">
      <PageHeader title="Verificaciones" subtitle="Revisa y aprueba las solicitudes de ID, licencias y vehículos" />
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[["pending", "Pendientes"], ["approved", "Aprobados"], ["rejected", "Rechazados"], ["all", "Todos"]].map(([v, l]) => {
          const count = v === "all" ? pending.length : pending.filter(p => p.status === v).length;
          return <button key={v} onClick={() => setTab(v)} style={{ padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, background: tab === v ? "#FFD100" : (isDark ? "#1e293b" : "#ffffff"), color: tab === v ? "#001F54" : (isDark ? "#94a3b8" : "#64748b"), border: `1px solid ${tab === v ? "#FFD100" : "#5BC2E7"}`, display: "flex", alignItems: "center", gap: 6 }}>{l}<span style={{ background: "rgba(0,0,0,0.1)", padding: "1px 6px", borderRadius: 10, fontSize: 10 }}>{count}</span></button>;
        })}
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <div style={{ fontWeight: 700 }}>Sin solicitudes</div>
            </Card>
          )}
          {filtered.map(p => (
            <Card key={p.id} style={{ cursor: "pointer", borderColor: selected?.id === p.id ? "#FFD100" : "#5BC2E7" }} onClick={() => setSelected(p)}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar user={{ name: p.userName }} size={40} />
                  <div><div style={{ fontWeight: 700 }}>{p.userName}</div><div style={{ color: "#64748b", fontSize: 12 }}>{p.userEmail}</div></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <Badge color={statusColor[p.status]}>{statusLabel[p.status]}</Badge>
                  <Badge color={p.type === "license" ? "blue" : p.type === "vehicle" ? "green" : "orange"}>
                    {p.type === "license" ? "Licencia" : p.type === "vehicle" ? "Vehículo" : "ID"}
                  </Badge>
                </div>
              </div>
              {p.type === "vehicle" && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#001F54", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
                  {p.brand} {p.model} &bull; <span style={{ color: "#FFD100" }}>{p.plate}</span>
                </div>
              )}
              {p.status === "pending" && (
                <div style={{ display: "flex", gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }} onClick={e => e.stopPropagation()}>
                  <Btn size="sm" variant="success" onClick={() => adminApprove(p.id)}>Aprobar</Btn>
                  <Btn size="sm" variant="danger" onClick={() => adminReject(p.id)}>Rechazar</Btn>
                </div>
              )}
            </Card>
          ))}
        </div>
        {selected && (
          <div style={{ width: 320, flexShrink: 0 }}>
            <Card>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Detalle de Solicitud</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <Avatar user={{ name: selected.userName }} size={64} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Nombre", selected.userName],
                  ["Email", selected.userEmail],
                  ["Tipo", selected.type === "license" ? "Licencia" : selected.type === "vehicle" ? "Vehículo" : "ID"],
                  ["Estado", statusLabel[selected.status]],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                    <span style={{ color: "#64748b" }}>{l}:</span>
                    <span style={{ fontWeight: 700, color: "#001F54" }}>{v}</span>
                  </div>
                ))}
                {selected.type === "vehicle" && (
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", marginTop: 6 }}>
                    <div style={{ color: "#64748b", fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginBottom: 6 }}>Info del Vehículo</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#001F54" }}>{selected.brand} {selected.model}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Placa: <span style={{ color: "#FFD100", fontWeight: 800 }}>{selected.plate}</span></div>
                  </div>
                )}
                
                {/* Visual placeholder for ID/License image */}
                <div style={{ width: "100%", height: 160, background: "#f1f5f9", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12, marginTop: 10, border: "1px dashed #cbd5e1" }}>
                   Vista previa del documento
                </div>
              </div>
              {selected.status === "pending" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                  <Btn variant="success" style={{ width: "100%", justifyContent: "center" }} onClick={() => { adminApprove(selected.id); setSelected(p => ({ ...p, status: "approved" })); }}>Aprobar Solicitud</Btn>
                  <Btn variant="danger" style={{ width: "100%", justifyContent: "center" }} onClick={() => { adminReject(selected.id); setSelected(p => ({ ...p, status: "rejected" })); }}>Rechazar Solicitud</Btn>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
