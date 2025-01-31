import { Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "../../core/components/RoutesWithNotFound";
import { Talents } from "./Talents";
import { AddTalent } from "./AddTalent";

export const PrivateRouter = () => {
    return (
        <RoutesWithNotFound>
            <Route path="/" element={<Navigate to={"/talentos"} />} />
            <Route path="/talentos" element={<Talents />} />
            <Route path="/nuevo-talento" element={<AddTalent />} />
        </RoutesWithNotFound>
    );
}