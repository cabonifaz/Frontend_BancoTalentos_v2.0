export interface AddReqFilesParams {
    idRequerimiento: number;
    lstArchivos: ReqArchivo[];
}

interface ReqArchivo {
    string64: string;
    nombreArchivo: string;
    extensionArchivo: string;
    idTipoArchivo: number;
}