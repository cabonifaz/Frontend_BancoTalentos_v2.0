export interface TalentoFMI {
  idUsuarioTalento: number;
  idTalento: number;
  idTipoHistorial: number;
  esTrabajador: boolean;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  apellidos?: string;
  modalidad: string;
}

export interface AsignarTalentoType {
  idTalento: number;
  nombres: string;
  apellidos?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  dni: string;
  celular?: string;
  email: string;
  estado?: string;
  idEstado?: number;
  situacion?: string;
  idSituacion?: number;
  tooltip: string;
  perfil?: string;
  idPerfil?: number;
  confirmado?: boolean;
  isFromAPI?: boolean;

  ingreso?: number;
  idCliente?: number;
  idArea?: number;
  area?: string;
  cargo?: string;
  fchInicioContrato?: string;
  fchTerminoContrato?: string;
  proyectoServicio?: string;
  objetoContrato?: string;
  remuneracion?: number;
  idTiempoContrato?: number;
  tiempoContrato?: number;
  idModalidadContrato?: number;
  horario?: string;
  tieneEquipo?: number;
  ubicacion?: string;
  idMotivo?: number;
  idMoneda?: number;
  declararSunat?: number;
  sedeDeclarar?: string;
  montoBase?: number;
  montoMovilidad?: number;
  montoTrimestral?: number;
  montoSemestral?: number;

  solicitudEquipo?: SolicitudEquipo;
}

interface SolicitudEquipo {
  fechaSolicitud?: string;
  fechaEntrega?: string;
  idTipoEquipo?: number;
  tipoEquipo?: string;
  procesador?: string;
  ram?: string;
  hd?: string;
  marca?: string;
  anexo?: string;
  idAnexo?: number;
  bitCelular?: boolean;
  bitInternetMovil?: boolean;
  accesorios?: string;
  lstSoftware?: software[];
}

interface software {
  idItem: number;
  producto?: string;
  prodVersion?: string;
}
