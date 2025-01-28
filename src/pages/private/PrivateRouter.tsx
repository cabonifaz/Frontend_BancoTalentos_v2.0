import { Navigate, Route } from "react-router-dom";
import { RoutesWithNotFound } from "../../core/components/RoutesWithNotFound";
import { Talents } from "./Talents";

export const PrivateRouter = () => {
    return (
        <RoutesWithNotFound>
            <Route path="/" element={<Navigate to={"/talentos"} />} />
            <Route path="/talentos" element={<Talents />} />
        </RoutesWithNotFound>
    );
}