export interface Tarifa {
  idPerfil: number;
  perfil: string;
  tarifa: number;
  moneda: string;
  tipoTarifa: string;
  /**
   * PARAMETROS maestro 2 (1 = Nuevos Soles). El modal "Calcular Riesgo" compara
   * siempre en soles; decidirlo por el nombre de la moneda no es fiable porque
   * SP_TARIFARIO_LST lo saca de STRING3 y el SADMIN de STRING2.
   */
  idMoneda?: number;
  /** Tipo de cambio guardado en el tarifario; solo prellena el input del modal. */
  tipoCambio?: number | null;
}
