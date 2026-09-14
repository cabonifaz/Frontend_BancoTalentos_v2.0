import { BaseResponse } from "./BaseResponse";
import { ClientAdmin } from "@/core/models/interfaces/ClientAdmin";

export interface ClientAdminListResponse {
  result: BaseResponse;
  registros: ClientAdmin[];
  total: number;
}
