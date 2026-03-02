import { Login } from "./pages/public/Login";
import { PrivateRouteGuard } from "./guard/PrivateRouteGuard";
import {
  HashRouter as Router,
  Navigate,
  Route,
} from "react-router-dom";
import { Loading, RoutesWithNotFound } from "./core/components";
import { TokenPageGuard } from "./guard/TokenPageGuard";
import { Suspense, lazy } from "react";

const PrivateRouter = lazy(() =>
  import("./pages/private/PrivateRouter").then((m) => ({
    default: m.PrivateRouter,
  })),
);
const FormPostulante = lazy(() =>
  import("./pages/public/FormPostulante").then((m) => ({
    default: m.FormPostulante,
  })),
);

export const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <RoutesWithNotFound>
          <Route path="/" element={<Navigate to={"/login"} />} />
          <Route path="/login" element={<Login />} />
          <Route
            element={<TokenPageGuard onFailNavigateTo="/login" />}
          >
            <Route
              path="/formPostulante"
              element={<FormPostulante />}
            />
          </Route>
          <Route element={<PrivateRouteGuard />}>
            <Route path="/dashboard/*" element={<PrivateRouter />} />
          </Route>
        </RoutesWithNotFound>
      </Suspense>
    </Router>
  );
};
