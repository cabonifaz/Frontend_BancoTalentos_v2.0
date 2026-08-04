import { BaseResponse } from "./BaseResponse";
import { ClientAdmin } from "../interfaces/ClientAdmin";

export interface ClientAdminListResponse {
  result: BaseResponse;
  registros: ClientAdmin[];
  total: number;
}
