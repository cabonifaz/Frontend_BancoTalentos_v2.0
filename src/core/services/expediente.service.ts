/**
 * Servicio del módulo `expediente`.
 *
 * Todo vive en el backend de FMI y se consume tal cual, sin capa nueva: son los
 * mismos endpoints que usa el buscador de talentos de FMI, con el mismo token.
 */
import { AxiosResponse } from "axios";
import { axiosInstanceFMI } from "./axiosService";
import {
  ExpedienteDetalle,
  ExpedienteListResponse,
  ExpedientePdfResponse,
} from "../models";

/**
 * Buscador. `busqueda` filtra por nombre completo; sin ella devuelve los
 * últimos talentos con contrato. El SP (`SP_TALENTO_CTR_LST`) devuelve como
 * máximo 5 filas e ignora la página, así que aquí no se pagina.
 */
export const searchExpedientes = (
  busqueda?: string
): Promise<AxiosResponse<ExpedienteListResponse>> => {
  const query = busqueda?.trim()
    ? `busqueda=${encodeURIComponent(busqueda.trim())}`
    : "nPag=1";
  return axiosInstanceFMI.get(`/fmi/employee/list?${query}`);
};

/** Expediente completo: datos, contratos, movimientos, equipos y ceses. */
export const getExpediente = (
  idTalento: number
): Promise<AxiosResponse<ExpedienteDetalle>> => {
  return axiosInstanceFMI.get(`/fmi/employee/detail?talentId=${idTalento}`);
};

/**
 * PDF de un movimiento o de un cese (ambos son HISTORIAL).
 * `tipoHistorial` es el maestro 9: 1 ingreso, 2 movimiento, 3 cese.
 */
export const getExpedienteHistorialPdf = (
  tipoHistorial: number,
  idHistorial: number,
  idTalento: number
): Promise<AxiosResponse<ExpedientePdfResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/employee/getHistory?historyType=${tipoHistorial}&movementId=${idHistorial}&talentId=${idTalento}`
  );
};

/** PDF de una solicitud de equipo concreta. */
export const getExpedienteEquipoPdf = (
  idSolicitud: number,
  idTalento: number
): Promise<AxiosResponse<ExpedientePdfResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/employee/getRequestedEquipment?idSolicitud=${idSolicitud}&idTalento=${idTalento}`
  );
};

/**
 * Último formulario de un tipo de historial. Es la única vía para el PDF de
 * ingreso: el detalle no devuelve el `ID_HISTORIAL` de cada contrato.
 */
export const getExpedienteUltimoHistorialPdf = (
  tipoHistorial: number,
  idTalento: number
): Promise<AxiosResponse<ExpedientePdfResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/employee/lastHistory?idTipoHistorial=${tipoHistorial}&idTalento=${idTalento}`
  );
};

/** Última solicitud de equipo del talento. */
export const getExpedienteUltimoEquipoPdf = (
  idTalento: number
): Promise<AxiosResponse<ExpedientePdfResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/employee/lastSolicitudEquipo?idTalento=${idTalento}`
  );
};
