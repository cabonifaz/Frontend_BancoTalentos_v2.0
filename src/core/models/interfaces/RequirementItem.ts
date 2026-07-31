import { Perfil } from "./Perfil";

export interface RequirementItem {
    idRequerimiento: number;
    idCliente?: number;
    cliente: string;
    /** Ubicación del cliente (tabla CLIENTE), expuesta por SP_REQUERIMIENTO_LST. */
    ubicacion?: string;
    titulo: string;
    codigoRQ: string;
    fechaSolicitud: string;
    estado: string;
    idEstado: number;
    vacantes: number;
    vacantesCubiertas: number;
    duracion: string;
    fechaVencimiento: string;
    modalidad: string;
    idAlerta: number;
    lstPerfiles: Perfil[];
}