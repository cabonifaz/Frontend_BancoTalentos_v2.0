import { ClientGestor } from "@/core/models/interfaces/ClientGestor";
import { BaseResponse } from "./BaseResponse";

export interface ClientGestorListResponse {
  result: BaseResponse;
  registros: ClientGestor[];
}
