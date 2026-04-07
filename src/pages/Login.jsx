import React, { useState } from "react";
import { Landing } from "./Landing";
import { StudentLogin } from "./StudentLogin";
import { AdminLogin } from "./AdminLogin";

export function Login() {
  const [portal, setPortal] = useState("landing");
  if (portal === "student") return <StudentLogin onBack={() => setPortal("landing")} />;
  if (portal === "admin") return <AdminLogin onBack={() => setPortal("landing")} />;
  return <Landing onSelect={setPortal} />;
}
