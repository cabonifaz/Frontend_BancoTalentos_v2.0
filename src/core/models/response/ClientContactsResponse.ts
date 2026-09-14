import { ReqContacto } from "@/core/models/interfaces/ReqContacto";

export interface ClientContactResponse {
  idTipoMensaje: number;
  mensaje: string;
  lstClientContacts: ReqContacto[];
}
