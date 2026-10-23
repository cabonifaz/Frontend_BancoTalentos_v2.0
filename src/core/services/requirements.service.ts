/** Servicio del modulo `requerimientos`. */
import { AxiosResponse } from "axios";
import {
  axiosInstanceFMI,
} from "./axiosService";
import { Utils } from "../utilities/utils";
import { AddReqFilesParams, BaseResponse, BaseResponseFMI, OperationResult, PostulantConfirmUploadRequest, PostulantDownloadUrlRequest, PostulantFileListResponse, PostulantUploadUrlRequest, ReqListParams, RequerimientosResponse, RequirementResponse, RqConfirmUploadRequest, RqPresignedUrlResponse, RqUploadUrlRequest, UpdateReqParams } from "../models";

export const getRequirements = (
  params: ReqListParams
): Promise<AxiosResponse<RequerimientosResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/requirement/list?${Utils.buildQueryString(params)}`
  );
};

/** Un RQ al que fue asignado el talento (SP_TALENTO_POSTULACIONES_LST). */
export interface TalentApplication {
  idRequerimiento: number;
  codigo: string;
  titulo: string;
  cliente: string;
  /** dd/MM/yyyy */
  fechaSolicitud: string | null;
  /** Estado del RQ (maestro 24). */
  idEstado: number;
  estado: string;
  /** Estado del talento en ese RQ (maestro 25). */
  idEstadoTalento: number;
  estadoTalento: string;
  /** Ingresó a la empresa por este RQ. */
  ingreso: boolean;
  /** Vacante a la que postuló: perfil profesional (maestro 14). */
  idPerfil: number | null;
  vacante: string;
  postulantes: number;
}

export interface TalentApplications {
  postulaciones: TalentApplication[];
  totalElementos: number;
  totalPaginas: number;
  /** Filas por página (PARAMETROS maestro 11); null = sin paginar. */
  tamanioPagina: number | null;
  /** Todas las postulaciones del talento, sin filtros. */
  totalPostulaciones: number;
  /** Cantidad por estado del RQ, aplicando sólo la búsqueda. */
  estados: { idEstado: number; estado: string; cantidad: number }[];
}

export interface TalentApplicationsParams {
  idTalento: number;
  buscar?: string | null;
  estado?: number | null;
  nPag?: number | null;
}

/** Postulaciones de un talento, para el modal del detalle del talento. */
export const getTalentApplications = (
  params: TalentApplicationsParams
): Promise<AxiosResponse<OperationResult<TalentApplications | null>>> => {
  return axiosInstanceFMI.get(
    `/fmi/requirement/by-talent?${Utils.buildQueryString(params)}`
  );
};

export const getRequirementById = (
  id: number
): Promise<AxiosResponse<RequirementResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/requirement/data?idRequerimiento=${id}&showfiles=false&showVacantesList=true&showContactList=true`
  );
};

export const updateRequirement = (
  data: UpdateReqParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstanceFMI.post("/fmi/requirement/update", data);
};

export const deleteReqFile = (
  id: number
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstanceFMI.delete(
    `/fmi/requirement/file/remove?idRqFile=${id}`
  );
};

export const addReqFiles = (
  data: AddReqFilesParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstanceFMI.post("/fmi/requirement/file/save", data);
};

// ─── Archivos de requerimiento vía URL pre-firmada (S3 directo) ───────────────
// Interfaces en models/interfaces/RqFilePresigned.ts

/** Detalle/actualizar RQ: pide URL PUT pre-firmada para un archivo. */

/** Detalle/actualizar RQ: pide URL PUT pre-firmada para un archivo. */
export const generateRqUploadUrl = (
  data: RqUploadUrlRequest
): Promise<AxiosResponse<RqPresignedUrlResponse>> => {
  return axiosInstanceFMI.post("/fmi/requirement/file/upload-url", data);
};

/** Confirma en BD un archivo de RQ ya subido a S3. */

/** Confirma en BD un archivo de RQ ya subido a S3. */
export const confirmRqUpload = (
  data: RqConfirmUploadRequest
): Promise<AxiosResponse<BaseResponseFMI>> => {
  return axiosInstanceFMI.post("/fmi/requirement/file/confirm-upload", data);
};

/** URL GET pre-firmada para descargar un archivo de RQ. */

/** URL GET pre-firmada para descargar un archivo de RQ. */
export const generateRqDownloadUrl = (
  data: { idArchivo: number }
): Promise<AxiosResponse<RqPresignedUrlResponse>> => {
  return axiosInstanceFMI.post("/fmi/requirement/file/download-url", data);
};

// ─── Archivos de postulante (REQUERIMIENTO_TALENTO) vía URL pre-firmada ───────
// Interfaces en models/interfaces/PostulantFilePresigned.ts

/** Pide una URL PUT pre-firmada para subir un archivo de postulante a S3. */

/** Pide una URL PUT pre-firmada para subir un archivo de postulante a S3. */
export const generatePostulantUploadUrl = (
  data: PostulantUploadUrlRequest
): Promise<AxiosResponse<RqPresignedUrlResponse>> => {
  return axiosInstanceFMI.post(
    "/fmi/requirement/postulant/file/upload-url",
    data
  );
};

/** Confirma en BD un archivo de postulante ya subido a S3. */

/** Confirma en BD un archivo de postulante ya subido a S3. */
export const confirmPostulantUpload = (
  data: PostulantConfirmUploadRequest
): Promise<AxiosResponse<BaseResponseFMI>> => {
  return axiosInstanceFMI.post(
    "/fmi/requirement/postulant/file/confirm-upload",
    data
  );
};

/** Lista los archivos de un postulante. */

/** Lista los archivos de un postulante. */
export const listPostulantFiles = (
  idRequerimientoTalento: number
): Promise<AxiosResponse<PostulantFileListResponse>> => {
  return axiosInstanceFMI.get(
    `/fmi/requirement/postulant/file/list?idRequerimientoTalento=${idRequerimientoTalento}`
  );
};

/** URL GET pre-firmada para descargar un archivo de postulante. */

/** URL GET pre-firmada para descargar un archivo de postulante. */
export const generatePostulantDownloadUrl = (
  data: PostulantDownloadUrlRequest
): Promise<AxiosResponse<RqPresignedUrlResponse>> => {
  return axiosInstanceFMI.post(
    "/fmi/requirement/postulant/file/download-url",
    data
  );
};

/** Eliminación lógica de un archivo de postulante. */

/** Eliminación lógica de un archivo de postulante. */
export const removePostulantFile = (
  idArchivo: number
): Promise<AxiosResponse<BaseResponseFMI>> => {
  return axiosInstanceFMI.delete(
    `/fmi/requirement/postulant/file/remove?idArchivo=${idArchivo}`
  );
};

// ─── Deshacer movimientos (SUPERADMIN) — API de FMI /fmi/employee/* ──────────
// El SUPERADMIN de BDT reutiliza los endpoints de FMI. El token BDT viaja como
// Bearer (axiosInstanceFMI) y FMI valida las funcionalidades 1 (listar) y 2048
// (deshacer) sobre el rol; el detalle no exige funcionalidad.

/** Listado paginado / por búsqueda de empleados (SP_TALENTO_EMPLEADO_SEL). */
