/** Servicio del modulo `lista-negra`. */
import { AxiosResponse } from "axios";
import {
  axiosInstance,
} from "./axiosService";
import { Utils } from "../utilities/utils";
import { BaseResponse, BlacklistCreateParams, BlacklistHistoryResponse, BlacklistListResponse, BlacklistRemoveParams, BlacklistStatusResponse, BlacklistUpdateParams, BlacklistValidateResponse } from "../models";

// blacklist (lista negra)
export const createBlacklist = (
  data: BlacklistCreateParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.post("/bdt/blacklist/create", data);
};

export const updateBlacklist = (
  data: BlacklistUpdateParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put("/bdt/blacklist/update", data);
};

/** El motivo va en el body: es texto libre de hasta 1000 caracteres. */

/** El motivo va en el body: es texto libre de hasta 1000 caracteres. */
export const removeBlacklist = (
  data: BlacklistRemoveParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.delete("/bdt/blacklist/remove", { data });
};

export const getBlacklist = (params: {
  nombre?: string;
  idCliente?: number;
  pagina?: number;
}): Promise<AxiosResponse<BlacklistListResponse>> => {
  const queryString = Utils.buildQueryString(params);
  const url = `/bdt/blacklist/list${queryString ? `?${queryString}` : ""}`;
  return axiosInstance.get(url);
};

export const getBlacklistHistory = (params: {
  idTalento: number;
  idCliente?: number;
  pagina?: number;
}): Promise<AxiosResponse<BlacklistHistoryResponse>> => {
  const queryString = Utils.buildQueryString(params);
  const url = `/bdt/blacklist/history${queryString ? `?${queryString}` : ""}`;
  return axiosInstance.get(url);
};

/** Valida si el talento está restringido para el cliente del requerimiento. */

/** Valida si el talento está restringido para el cliente del requerimiento. */
export const validateBlacklist = (params: {
  idTalento: number;
  idRequerimiento: number;
}): Promise<AxiosResponse<BlacklistValidateResponse>> => {
  const queryString = Utils.buildQueryString(params);
  return axiosInstance.get(`/bdt/blacklist/validate?${queryString}`);
};

/** Indica si el talento tiene alguna restricción activa (cualquier cliente). */

/** Indica si el talento tiene alguna restricción activa (cualquier cliente). */
export const getTalentBlacklistStatus = (
  idTalento: number
): Promise<AxiosResponse<BlacklistStatusResponse>> => {
  return axiosInstance.get(`/bdt/blacklist/status?idTalento=${idTalento}`);
};

// manejo de parámetros (SUPERADMIN)

/** Modo 1: lista de maestros paginada por maestro. */
