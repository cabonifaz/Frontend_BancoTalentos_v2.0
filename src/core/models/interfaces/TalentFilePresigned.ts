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
}
