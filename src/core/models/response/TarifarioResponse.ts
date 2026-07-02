import { Tarifa } from "../../models/interfaces/Tarifa";

export interface TarifarioResponse {
  idTipoMensaje: number;
  mensaje: string;
  lstTarifario: Tarifa[];
}
