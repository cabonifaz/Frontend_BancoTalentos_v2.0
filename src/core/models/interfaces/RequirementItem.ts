import { Perfil } from "./Perfil";

export interface RequirementItem {
    idRequerimiento: number;
    cliente: string;
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