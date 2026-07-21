// Modelos del módulo Lista Negra (BT_LISTA_NEGRA / BT_HISTORIAL_LISTA_NEGRA).
// idCliente = 0 → restricción global (todos los clientes).

export interface BlacklistItem {
  idListaNegra: number;
  idTalento: number;
  nombreTalento: string;
  idCliente: number;
  cliente: string;
  motivo: string;
  usucre: string;
  fchcre: string;
}

export interface BlacklistHistory {
  idHistorialListaNegra: number;
  idListaNegra: number;
  idTalento: number;
  idCliente: number;
  cliente: string;
  motivo: string;
  movimiento: string; // CREACION | ACTUALIZACION | ELIMINACION
  usucre: string;
  fchcre: string;
}

/** Cliente del que un talento está restringido (0 = "TODOS LOS CLIENTES"). */
export interface BlacklistStatusClient {
  idCliente: number;
  cliente: string;
}

/**
 * Resultado de validar a un talento contra la lista negra al asignarlo a un
 * requerimiento. Si `bloqueado` es false, el resto de campos viene nulo.
 */
export interface BlacklistValidation {
  idListaNegra: number | null;
  idTalento: number;
  /** 0 = la restricción es global (todos los clientes). */
  idCliente: number | null;
  cliente: string | null;
  motivo: string | null;
  bloqueado: boolean;
}

export interface BlacklistCreateParams {
  idTalento: number;
  idCliente: number;
  motivo: string;
}

export interface BlacklistUpdateParams {
  idListaNegra: number;
  motivo: string;
}

export interface BlacklistRemoveParams {
  idListaNegra: number;
  /** Motivo de la baja (por qué se levanta), NO el motivo de la restricción. */
  motivo: string;
}

/** Cliente cuya restricción se conserva al levantar una restricción global. */
export interface BlacklistKeptClient {
  idCliente: number;
  motivo: string;
}

export interface BlacklistReplaceGlobalParams {
  /** Registro global (idCliente = 0) que se da de baja. */
  idListaNegra: number;
  idTalento: number;
  /** Motivo de la baja del global, para el historial. */
  motivoEliminacion: string;
  /** Clientes que siguen restringidos. Vacío = el talento sale de la lista. */
  clientes: BlacklistKeptClient[];
  /**
   * La baja del global ya se ejecutó en un intento previo: solo se reintentan
   * las inserciones, para no volver a dar de baja un registro inexistente.
   */
  globalAlreadyRemoved?: boolean;
}

export interface BlacklistReplaceGlobalResult {
  ok: boolean;
  /** El global ya está dado de baja (aunque alguna inserción haya fallado). */
  globalRemoved: boolean;
  /** Clientes cuya restricción no se pudo conservar: son los del reintento. */
  failed: BlacklistKeptClient[];
}
