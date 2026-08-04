import { lazy } from "react";

import { Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "../../core/components";
import { RouteGuard } from "../../guard/RouteGuard";
import { getFirstAllowedPath } from "../../core/config/navigation";
import { Utils } from "../../core/utilities/utils";

const Talents = lazy(() =>
  import("./Talents").then((m) => ({ default: m.Talents })),
);
const AddTalent = lazy(() =>
  import("./AddTalent").then((m) => ({ default: m.AddTalent })),
);
const Requirements = lazy(() =>
  import("./Requirements").then((m) => ({ default: m.Requirements })),
);
const Blacklist = lazy(() =>
  import("./Blacklist").then((m) => ({ default: m.Blacklist })),
);
const TalentTable = lazy(() => import("./PantallaAsignarTalento"));
const PantallaDatos = lazy(() => import("./PantallaDatos"));
const PantallaGenerarEnlaceRequerimiento = lazy(
  () => import("./PantallaGenerarEnlaceRequerimiento"),
);

const Interviews = lazy(() => import("./Interviews"));
const InterviewDetail = lazy(() => import("./InterviewDetail"));
const InterviewCreate = lazy(() => import("./InterviewCreate"));

const UserContact = lazy(() =>
  import("./UserContact").then((m) => ({ default: m.UserContact })),
);
const NoAuthorized = lazy(() =>
  import("./NoAuthorized").then((m) => ({ default: m.NoAuthorized })),
);

export const PrivateRouter = () => {
  const routes = Utils.getUserRoutes(localStorage.getItem("token") || undefined);
  const home = getFirstAllowedPath(routes) ?? "/dashboard/no-autorizado";

  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={home} replace />} />

      {/* Pantalla de acceso denegado: solo requiere sesión, no una ruta autorizada */}
      <Route path="/no-autorizado" element={<NoAuthorized />} />

      {/* Rutas protegidas: RouteGuard valida la ruta actual (y sus hijas) contra las
          rutas permitidas del token. Agregar un módulo no requiere tocar este archivo. */}
      <Route element={<RouteGuard />}>
        <Route path="/talentos" element={<Talents />} />
        <Route path="/nuevo-talento" element={<AddTalent />} />
        <Route path="/formDatos" element={<PantallaDatos />} />
        <Route path="/requerimientos" element={<Requirements />} />
        <Route path="/tableAsignarTalento" element={<TalentTable />} />
        <Route path="/lista-negra" element={<Blacklist />} />
        <Route path="/entrevistas" element={<Interviews />} />
        <Route path="/entrevistas/nueva" element={<InterviewCreate />} />
        <Route path="/entrevistas/:id" element={<InterviewDetail />} />
        <Route
          path="/generarEnlaceRequerimiento"
          element={<PantallaGenerarEnlaceRequerimiento />}
        />
        <Route path="/mi-cuenta" element={<UserContact />} />
      </Route>
    </RoutesWithNotFound>
  );
};
