export interface Tarifa {
  idPerfil: number;
  perfil: string;
  /**
   * Importe del tarifario. Llega en `null` cuando el usuario no tiene permiso
   * para verlo (rol RECLUTADOR): el backend devuelve el perfil sin importes,
   * porque esta misma lista es el catálogo de perfiles del cliente y no se
   * puede dejar vacía.
   */
  tarifa: number | null;
  moneda: string | null;
  tipoTarifa: string | null;
  /**
   * PARAMETROS maestro 2 (1 = Nuevos Soles). El modal "Calcular Riesgo" compara
   * siempre en soles; decidirlo por el nombre de la moneda no es fiable porque
   * SP_TARIFARIO_LST lo saca de STRING3 y el SADMIN de STRING2.
   */
  idMoneda?: number | null;
  /** Tipo de cambio guardado en el tarifario; solo prellena el input del modal. */
  tipoCambio?: number | null;
}
