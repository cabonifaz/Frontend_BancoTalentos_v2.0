import { ReqContacto } from "../interfaces/ReqContacto";

export interface ClientContactResponse {
  idTipoMensaje: number;
  mensaje: string;
  lstClientContacts: ReqContacto[];
}
