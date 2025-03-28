import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Utils } from "../core/utilities/utils";

interface Props {
    onFailNavigateTo: string;
}

export const TokenPageGuard = ({ onFailNavigateTo }: Props) => {
    const [shouldNavigate, setShouldNavigate] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const hash = window.location.hash;

    useEffect(() => {
        if (errorMessage) {
            enqueueSnackbar(errorMessage, { variant: 'warning' });
        }
    }, [errorMessage]);

    const validateToken = () => {
        if (!hash.includes("?")) {
            setErrorMessage('Token inválido o expirado');
            setShouldNavigate(true);
            return;
        }

        const queryString = hash.split("?")[1];
        const params = new URLSearchParams(queryString);
        const tempToken = params.get("token");

        if (!tempToken) {
            setErrorMessage('Token inválido o expirado');
            setShouldNavigate(true);
            return;
        }

        try {
            const decodedToken = JSON.parse(atob(tempToken.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (decodedToken.exp && decodedToken.exp > currentTime) {
                const authToken = Utils.decodeJwt(tempToken).authToken;

                localStorage.setItem("tempToken", tempToken);
                localStorage.setItem("authToken", authToken);
                return;
            }

            setErrorMessage('Token inválido o expirado');
            setShouldNavigate(true);
        } catch (error) {
            setErrorMessage('Error al procesar el token');
            setShouldNavigate(true);
        }
    };

    useEffect(() => {
        validateToken();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (shouldNavigate) {
        return <Navigate to={onFailNavigateTo} replace />;
    }

    return <Outlet />;
};