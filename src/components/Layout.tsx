import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#001F54] text-slate-200 font-sans flex flex-col">
      {/* Encabezado Móvil (Mobile Header) */}
      <div className="md:hidden block">
        <Header mobile />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Encabezado de Escritorio (Desktop Header) */}
        <div className="hidden md:block">
          <Header />
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
