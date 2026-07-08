export interface TalentFile {
    idArchivo: number;
    nombreArchivo: string;
    tipoArchivo: string;
    idTipoDocumento: number;
    // Fecha de carga (opcional). El backend aún no la devuelve; se muestra solo si está presente.
    fechaCarga?: string;
}

export interface AddTalentFile {
    nombreArchivo: string;
    extension: string;
    tipoArchivo: string;
}