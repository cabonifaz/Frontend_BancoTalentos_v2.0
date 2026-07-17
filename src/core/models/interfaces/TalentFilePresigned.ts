import { BaseResponse } from "../response/BaseResponse";

// Interfaces de subida/descarga de archivos de talento vía URL pre-firmada (S3).

export interface TalentUploadUrlRequest {
  idTalento: number;
  idTipoDocumento: number;
  fileName: string;
  contentType: string;
}

export interface TalentPresignedUrlResponse {
  result: BaseResponse;
  url: string;
  path: string;
  fileName: string;
}

export interface TalentConfirmUploadRequest {
  idTalento: number;
  idArchivo?: number;
  idTipoDocumento: number;
  idTipoArchivo: number;
  nombreArchivo: string;
  path: string;
}

export interface TalentDownloadUrlRequest {
  idFile: number;
  /**
   * Si es `true`, la URL pre-firmada se genera para visualización inline
   * (visor de PDF/imagen). Si se omite, el archivo se descarga (comportamiento
   * original).
   */
  inline?: boolean;
}
