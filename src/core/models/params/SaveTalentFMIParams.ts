export interface SaveTalentFMIParams {
    idTalento: number;
    APELLIDO_PATERNO: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
    telefono: string;
    dni: string;
    email: string;
    tiempoContrato: number | null;
    idTiempoContrato: number;
    fechaInicioLabores: string;
    cargo: string;
    remuneracion: number | null;
    idMoneda: number;
    idModalidad: number;
    ubicacion: string;
}