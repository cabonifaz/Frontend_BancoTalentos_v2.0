import { enqueueSnackbar } from "notistack";
import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Utils } from "../core/utilities/utils";

export const PrivateRouteGuard = () => {
    const token = localStorage.getItem("token") || undefined;
    const snackbarShown = useRef(false);

    useEffect(() => {
        if (!token && !snackbarShown.current) {
            enqueueSnackbar("Debe iniciar sesión", { variant: 'warning' });
            snackbarShown.current = true;
        }
    }, [token]);

    return Utils.isValidToken(token) ? <Outlet /> : <Navigate to="/login" replace />;
}