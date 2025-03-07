export interface TalentFile {
    idArchivo: number;
    nombreArchivo: string;
    tipoArchivo: string;
    idTipoDocumento: number;
}

export interface AddTalentFile {
    nombreArchivo: string;
    extension: string;
    tipoArchivo: string;
}