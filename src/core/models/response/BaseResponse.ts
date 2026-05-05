export interface BaseResponse {
  idMensaje: number;
  mensaje: string;
}

export interface BaseResponseFMI {
  idTipoMensaje: number;
  mensaje: string;
}

export interface OperationResult<T> {
  baseResponse: BaseResponseFMI;
  data: T;
}
