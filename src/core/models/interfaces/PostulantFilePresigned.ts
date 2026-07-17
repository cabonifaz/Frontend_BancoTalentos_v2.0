import { BaseResponseFMI } from "../response/BaseResponse";

// Interfaces de archivos de postulante (REQUERIMIENTO_TALENTO) vía URL pre-firmada (S3).
// La respuesta de subida/descarga reutiliza RqPresignedUrlResponse (ver RqFilePresigned.ts).

export interface PostulantFile {
  idRequerimientoTalentoArchivo: number;
  idRequerimiento: number;
  idRequerimientoTalento: number;
  nombreArchivo: string;
  idTipoArchivo: number;
  rutaArchivo: string;
}

export interface PostulantFileListResponse extends BaseResponseFMI {
  archivos: PostulantFile[];
}

export interface PostulantUploadUrlRequest {
  idRequerimiento: number;
  idRequerimientoTalento: number;
  fileName: string;
  contentType: string;
}

export interface PostulantConfirmUploadRequest {
  idRequerimiento: number;
  idRequerimientoTalento: number;
  nombreArchivo: string;
  idTipoArchivo: number;
  path: string;
}

export interface PostulantDownloadUrlRequest {
  idRequerimientoTalento: number;
  idArchivo: number;
}
