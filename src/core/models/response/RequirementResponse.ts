import { ReqArchivo } from "../interfaces/ReqArchivo";
import { ReqTalento } from "../interfaces/ReqTalento";

export interface RequirementResponse {
    idTipoMensaje: number;
    mensaje: string;
    requerimiento: {
        idCliente: number;
        cliente: string;
        codigoRQ: string;
        fechaSolicitud: string;
        descripcion: string;
        estado: number;
        vacantes: number;
        lstRqTalento: ReqTalento[];
        lstRqArchivo: ReqArchivo[];
    }
}