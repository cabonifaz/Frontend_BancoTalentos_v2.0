export interface TalentFile {
    idArchivo: number;
    nombreArchivo: string;
    tipoArchivo: string;
    tipoDocumento: string;
}

export interface AddTalentFile {
    nombreArchivo: string;
    extension: string;
    tipoArchivo: string;
}