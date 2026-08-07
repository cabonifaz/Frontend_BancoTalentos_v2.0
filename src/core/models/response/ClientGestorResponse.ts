import { ClientGestor } from "../interfaces/ClientGestor";
import { BaseResponse } from "./BaseResponse";

export interface ClientGestorListResponse {
  result: BaseResponse;
  registros: ClientGestor[];
}
