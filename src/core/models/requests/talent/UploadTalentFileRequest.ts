export interface UploadTalentFileRequest {
  idArchivo?: number;
  idTalento: number;
  nombreArchivo: string;
  extensionArchivo: string;
  idTipoArchivo: number;
  idTipoDocumento: number;
  string64: string;
}
