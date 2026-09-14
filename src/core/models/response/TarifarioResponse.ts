import { Tarifa } from "@/core/models/interfaces/Tarifa";

export interface TarifarioResponse {
  idTipoMensaje: number;
  mensaje: string;
  lstTarifario: Tarifa[];
}
