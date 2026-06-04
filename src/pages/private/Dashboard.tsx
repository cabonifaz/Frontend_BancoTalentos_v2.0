import { ReactNode, useState } from "react";
import { Utils } from "../../core/utilities/utils";
import { Navigate, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { Home, FileText, Link2, Users, LogOut, X } from "lucide-react";
import { DashboardContext } from "../../core/context/DashboardContext";

interface Props {
  children: ReactNode;
}

const railNav = [
  { icon: Home,     label: "Inicio",           path: "/dashboard/talentos" },
  { icon: FileText, label: "Requerimientos",    path: "/dashboard/requerimientos" },
  { icon: Users,    label: "Entrevistas",       path: "/dashboard/entrevistas" },
  { icon: Link2,    label: "Generar enlace",    path: "/dashboard/generarEnlaceRequerimiento" },
] as const;

export const Dashboard = ({ children }: Props) => {
  const [redirect, setRedirect]       = useState(false);
  const [isSidebarOpen, setSidebar]   = useState(false);
  const token                          = localStorage.getItem("token");
  const navigate                       = useNavigate();

  if (!token) return <Navigate to={"/login"} replace />;

  const fullName    = Utils.decodeJwt(token).fullname;
  const firstLetter = fullName.charAt(0);
  const rol         = Utils.decodeJwt(token).roles[0];

  const logout = () => {
    Utils.removeToken();
    setRedirect(true);
    enqueueSnackbar("Sesión cerrada", { variant: "success" });
  };

  const openSidebar  = () => setSidebar(true);
  const closeSidebar = () => setSidebar(false);

  const handleNav = (path: string) => {
    closeSidebar();
    navigate(path);
  };

  if (redirect) return <Navigate to={"/login"} replace />;

  return (
    <DashboardContext.Provider value={{ openSidebar, userInfo: { fullName, firstLetter, rol } }}>

      {/* ─── Collapsed navigation rail (always visible) ──────────────────── */}
      <aside className="fixed top-0 left-0 h-full w-16 bg-white border-r border-gray-200 z-40 flex flex-col select-none">

        {/* Quick-access nav icons */}
        <nav className="flex flex-col items-center pt-5 gap-1 flex-1">
          {railNav.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              title={label}
              className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            >
              <Icon size={21} strokeWidth={1.75} />
            </button>
          ))}
        </nav>

        {/* User avatar — triggers the expanded sidebar */}
        <div className="flex flex-col items-center pb-5">
          <button
            type="button"
            onClick={openSidebar}
            title="Perfil y menú"
            className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="rounded-full flex items-center justify-center bg-zinc-200 text-sm font-semibold h-9 w-9 text-gray-700">
              {firstLetter}
            </span>
          </button>
        </div>
      </aside>

      {/* ─── Backdrop (dims content when sidebar is open) ─────────────────── */}
      <div
        className={`fixed inset-0 z-[45] bg-black/40 transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* ─── Expanded sidebar (slides over the rail from the left) ────────── */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* User info header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="rounded-full flex items-center justify-center bg-zinc-200 text-xl font-medium h-11 w-11 flex-shrink-0 text-gray-700">
              {firstLetter}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate text-gray-800">{fullName}</p>
              <p className="text-xs text-gray-500">{rol}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 ml-2"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col py-3 px-3 gap-0.5 flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleNav("/dashboard/talentos")}
            className="flex p-3 gap-3 items-center w-full rounded-lg hover:bg-gray-100 text-left text-sm text-gray-700 transition-colors"
          >
            <Home size={18} strokeWidth={1.75} className="flex-shrink-0 text-gray-500" />
            Inicio
          </button>
          <button
            type="button"
            onClick={() => handleNav("/dashboard/requerimientos")}
            className="flex p-3 gap-3 items-center w-full rounded-lg hover:bg-gray-100 text-left text-sm text-gray-700 transition-colors"
          >
            <FileText size={18} strokeWidth={1.75} className="flex-shrink-0 text-gray-500" />
            Requerimientos
          </button>
          <button
            type="button"
            onClick={() => handleNav("/dashboard/entrevistas")}
            className="flex p-3 gap-3 items-center w-full rounded-lg hover:bg-gray-100 text-left text-sm text-gray-700 transition-colors"
          >
            <Users size={18} strokeWidth={1.75} className="flex-shrink-0 text-gray-500" />
            Entrevistas
          </button>
          <button
            type="button"
            onClick={() => handleNav("/dashboard/generarEnlaceRequerimiento")}
            className="flex p-3 gap-3 items-center w-full rounded-lg hover:bg-gray-100 text-left text-sm text-gray-700 transition-colors"
          >
            <Link2 size={18} strokeWidth={1.75} className="flex-shrink-0 text-gray-500" />
            Generar enlace
          </button>
        </nav>

        {/* Logout pinned at the bottom */}
        <div className="px-3 pb-4 flex-shrink-0 border-t pt-2">
          <button
            type="button"
            onClick={logout}
            className="flex p-3 gap-3 items-center w-full rounded-lg hover:bg-red-50 text-left text-sm text-red-600 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.75} className="flex-shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {children}

      {/* ─── Fractal branding — rendered after page content so DOM order never ─── */}
      {/* ─── buries it beneath later-painted positioned elements               ─── */}
      <div
        className="fixed bottom-4 right-4 z-[42] bg-white rounded-2xl shadow-md border border-gray-100 px-3 py-2 pointer-events-none select-none"
        aria-hidden="true"
      >
        <img
          src="/assets/fractal-logo-BDT.png"
          alt="Fractal"
          className="h-6 w-auto block"
          style={{ maxWidth: 88 }}
        />
      </div>
    </DashboardContext.Provider>
  );
};
