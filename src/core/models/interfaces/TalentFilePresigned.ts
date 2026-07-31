import { BaseResponse } from "../response/BaseResponse";

// Interfaces de subida/descarga de archivos de talento vía URL pre-firmada (S3).

export interface TalentUploadUrlRequest {
  idTalento: number;
  idTipoDocumento: number;
  fileName: string;
  contentType: string;
  /**
   * Si se envía (reemplazo), el backend genera la URL para SOBRESCRIBIR el archivo
   * existente in-place (misma key en S3). Así la ruta en BD no cambia y basta con
   * que el PUT devuelva 200 (no hace falta confirmar).
   */
  idArchivo?: number;
}

export interface TalentPresignedUrlResponse {
  result: BaseResponse;
  url: string;
  path: string;
  fileName: string;
  /**
   * En subida: indica si tras el PUT hay que llamar a confirm-upload para
   * registrar la ruta en BD. `false` en un reemplazo in-place (misma key), donde
   * el 200 del PUT es suficiente.
   */
  requiresConfirm?: boolean;
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
