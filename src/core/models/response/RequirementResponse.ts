import { ReqArchivo } from "../interfaces/ReqArchivo";
import { ReqTalento } from "../interfaces/ReqTalento";
import { ReqVacante } from "../interfaces/ReqVacante";

export interface RequirementResponse {
    idTipoMensaje: number;
    mensaje: string;
    requerimiento: {
        idCliente: number;
        cliente: string;
        codigoRQ: string;
        fechaSolicitud: string;
        descripcion: string;
        idEstado: number;
        vacantes: number;
        lstRqVacantes: ReqVacante[];
        lstRqTalento: ReqTalento[];
        lstRqArchivo: ReqArchivo[];
    }
}