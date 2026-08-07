// Modelos del módulo Tarifario (SUPERADMIN). Tabla TARIFARIO.

export interface Tariff {
  idTarifario: number;
  idCliente: number;
  razonSocial: string;
  idPerfil: number;
  perfil: string | null;
  idMoneda: number;
  moneda: string | null;
  idTipoTarifa: number;
  tipoTarifa: string | null;
  tarifa: number;
  tipoCambio: number | null;
}

export interface TariffListParams {
  filtro?: string;
  pagina?: number;
}

/** Alta/edición. En el alta `idTarifario` va omitido. `tipoCambio` es opcional. */
export interface TariffUpsertParams {
  idTarifario?: number;
  idCliente: number;
  idPerfil: number;
  idMoneda: number;
  tarifa: number;
  tipoCambio?: number | null;
  idTipoTarifa: number;
}
