import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { Utils } from "../core/utilities/utils";
import { getFirstAllowedPath, isRouteAllowed } from "../core/config/navigation";

/**
 * Guard de autorización por ruta. Asume que la sesión ya fue validada aguas arriba
 * por PrivateRouteGuard. Valida la ruta actual contra las rutas permitidas del token
 * (provenientes de la base de datos); las rutas hijas se resuelven por prefijo.
 *
 * Si la ruta no está permitida, redirige al primer módulo accesible del usuario, o a
 * "/dashboard/no-autorizado" si no tiene ninguno (evitando bucles de redirección).
 */
export const RouteGuard = () => {
  const token = localStorage.getItem("token") || undefined;
  const routes = Utils.getUserRoutes(token);
  const location = useLocation();
  const permitted = isRouteAllowed(location.pathname, routes);
  const snackbarShown = useRef(false);

  useEffect(() => {
    if (permitted) {
      snackbarShown.current = false;
      return;
    }
    if (!snackbarShown.current) {
      enqueueSnackbar("No autorizado", { variant: "error" });
      snackbarShown.current = true;
    }
  }, [permitted, location.pathname]);

  if (permitted) return <Outlet />;

  const fallback = getFirstAllowedPath(routes);
  return <Navigate to={fallback ?? "/dashboard/no-autorizado"} replace />;
};
