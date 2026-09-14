import { ReqArchivo } from "@/core/models/interfaces/ReqArchivo";
import { ReqContacto } from "@/core/models/interfaces/ReqContacto";
import { ReqTalento } from "@/core/models/interfaces/ReqTalento";
import { ReqVacante } from "@/core/models/interfaces/ReqVacante";
import { RQFacturacion } from "@/core/models/interfaces/RQFacturacion";

export interface RequirementResponse {
  idTipoMensaje: number;
  mensaje: string;
  requerimiento: {
    idCliente: number;
    cliente: string;
    /** Ubicación del cliente. La agrega el backend por separado; opcional en el front. */
    ubicacion?: string;
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
    duracion: number;
    idModalidad: number;
    idDuracion: number;
    modalidadFact: string;
    idDuracionContrato?: number;
    duracionContrato?: number;
    lstRqFacturacion: RQFacturacion[];
  };
}
