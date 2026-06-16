import {
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Utils } from "../../core/utilities/utils";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { Home, FileText, Link2, Users, LogOut, X, User } from "lucide-react";
import { DashboardContext } from "../../core/context/DashboardContext";

interface Props {
  children: ReactNode;
}

const railNav = [
  { icon: Home,     label: "Inicio",           path: "/dashboard/talentos" },
  { icon: FileText, label: "Requerimientos",    path: "/dashboard/requerimientos" },
  { icon: Users,    label: "Entrevistas",       path: "/dashboard/entrevistas" },
  { icon: Link2,    label: "Generar enlace",    path: "/dashboard/generarEnlaceRequerimiento" },
  { icon: User,     label: "Mi cuenta",         path: "/dashboard/mi-cuenta" },
] as const;

let sidebarOpenSnapshot = false;
let sidebarClickOpenSnapshot = false;
let lastPointerPosition: { x: number; y: number } | null = null;
let lastSidebarBounds: DOMRect | null = null;

export const Dashboard = ({ children }: Props) => {
  const [redirect, setRedirect]       = useState(false);
  const [isSidebarOpen, setSidebar]   = useState(sidebarOpenSnapshot);
  const [isClickOpen, setIsClickOpen] = useState(sidebarClickOpenSnapshot);
  const railRef                        = useRef<HTMLElement | null>(null);
  const sidebarRef                     = useRef<HTMLDivElement | null>(null);
  const token                          = localStorage.getItem("token");
  const navigate                       = useNavigate();
  const location                       = useLocation();

  const logout = () => {
    Utils.removeToken();
    setRedirect(true);
    enqueueSnackbar("Sesión cerrada", { variant: "success" });
  };

  const setSidebarOpen = (value: boolean) => {
    sidebarOpenSnapshot = value;
    setSidebar(value);
  };

  const setClickOpen = (value: boolean) => {
    sidebarClickOpenSnapshot = value;
    setIsClickOpen(value);
  };

  const openSidebar  = () => { setSidebarOpen(true); setClickOpen(true); };
  const closeSidebar = () => { setSidebarOpen(false); setClickOpen(false); };

  const rememberSidebarBounds = () => {
    const sidebarBounds = sidebarRef.current?.getBoundingClientRect();
    const railBounds = railRef.current?.getBoundingClientRect();

    lastSidebarBounds = sidebarBounds || railBounds || lastSidebarBounds;
  };

  const isPointerInsideSidebar = (x: number, y: number) => {
    rememberSidebarBounds();

    if (
      lastSidebarBounds &&
      x >= lastSidebarBounds.left &&
      x <= lastSidebarBounds.right &&
      y >= lastSidebarBounds.top &&
      y <= lastSidebarBounds.bottom
    ) {
      return true;
    }

    const pointerTarget = document.elementFromPoint(x, y);

    return (
      !!pointerTarget &&
      (railRef.current?.contains(pointerTarget) ||
        sidebarRef.current?.contains(pointerTarget))
    );
  };

  const closeSidebarIfPointerOutside = () => {
    const position = lastPointerPosition;
    if (!position) {
      closeSidebar();
      return;
    }

    if (!isPointerInsideSidebar(position.x, position.y)) {
      closeSidebar();
    }
  };

  const handleRailMouseEnter    = () => setSidebarOpen(true);
  const handleSidebarMouseLeave = (
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    lastPointerPosition = { x: event.clientX, y: event.clientY };
    requestAnimationFrame(closeSidebarIfPointerOutside);
  };

  const handleNav = (path: string) => {
    rememberSidebarBounds();
    navigate(path);
  };

  useEffect(() => {
    if (!isSidebarOpen) return;

    rememberSidebarBounds();

    const handlePointerMove = (event: PointerEvent) => {
      lastPointerPosition = { x: event.clientX, y: event.clientY };

      if (!isPointerInsideSidebar(event.clientX, event.clientY)) {
        closeSidebar();
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSidebarOpen]);

  useEffect(() => {
    if (!isSidebarOpen || !lastPointerPosition) return;

    const frame = requestAnimationFrame(() => {
      const { x, y } = lastPointerPosition || {};
      if (x === undefined || y === undefined) return;

      if (!isPointerInsideSidebar(x, y)) closeSidebar();
    });

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isSidebarOpen]);

  if (!token) return <Navigate to={"/login"} replace />;

  const fullName    = Utils.decodeJwt(token).fullname;
  const firstLetter = fullName.charAt(0);
  const rol         = Utils.decodeJwt(token).roles[0];

  if (redirect) return <Navigate to={"/login"} replace />;

  return (
    <DashboardContext.Provider value={{ openSidebar, userInfo: { fullName, firstLetter, rol } }}>

      {/* ─── Collapsed navigation rail (always visible) ──────────────────── */}
      <aside ref={railRef} className="fixed top-0 left-0 h-full w-16 bg-white border-r border-gray-200 z-40 flex flex-col select-none" onMouseEnter={handleRailMouseEnter}>

        {/* User avatar — triggers the expanded sidebar */}
        <div className="flex flex-col items-center pt-5 pb-3 border-b border-gray-200">
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

        {/* Quick-access nav icons */}
        <nav className="flex flex-col items-center pt-3 gap-0.5 flex-1">
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

        {/* Logout */}
        <div className="flex flex-col items-center pb-4 border-t border-gray-200 pt-2">
          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
          >
            <LogOut size={21} strokeWidth={1.75} />
          </button>
        </div>
      </aside>

      {/* ─── Backdrop (dims content when sidebar is open) ─────────────────── */}
      <div
        className={`fixed inset-0 z-[45] bg-black/40 transition-opacity duration-300 ${
          isSidebarOpen && isClickOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* ─── Expanded sidebar (slides over the rail from the left) ────────── */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onMouseLeave={handleSidebarMouseLeave}
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
          <button
            type="button"
            onClick={() => handleNav("/dashboard/mi-cuenta")}
            className="flex p-3 gap-3 items-center w-full rounded-lg hover:bg-gray-100 text-left text-sm text-gray-700 transition-colors"
          >
            <User size={18} strokeWidth={1.75} className="flex-shrink-0 text-gray-500" />
            Mi cuenta
          </button>
        </nav>

        {/* Branding and logout pinned at the bottom */}
        <div className="px-3 pb-4 flex-shrink-0 border-t pt-3">
          <div className="flex justify-center pb-3">
            <img
              src="/assets/fractal-logo-BDT.png"
              alt="Fractal"
              className="h-10 w-auto"
              style={{ maxWidth: 168 }}
            />
          </div>
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

      <div className="h-screen pl-16">
        <div className="h-full p-6">{children}</div>
      </div>

      {/* ─── Fractal branding — rendered after page content so DOM order never ─── */}
      {/* ─── buries it beneath later-painted positioned elements               ─── */}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[42] bg-white rounded-2xl shadow-md border border-gray-100 px-3 py-2 select-none opacity-100"
        aria-hidden="true"
      >
        <img
          src="/assets/fractal-logo-BDT.png"
          alt="Fractal"
          className="h-8 w-auto block"
          style={{ maxWidth: 132 }}
        />
      </div>
    </DashboardContext.Provider>
  );
};
