export interface TalentoFMI {
    idUsuarioTalento: number;
    idTalento: number;
    idTipoHistorial: number;
    esTrabajador: boolean;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    apellidos?: string;
    modalidad: string;
}