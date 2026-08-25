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
  montoMensual?: number;
  montoTrimestral?: number;
  montoSemestral?: number;

  solicitudEquipo?: SolicitudEquipo;

  // ─── Pretensión salarial (modal "Calcular Riesgo") ──────────────────────────────
  // Los cuatro montos crudos. `montoBase` de arriba no sirve para esto: el SP lo
  // arma con un CASE que se queda con el piso de una sola modalidad y pierde el
  // rango, que es justo lo que se compara contra la tarifa del perfil.
  montoInicialPlanilla?: number;
  montoFinalPlanilla?: number;
  montoInicialRxH?: number;
  montoFinalRxH?: number;
  /** PARAMETROS maestro 2 (1 = Nuevos Soles). */
  idMonedaPlan?: number;
  idMonedaRxh?: number;
  idModalidadFacturacion?: number;

  // ID_ESTADO_REGISTRO para soft deletes
  idEstadoRegistro?: number;
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
