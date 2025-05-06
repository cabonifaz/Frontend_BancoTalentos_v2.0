import { ReqArchivo } from "../interfaces/ReqArchivo";
import { ReqContacto } from "../interfaces/ReqContacto";
import { ReqTalento } from "../interfaces/ReqTalento";
import { ReqVacante } from "../interfaces/ReqVacante";

export interface RequirementResponse {
    idTipoMensaje: number;
    mensaje: string;
    requerimiento: {
        idCliente: number;
        cliente: string;
        titulo: string;
        codigoRQ: string;
        fechaSolicitud: string;
        fechaVencimiento: string;
        descripcion: string;
        idEstado: number;
        vacantes: number;
        lstRqVacantes: ReqVacante[];
        lstRqTalento: ReqTalento[];
        lstRqArchivo: ReqArchivo[];
        lstRqContactos: ReqContacto[];
    }
}