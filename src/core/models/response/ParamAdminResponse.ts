import { BaseResponse } from "./BaseResponse";
import { ParamItem, ParamMaster } from "../interfaces/ParamAdmin";

export interface ParamMasterListResponse {
  result: BaseResponse;
  registros: ParamMaster[];
  /** Número de maestros (la paginación es por maestro, no por parámetro). */
  total: number;
}

export interface ParamItemListResponse {
  result: BaseResponse;
  registros: ParamItem[];
  total: number;
}
