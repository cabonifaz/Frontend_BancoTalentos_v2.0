import { RequirementItem } from "../interfaces/RequirementItem";

export interface RequerimientosResponse {
    idTipoMensaje: number;
    mensaje: string;
    requerimientos: RequirementItem[];
};