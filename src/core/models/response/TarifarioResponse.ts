import { Tarifa } from "../interfaces/Tarifa";

export interface TarifarioResponse {
  idTipoMensaje: number;
  mensaje: string;
  lstTarifario: Tarifa[];
}
