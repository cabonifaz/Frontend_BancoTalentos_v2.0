export interface UpdateReqParams {
    idRequerimiento: number;
    idCliente: number;
    cliente: string;
    estado: number;
    codigoRQ: string;
    fechaSolicitud: string;
    descripcion: string;
    vacantes: number;
}