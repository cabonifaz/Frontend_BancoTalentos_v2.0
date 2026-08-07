import { Tariff } from "../interfaces/Tariff";
import { BaseResponse } from "./BaseResponse";

export interface TariffListResponse {
  result: BaseResponse;
  registros: Tariff[];
  total: number;
}
