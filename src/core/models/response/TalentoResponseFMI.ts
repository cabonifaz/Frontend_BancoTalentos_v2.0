import { TalentoDetailFMI } from "../interfaces/TalentoDetailFMI";

export interface TalentoResponseFMI {
    idTipoMensaje: number;
    mensaje: string;
    talento: TalentoDetailFMI;
}