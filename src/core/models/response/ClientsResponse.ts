import { Client } from "../interfaces/Client";

export interface ClientListResponse {
    idTipoMensaje: number;
    mensaje: string;
    clientes: Client[];
}