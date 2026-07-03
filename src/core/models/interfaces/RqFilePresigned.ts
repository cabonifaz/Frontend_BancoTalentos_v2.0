import { BaseResponseFMI } from "../response/BaseResponse";

// Interfaces de subida/descarga de archivos de requerimiento vía URL pre-firmada (S3).

/** URL PUT devuelta al crear el RQ, una por archivo (mismo orden que lstArchivos). */
export interface RqFileUploadUrl {
  url: string;
  path: string;
  fileName: string;
  idTipoArchivoRQ: number;
}

/** Respuesta de /fmi/requirement/save: BaseResponseFMI + id del RQ + URLs de archivos. */
export interface SaveRequirementResponse extends BaseResponseFMI {
  idRequerimiento: number;
  archivos: RqFileUploadUrl[];
}

export interface RqPresignedUrlResponse {
  result: BaseResponseFMI;
  url: string;
  path: string;
  fileName: string;
}

export interface RqUploadUrlRequest {
  idRequerimiento: number;
  idTipoArchivoRQ: number;
  fileName: string;
  contentType: string;
}

export interface RqConfirmUploadRequest {
  idRequerimiento: number;
  idTipoArchivoRQ: number;
  idTipoArchivo: number;
  nombreArchivo: string;
  path: string;
}
