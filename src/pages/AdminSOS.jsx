import React from "react";
import { useApp } from "../contexts/AppContext";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { Btn } from "../components/common/Btn";
import { PageHeader } from "../components/layout/PageHeader";

export function AdminSOS() {
  const { incidents, adminResolveIncident } = useApp();
  const open = incidents.filter(i => i.status === "pending").length;
  return (
    <div className="fade-up">
      <PageHeader title=" SOS / Incidentes" subtitle="Reportes de emergencia de la comunidad" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[["Total", incidents.length, "#0033A0"], ["Resueltos", incidents.filter(i => i.status === "resolved").length, "#16a34a"], ["Pendientes", open, open > 0 ? "#E4002B" : "#0033A0"]].map(([l, v, c]) => (
          <Card key={l} style={{ textAlign: "center" }}><div style={{ color: c, fontWeight: 900, fontSize: 28 }}>{v}</div><div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{l}</div></Card>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {incidents.length === 0 && (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 10, color: "#cbd5e1" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div style={{ fontWeight: 700 }}>Sin incidentes reportados</div>
          </Card>
        )}
        {incidents.map(inc => (
          <Card key={inc.id} style={{ borderLeft: `4px solid ${inc.status === "resolved" ? "#16a34a" : "#dc2626"}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ color: inc.status === "resolved" ? "#16a34a" : "#E4002B" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#0033A0" }}>{inc.userName} — {inc.type}</div>
                  <div style={{ color: "#64748b", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {inc.location}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 4 }}>ID: {inc.id.slice(0, 8)}...</div>
                </div>
              </div>
              <Badge color={inc.status === "resolved" ? "green" : "red"}>{inc.status === "resolved" ? "Resuelto" : "Pendiente"}</Badge>
            </div>
            {inc.status === "pending" && <Btn size="sm" variant="success" onClick={() => adminResolveIncident(inc.id)}>Marcar como resuelto</Btn>}
          </Card>
        ))}
      </div>
    </div>
  );
}
