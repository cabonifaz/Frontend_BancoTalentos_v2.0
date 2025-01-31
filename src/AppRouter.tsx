import { Login } from "./pages/public/Login";
import { PrivateRouter } from "./pages/private/PrivateRouter";
import { PrivateRouteGuard } from "./guard/PrivateRouteGuard";
import { BrowserRouter, Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "./core/components";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <RoutesWithNotFound>
                <Route path="/" element={<Navigate to={"/login"} />} />
                <Route path="/login" element={<Login />} />
                <Route element={<PrivateRouteGuard />}>
                    <Route path="/dashboard/*" element={<PrivateRouter />} />
                </Route>
            </RoutesWithNotFound>
        </BrowserRouter>
    );
}