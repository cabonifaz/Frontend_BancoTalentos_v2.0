import { Talents } from "./Talents";
import { AddTalent } from "./AddTalent";
import { Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "../../core/components";
import { Requirements } from "./Requirements";

export const PrivateRouter = () => {
    return (
        <RoutesWithNotFound>
            <Route path="/" element={<Navigate to={"/talentos"} />} />
            <Route path="/talentos" element={<Talents />} />
            <Route path="/nuevo-talento" element={<AddTalent />} />
            <Route path="/requerimientos" element={<Requirements />} />
        </RoutesWithNotFound>
    );
}