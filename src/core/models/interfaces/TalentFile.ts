export interface TalentFile {
    idArchivo: number;
    nombreArchivo: string;
    rutaArchivo: string;
    tipoArchivo: string;
    tipoDocumento: string;
}

export interface AddTalentFile {
    nombreArchivo: string;
    extension: string;
    tipoArchivo: string;
}