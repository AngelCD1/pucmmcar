import React from "react";
import { useApp } from "../contexts/AppContext";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { PageHeader } from "../components/layout/PageHeader";

export function AdminRides() {
  const { rides } = useApp();
  return (
    <div className="fade-up">
      <PageHeader title="Todos los Viajes" subtitle={`${rides.length} viajes en el sistema`} />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Conductor", "Ruta", "Fecha / Hora", "Pasajeros", "Precio", "Estado"].map(h => <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rides.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No hay viajes registrados</td></tr>}
              {rides.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px" }}><div style={{ fontWeight: 600, color: "#001F54" }}>{r.driverName}</div><div style={{ color: "#64748b", fontSize: 11 }}>{r.vehicle}</div></td>
                  <td style={{ padding: "12px 14px", color: "#475569", fontSize: 12 }}>{r.from} → {r.to}</td>
                  <td style={{ padding: "12px 14px", color: "#475569", fontSize: 12 }}>{r.date} {r.time}</td>
                  <td style={{ padding: "12px 14px", color: "#475569", fontSize: 12 }}>{r.passengers?.length || 0}/{r.seats}</td>
                  <td style={{ padding: "12px 14px", color: "#FFD100", fontWeight: 700 }}>RD$ {r.price}</td>
                  <td style={{ padding: "12px 14px" }}><Badge color={r.status === "active" ? "green" : r.status === "completed" ? "blue" : "red"}>{r.status.toUpperCase()}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
