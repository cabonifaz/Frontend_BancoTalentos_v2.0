import { TalentoDetailFMI } from "@/core/models/interfaces/TalentoDetailFMI";

export interface TalentoResponseFMI {
    idTipoMensaje: number;
    mensaje: string;
    talento: TalentoDetailFMI;
}