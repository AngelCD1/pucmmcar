import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { CAREERS } from "../constants";
import { Avatar } from "../components/common/Avatar";
import { Badge } from "../components/common/Badge";
import { Card } from "../components/common/Card";
import { Btn } from "../components/common/Btn";
import { Input } from "../components/common/Input";
import { Select } from "../components/common/Select";

export function AdminStudents() {
  const { students, adminToggleStudent, adminAddStudent, adminResetPassword } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", email: "", career: "", phone: "", role: "passenger" });
  const [createdStudent, setCreatedStudent] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showGenPw, setShowGenPw] = useState(false);
  const [pwCopied, setPwCopied] = useState(false);
  const [visiblePws, setVisiblePws] = useState({});
  const [copiedPws, setCopiedPws] = useState({});

  const togglePwVisible = (id) => setVisiblePws(p => ({ ...p, [id]: !p[id] }));
  const copyPw = (id, pw) => {
    navigator.clipboard?.writeText(pw);
    setCopiedPws(p => ({ ...p, [id]: true }));
    setTimeout(() => setCopiedPws(p => ({ ...p, [id]: false })), 2000);
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.studentId?.includes(q);
    const matchF = filter === "all"
      || (filter === "verified" && s.idVerified === true)
      || (filter === "pending" && s.idVerified === "pending")
      || (filter === "unverified" && !s.idVerified)
      || (filter === "inactive" && !s.active)
      || (filter === "temp_pw" && s.tempPassword && !s.passwordChanged);
    return matchQ && matchF;
  });

  const [hoveredRow, setHoveredRow] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    const result = await adminAddStudent(newForm);
    if (result) {
      setCreatedStudent(result);
      setShowGenPw(false);
      setPwCopied(false);
      setNewForm({ name: "", email: "", career: "", phone: "", role: "passenger" });
    }
    setAdding(false);
  };

  const copyPassword = () => {
    navigator.clipboard?.writeText(createdStudent.generatedPassword);
    setPwCopied(true);
    setTimeout(() => setPwCopied(false), 2000);
  };

  const copyAll = () => {
    navigator.clipboard?.writeText(
      `Hola ${createdStudent.name}, bienvenido/a a PUCMMCAR!\n\nTus credenciales:\nCorreo: ${createdStudent.email}\nContraseña temporal: ${createdStudent.generatedPassword}\nMatrícula: ${createdStudent.studentId}\n\nInicia sesión y cambia tu contraseña desde Perfil → Seguridad.`
    );
  };

  const pendingPwCount = students.filter(s => s.tempPassword && !s.passwordChanged).length;

  return (
    <div className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: "Space Grotesk", color: "#001F54" }}>Estudiantes</h1>
          <p style={{ color: "#6C757D", fontSize: 13, marginTop: 4 }}>{students.length} estudiantes registrados</p>
        </div>
        <Btn onClick={() => { setShowAdd(!showAdd); setCreatedStudent(null); }}>Agregar estudiante</Btn>
      </div>

      {pendingPwCount > 0 && (
        <div style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: "#FFD100" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div>
              <div style={{ color: "#FFD100", fontWeight: 700, fontSize: 13 }}>{pendingPwCount} estudiante(s) con contraseña temporal sin cambiar</div>
              <div style={{ color: "#6C757D", fontSize: 11 }}>La columna "Contraseña" muestra las claves para enviarles por correo</div>
            </div>
          </div>
          <button onClick={() => setFilter("temp_pw")} style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 8, padding: "6px 12px", color: "#FFD100", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>Ver solo estos</button>
        </div>
      )}

      {showAdd && (
        <Card style={{ marginBottom: 20, borderColor: "rgba(249,115,22,0.2)" }}>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Crear nuevo estudiante</div>

          {createdStudent && (
            <div style={{ background: "rgba(34,197,94,0.04)", border: "2px solid rgba(34,197,94,0.25)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#16a34a" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div>
                    <div style={{ color: "#003DA5", fontWeight: 800, fontSize: 14 }}>Estudiante creado exitosamente</div>
                    <div style={{ color: "#6C757D", fontSize: 11 }}>Comparte estas credenciales con {createdStudent.name.split(" ")[0]}</div>
                  </div>
                </div>
                <button onClick={() => setCreatedStudent(null)} style={{ background: "none", border: "none", color: "#6C757D", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Nombre", value: createdStudent.name, mono: false, copyable: false },
                  { label: "Matrícula", value: createdStudent.studentId, mono: true, copyable: true },
                  { label: "Correo institucional", value: createdStudent.email, mono: true, copyable: true },
                ].map(({ label, value, mono, copyable }) => (
                  <div key={label} style={{ background: "#f8f9fa", color: "#001F54", borderRadius: 10, padding: "10px 12px", border: "1px solid #5BC2E7" }}>
                    <div style={{ color: "#6C757D", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontFamily: mono ? "monospace" : "inherit", fontSize: 13, fontWeight: 600, color: "#001F54", wordBreak: "break-all" }}>{value}</span>
                      {copyable && <button onClick={() => navigator.clipboard?.writeText(value)} style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 6, padding: "3px 8px", color: "#FFD100", cursor: "pointer", fontSize: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                      </button>}
                    </div>
                  </div>
                ))}
                <div style={{ background: "#f8f9fa", color: "#001F54", borderRadius: 10, padding: "10px 12px", border: "2px solid rgba(249,115,22,0.3)" }}>
                  <div style={{ color: "#FFD100", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Contraseña temporal</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "monospace", fontSize: showGenPw ? 15 : 13, fontWeight: 900, color: "#FFD100", letterSpacing: showGenPw ? 2 : 0, flex: 1, wordBreak: "break-all" }}>
                      {showGenPw ? createdStudent.generatedPassword : "••••••••••"}
                    </span>
                    <button onClick={() => setShowGenPw(v => !v)} style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: 6, padding: "4px 8px", color: "#FFD100", cursor: "pointer", fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {showGenPw ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11-8 11-8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>}
                    </button>
                    <button onClick={copyPassword} style={{ background: pwCopied ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.1)", border: `1px solid ${pwCopied ? "rgba(34,197,94,0.3)" : "rgba(249,115,22,0.2)"}`, borderRadius: 6, padding: "4px 8px", color: pwCopied ? "#16a34a" : "#FFD100", cursor: "pointer", fontSize: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {pwCopied ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>}
                    </button>
                  </div>
                  <div style={{ color: "#6C757D", fontSize: 10, marginTop: 6 }}>También visible en la tabla hasta que la cambie</div>
                </div>
              </div>
              <button onClick={copyAll} style={{ width: "100%", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "11px 14px", color: "#3b82f6", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                Copiar mensaje completo para enviar por correo
              </button>
            </div>
          )}

          <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            <Input label="Nombre completo" value={newForm.name} onChange={e => setNewForm(p => ({ ...p, name: e.target.value }))} placeholder="María García" required />
            <Input label="Correo institucional" type="email" value={newForm.email} onChange={e => setNewForm(p => ({ ...p, email: e.target.value }))} placeholder="m_garcia@ce.pucmm.edu.do" required />
            <Select label="Carrera" value={newForm.career} onChange={e => setNewForm(p => ({ ...p, career: e.target.value }))}>
              <option value="">Seleccionar...</option>
              {CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Teléfono" value={newForm.phone} onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))} placeholder="829-555-0000" />
            <Select label="Rol" value={newForm.role} onChange={e => setNewForm(p => ({ ...p, role: e.target.value }))}>
              <option value="passenger">Pasajero</option>
              <option value="driver">Conductor</option>
            </Select>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <Btn type="submit" disabled={adding} style={{ width: "100%", justifyContent: "center" }}>
                {adding ? "Creando..." : "Crear estudiante"}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, email o matrícula..." style={{ flex: 1, minWidth: 200, background: "#ffffff", color: "#001F54", border: "1px solid #5BC2E7", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", fontFamily: "inherit" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["all", "Todos"], ["verified", "Verificados"], ["pending", "Pendientes"], ["unverified", "Sin verificar"], ["inactive", "Inactivos"], ["temp_pw", "Clave pendiente"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, background: filter === v ? "#FFD100" : "#ffffff", color: filter === v ? "#001F54" : "#6C757D", border: `1px solid ${filter === v ? "#FFD100" : "#5BC2E7"}` }}>{l}</button>
          ))}
        </div>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 900, borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Estudiante", "Matrícula", "Carrera", "Rol", "ID", "Licencia", "Contraseña temporal", "Estado", "Acción"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: h === "Contraseña temporal" ? "#FFD100" : "#64748b", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9", opacity: s.active ? 1 : 0.6, transition: "all 0.2s" }}
                  onMouseEnter={() => setHoveredRow(s.id)}
                  onMouseLeave={() => setHoveredRow(null)}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar user={s} size={30} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                        <div style={{ color: "#64748b", fontSize: 10 }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#475569", fontSize: 12, fontFamily: "monospace" }}>{s.studentId}</td>
                  <td style={{ padding: "12px 14px", color: "#475569", fontSize: 12 }}>{s.career}</td>
                  <td style={{ padding: "12px 14px" }}><Badge color={s.role === "driver" ? "blue" : "slate"}>{s.role === "driver" ? "Conductor" : "Pasajero"}</Badge></td>
                  <td style={{ padding: "12px 14px" }}><Badge color={s.idVerified === true ? "green" : s.idVerified === "pending" ? "yellow" : "red"}>{s.idVerified === true ? "OK" : s.idVerified === "pending" ? "Pendiente" : ""}</Badge></td>
                  <td style={{ padding: "12px 14px" }}><Badge color={s.licenseVerified === true ? "green" : s.licenseVerified === "pending" ? "yellow" : "slate"}>{s.licenseVerified === true ? "OK" : s.licenseVerified === "pending" ? "Pendiente" : "—"}</Badge></td>

                  {/* ── Columna contraseña temporal ── */}
                  <td style={{ padding: "12px 14px" }}>
                    {s.tempPassword && !s.passwordChanged ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#FFD100", letterSpacing: visiblePws[s.id] ? 1 : 0 }}>
                          {visiblePws[s.id] ? s.tempPassword : "••••••••"}
                        </span>
                        <button onClick={() => togglePwVisible(s.id)} title={visiblePws[s.id] ? "Ocultar" : "Mostrar"} style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: 5, padding: "2px 6px", color: "#FFD100", cursor: "pointer", fontSize: 12, lineHeight: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {visiblePws[s.id] ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11-8 11-8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>}
                        </button>
                        <button onClick={() => copyPw(s.id, s.tempPassword)} title="Copiar contraseña" style={{ background: copiedPws[s.id] ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.1)", border: `1px solid ${copiedPws[s.id] ? "rgba(34,197,94,0.3)" : "rgba(249,115,22,0.15)"}`, borderRadius: 5, padding: "2px 6px", color: copiedPws[s.id] ? "#16a34a" : "#FFD100", cursor: "pointer", fontSize: 11, lineHeight: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {copiedPws[s.id] ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>}
                        </button>
                      </div>
                    ) : s.passwordChanged ? (
                      <span style={{ color: "#003DA5", fontSize: 11, fontWeight: 600 }}>Ya la cambió</span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>—</span>
                    )}
                  </td>

                  <td style={{ padding: "12px 14px" }}><Badge color={s.active ? "green" : "red"}>{s.active ? "Activo" : "Suspendido"}</Badge></td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", opacity: hoveredRow === s.id ? 1 : 0.4 }}>
                      <button onClick={() => adminToggleStudent(s.id)} title={s.active ? "Suspender cuenta" : "Activar cuenta"} style={{ background: s.active ? "rgba(220,38,38,0.1)" : "rgba(34,197,94,0.1)", border: `1px solid ${s.active ? "rgba(220,38,38,0.2)" : "rgba(34,197,94,0.2)"}`, borderRadius: 8, padding: "6px 10px", color: s.active ? "#dc2626" : "#16a34a", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                        {s.active ? "Suspender" : "Activar"}
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de resetear la contraseña de ${s.name}?`)) {
                            adminResetPassword(s.id);
                          }
                        }} 
                        title="Resetear contraseña" 
                        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 8, padding: "6px 10px", color: "#3b82f6", cursor: "pointer", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}
                      >
                        Resetear
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No se encontraron estudiantes</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
