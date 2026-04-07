import React, { useEffect, useState } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Toast } from "./components/common/Toast";
import { ADMIN_WHITELIST } from "./constants";
import { SOSModal } from "./components/modals/SOSModal";
import { RatingModal } from "./components/modals/RatingModal";
import { Shell } from "./components/layout/Shell";
import { AdminShell } from "./components/layout/AdminShell";

// Importaciones de Páginas
import { Login } from "./pages/Login";
import { Search } from "./pages/Search";
import { MyRides } from "./pages/MyRides";
import { CreateRide } from "./pages/CreateRide";
import { Rewards } from "./pages/Rewards";
import { Profile } from "./pages/Profile";
import { Verify } from "./pages/Verify";
import { Leaderboard } from "./pages/Leaderboard";
import { MapView } from "./pages/MapView";

import { LiveTrack } from "./pages/LiveTrack";
import { ForceChangePassword } from "./pages/ForceChangePassword";
import { Activity } from "./pages/Activity";

// Importaciones de Páginas de Administración
import { AdminDash } from "./pages/AdminDash";
import { AdminStudents } from "./pages/AdminStudents";
import { AdminVerify } from "./pages/AdminVerify";
import { AdminMapView } from "./pages/AdminMapView";
import { AdminRides } from "./pages/AdminRides";
import { AdminSOS } from "./pages/AdminSOS";

function AppRouter({ onCompleteRide }) {
  const { user, view, isDark, setView } = useApp();

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark-mode", "bg-slate-950");
      document.body.classList.remove("light-mode", "bg-slate-50");
    } else {
      document.body.classList.add("light-mode", "bg-slate-50");
      document.body.classList.remove("dark-mode", "bg-slate-950");
    }
  }, [isDark]);

  // 🛡️ SEGURIDAD: Guardián de Roles
  useEffect(() => {
    if (!user) return;
    
    const isAdminView = view.startsWith("admin_");
    const isAdmin = user.role === "admin" && ADMIN_WHITELIST.includes(user.email);

    if (isAdmin && !isAdminView) {
      // Si es admin autorizado pero está en una vista de usuario, forzar al dashboard admin
      setView("admin_dash");
    } else if (!isAdmin && isAdminView) {
      // Si NO es admin autorizado pero intenta ver administración, forzar al buscador
      setView("search");
    }
  }, [user?.role, view]);

  if (!user) {
    return <Login />;
  }

  // Enrutamiento de Administración
  if (user.role === "admin") {
    const renderAdminPage = () => {
      switch (view) {
        case "admin_dash": return <AdminDash />;
        case "admin_students": return <AdminStudents />;
        case "admin_verify": return <AdminVerify />;
        case "admin_map": return <AdminMapView />;
        case "admin_rides": return <AdminRides />;
        case "admin_sos": return <AdminSOS />;
        default: return <AdminDash />;
      }
    };
    return <AdminShell>{renderAdminPage()}</AdminShell>;
  }

  // Vista de Cambio de Contraseña Forzada
  if (view === "force_password") {
    return <ForceChangePassword />;
  }

  // Enrutamiento de Estudiantes
  const renderPage = () => {
    switch (view) {
      case "search": return <Search />;
      case "myrides": return <MyRides />;
      case "createride": return <CreateRide />;
      case "rewards": return <Rewards />;
      case "activity": return <Activity />;
      case "leaderboard": return <Leaderboard />;
      case "profile": return <Profile />;
      case "verify": return <Verify />;
      case "map": return <MapView />;
      case "livetrack": return <LiveTrack onFinishRide={onCompleteRide} />;
      default: return <Search />;
    }
  };

  return <Shell>{renderPage()}</Shell>;
}

export default function App() {
  const [ratingData, setRatingData] = useState(null);

  return (
    <AppProvider>
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
      <Toast />
      <SOSModal />
      <RatingModal 
        open={!!ratingData} 
        rideId={ratingData?.rideId} 
        targetId={ratingData?.targetId} 
        targetName={ratingData?.targetName} 
        onClose={() => setRatingData(null)} 
      />
      <AppRouter onCompleteRide={(data) => setRatingData(data)} />
    </AppProvider>
  );
}
