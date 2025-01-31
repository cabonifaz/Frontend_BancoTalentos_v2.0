import { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

interface Props {
    children: ReactNode;
}

export const RoutesWithNotFound = ({ children }: Props) => {
    return (
        <Routes>
            {children}
            <Route path="*" element={<Navigate to={"/404"} />} />
            <Route path="/404" element={<h1>404 Page not Found</h1>} />
        </Routes>
    );
}