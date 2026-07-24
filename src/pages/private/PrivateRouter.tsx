import { lazy } from "react";

import { Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "../../core/components";
import { RoleGuard } from "../../guard/RoleGuard";
import { rolesFor } from "../../core/config/navigation";

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
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={"/talentos"} />} />

      {/* Pantalla de acceso denegado: solo requiere sesión, no un rol concreto */}
      <Route path="/no-autorizado" element={<NoAuthorized />} />

      {/* Inicio / gestión de talentos */}
      <Route element={<RoleGuard allow={rolesFor("inicio")} />}>
        <Route path="/talentos" element={<Talents />} />
        <Route path="/nuevo-talento" element={<AddTalent />} />
        <Route path="/formDatos" element={<PantallaDatos />} />
      </Route>

      {/* Requerimientos (incluye asignación de talento) */}
      <Route element={<RoleGuard allow={rolesFor("requerimientos")} />}>
        <Route path="/requerimientos" element={<Requirements />} />
        <Route path="/tableAsignarTalento" element={<TalentTable />} />
      </Route>

      {/* Lista Negra */}
      <Route element={<RoleGuard allow={rolesFor("lista-negra")} />}>
        <Route path="/lista-negra" element={<Blacklist />} />
      </Route>

      {/* Entrevistas */}
      <Route element={<RoleGuard allow={rolesFor("entrevistas")} />}>
        <Route path="/entrevistas" element={<Interviews />} />
        <Route path="/entrevistas/nueva" element={<InterviewCreate />} />
        <Route path="/entrevistas/:id" element={<InterviewDetail />} />
      </Route>

      {/* Generar enlace de requerimiento */}
      <Route element={<RoleGuard allow={rolesFor("generar-enlace")} />}>
        <Route
          path="/generarEnlaceRequerimiento"
          element={<PantallaGenerarEnlaceRequerimiento />}
        />
      </Route>

      {/* Mi cuenta */}
      <Route element={<RoleGuard allow={rolesFor("mi-cuenta")} />}>
        <Route path="/mi-cuenta" element={<UserContact />} />
      </Route>
    </RoutesWithNotFound>
  );
};
