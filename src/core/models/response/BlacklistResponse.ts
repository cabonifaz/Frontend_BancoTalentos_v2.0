import { BaseResponse } from "./BaseResponse";
import {
  BlacklistHistory,
  BlacklistItem,
  BlacklistValidation,
} from "../interfaces/Blacklist";

export interface BlacklistListResponse {
  result: BaseResponse;
  registros: BlacklistItem[];
  /** Talentos restringidos en total (la paginación es por talento, no por restricción). */
  total: number;
}

export interface BlacklistHistoryResponse {
  result: BaseResponse;
  historial: BlacklistHistory[];
  /** Movimientos en total. */
  total: number;
}

export interface BlacklistValidateResponse {
  result: BaseResponse;
  validacion: BlacklistValidation;
}

export interface BlacklistStatusResponse {
  result: BaseResponse;
  /** true si el talento tiene alguna restricción activa (cualquier cliente). */
  bloqueado: boolean;
}
