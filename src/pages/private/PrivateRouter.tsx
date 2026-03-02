import { lazy } from "react";

import { Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "../../core/components";

const Talents = lazy(() =>
  import("./Talents").then((m) => ({ default: m.Talents })),
);
const AddTalent = lazy(() =>
  import("./AddTalent").then((m) => ({ default: m.AddTalent })),
);
const Requirements = lazy(() =>
  import("./Requirements").then((m) => ({ default: m.Requirements })),
);
const TalentTable = lazy(() => import("./PantallaAsignarTalento"));
const PantallaDatos = lazy(() => import("./PantallaDatos"));
const PantallaGenerarEnlaceRequerimiento = lazy(
  () => import("./PantallaGenerarEnlaceRequerimiento"),
);

export const PrivateRouter = () => {
  return (
    <RoutesWithNotFound>
      <Route path="/" element={<Navigate to={"/talentos"} />} />
      <Route path="/talentos" element={<Talents />} />
      <Route path="/nuevo-talento" element={<AddTalent />} />
      <Route path="/requerimientos" element={<Requirements />} />
      <Route path="/tableAsignarTalento" element={<TalentTable />} />
      <Route
        path="/generarEnlaceRequerimiento"
        element={<PantallaGenerarEnlaceRequerimiento />}
      />
      <Route path="/formDatos" element={<PantallaDatos />} />
    </RoutesWithNotFound>
  );
};
