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
  /**
   * Content-type con el que el backend firmó la URL. Es el que hay que mandar en
   * la cabecera `Content-Type` del PUT: cualquier otro valor invalida la firma.
   */
  contentType?: string;
}

export interface TalentConfirmUploadRequest {
  idTalento: number;
  idArchivo?: number;
  idTipoDocumento: number;
  idTipoArchivo: number;
  nombreArchivo: string;
  path: string;
}

/**
 * Presign de la foto de perfil.
 *
 * Va por su propio endpoint (`/bdt/talent/photo/upload-url`) porque la foto no es
 * una fila de TALENTO_ARCHIVOS sino la columna `TALENTO.RUTA_IMAGEN`: no tiene
 * `idArchivo` ni `idTipoDocumento` que resolver, y no se confirma con
 * confirm-upload — la ruta viaja después en el update del talento.
 */
export interface TalentPhotoUploadUrlRequest {
  idTalento: number;
  fileName: string;
  /**
   * Informativo. El backend ya NO firma con este valor: resuelve el content-type
   * desde la extensión y lo devuelve en la respuesta, porque el navegador deja
   * `File.type` vacío en extensiones que el sistema operativo no reconoce y esa
   * discrepancia invalidaba la firma.
   */
  contentType: string;
}

export interface TalentPhotoUrlResponse {
  result: BaseResponse;
  url: string;
  path: string;
  fileName: string;
  /** Content-type firmado; debe ir tal cual en la cabecera del PUT. */
  contentType?: string;
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
