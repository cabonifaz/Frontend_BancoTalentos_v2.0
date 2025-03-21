import { Talents } from "./Talents";
import { AddTalent } from "./AddTalent";
import { Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "../../core/components";
import { Requirements } from "./Requirements";
import TalentTable from "./PantallaAsignarTalento";
import PantallaDatos from "./PantallaDatos";

export const PrivateRouter = () => {
    return (
        <RoutesWithNotFound>
            <Route path="/" element={<Navigate to={"/talentos"} />} />
            <Route path="/talentos" element={<Talents />} />
            <Route path="/nuevo-talento" element={<AddTalent />} />
            <Route path="/requerimientos" element={<Requirements />} />
            <Route path="/tableAsignarTalento" element={<TalentTable />} />
            <Route path="/formDatos" element={<PantallaDatos />} />
        </RoutesWithNotFound>
    );
}