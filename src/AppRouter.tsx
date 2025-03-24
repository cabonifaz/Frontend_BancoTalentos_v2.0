import { Login } from "./pages/public/Login";
import { PrivateRouter } from "./pages/private/PrivateRouter";
import { PrivateRouteGuard } from "./guard/PrivateRouteGuard";
import { HashRouter as Router, Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "./core/components";
import { FormPostulante } from "./pages/public/FormPostulante";
import { TokenPageGuard } from "./guard/TokenPageGuard";

export const AppRouter = () => {
    return (
        <Router>
            <RoutesWithNotFound>
                <Route path="/" element={<Navigate to={"/login"} />} />
                <Route path="/login" element={<Login />} />
                <Route element={<TokenPageGuard onFailNavigateTo="/login" />}>
                    <Route path="/formPostulante" element={<FormPostulante />} />
                </Route>
                <Route element={<PrivateRouteGuard />}>
                    <Route path="/dashboard/*" element={<PrivateRouter />} />
                </Route>
            </RoutesWithNotFound>
        </Router>
    );
}