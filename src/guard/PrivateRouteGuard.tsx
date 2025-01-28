import { enqueueSnackbar } from "notistack";
import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRouteGuard = () => {
    const token = localStorage.getItem("token");
    const message = token ? "Bienvenido" : "Debe iniciar sesión";
    const variant = token ? "success" : "warning";

    const snackbarShown = useRef(false);

    useEffect(() => {
        if (!snackbarShown.current) {
            enqueueSnackbar(message, { variant });
            snackbarShown.current = true;
        }
    }, [message, variant]);

    return token ? <Outlet /> : <Navigate to="/login" replace />;
}