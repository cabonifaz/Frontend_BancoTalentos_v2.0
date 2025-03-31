export interface AddPostulanteParams {
    idTalento: number | null;
    nombres: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    telefono: string | null;
    dni: string | null;
    email: string | null;
    tiempoContrato: number | null;
    idTiempoContrato: number | null;
    fechaInicioLabores: string | null;
    cargo: string | null;
    remuneracion: number | null;
    idMoneda: number | null;
    idModalidad: number | null;
    ubicacion: string | null;
}