import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { Utils } from "../core/utilities/utils";
import { getFirstAllowedPath } from "../core/config/navigation";

interface Props {
  /** IDs de rol autorizados a entrar a las rutas hijas. */
  allow: number[];
}

/**
 * Guard de autorización por rol. Se monta como ruta layout envolviendo las rutas
 * que requieren cierto rol. Asume que la autenticación ya fue validada aguas arriba
 * por PrivateRouteGuard.
 *
 * Si el usuario no tiene un rol permitido: muestra "No autorizado" y lo redirige a
 * su primera ruta accesible (típicamente Inicio). Si no tiene ninguna ruta accesible
 * (p. ej. roles 2 y 3 hoy), lo lleva a la pantalla "/dashboard/no-autorizado",
 * evitando así cualquier bucle de redirección.
 */
export const RoleGuard = ({ allow }: Props) => {
  const token = localStorage.getItem("token") || undefined;
  const roles = Utils.getUserRoles(token);
  const permitted = roles.some((r) => allow.includes(r));
  const snackbarShown = useRef(false);

  useEffect(() => {
    if (!permitted && !snackbarShown.current) {
      enqueueSnackbar("No autorizado", { variant: "error" });
      snackbarShown.current = true;
    }
  }, [permitted]);

  if (permitted) return <Outlet />;

  const fallback = getFirstAllowedPath(roles);
  return <Navigate to={fallback ?? "/dashboard/no-autorizado"} replace />;
};
