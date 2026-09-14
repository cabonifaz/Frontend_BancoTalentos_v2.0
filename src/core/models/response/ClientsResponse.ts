import { Client } from "@/core/models/interfaces/Client";

export interface ClientListResponse {
    idTipoMensaje: number;
    mensaje: string;
    clientes: Client[];
}