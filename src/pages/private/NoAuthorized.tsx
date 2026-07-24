import { ShieldX, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { Utils } from "../../core/utilities/utils";
import { getFirstAllowedPath } from "../../core/config/navigation";

/**
 * Pantalla mostrada cuando un usuario autenticado no tiene ningún módulo permitido
 * (o es redirigido aquí por el RoleGuard). Se renderiza standalone, sin la sidebar
 * del Dashboard, porque el usuario no tiene acceso a la aplicación.
 */
export const NoAuthorized = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || undefined;
  const fallback = getFirstAllowedPath(Utils.getUserRoles(token));

  const logout = () => {
    Utils.removeToken();
    enqueueSnackbar("Sesión cerrada", { variant: "success" });
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldX className="w-7 h-7 text-red-500" strokeWidth={1.75} />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">No autorizado</h1>
        <p className="text-sm text-gray-500">
          Tu rol no tiene acceso a esta sección del Banco de Talentos. Si crees
          que es un error, contacta al administrador.
        </p>
        <div className="flex flex-col gap-2 w-full mt-2">
          {fallback && (
            <button
              type="button"
              onClick={() => navigate(fallback, { replace: true })}
              className="btn btn-primary w-full"
            >
              Ir al inicio
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full rounded-lg py-2 px-4 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoAuthorized;
