/**
 * Expediente del talento: contratos, movimientos, solicitudes de equipo y ceses.
 *
 * Todo esto lo sirve el backend de FMI, que es el dueño de la vida laboral del
 * talento (BDT sólo pega). Los nombres de campo son los que devuelven
 * `/fmi/employee/list` (SP_TALENTO_CTR_LST) y `/fmi/employee/detail`
 * (SP_EMPLEADOS_DETALLES_SEL): no se renombra nada para no tocar el backend.
 */

/** Fila del buscador. El SP sólo devuelve estos tres campos. */
export interface ExpedienteTalentoItem {
  idTalento: number;
  nombres: string;
  apellidos: string;
}

export interface ExpedienteListResponse {
  idTipoMensaje: number;
  mensaje: string;
  talentos: ExpedienteTalentoItem[] | null;
  totalElementos?: number;
  totalPaginas?: number;
}

export interface ExpedienteContrato {
  contractId: number;
  talentName?: string;
  contractObject?: string;
  areaId?: number;
  contractTypeId?: number;
  /** Modalidad de contrato (maestro 3). */
  contractType?: string;
  area?: string;
  client?: string;
  rqCode?: string;
  rqTitle?: string;
  /** dd/MM/yyyy */
  startDate?: string;
  /** dd/MM/yyyy */
  endDate?: string;
  /** Ya viene formateado con símbolo de moneda ("S/ 6,500.00"). */
  baseAmount?: string;
  status?: "ACTIVO" | "FINALIZADO" | string;
}

export interface ExpedienteMovimiento {
  movementId: number;
  /** dd/MM/yyyy */
  movementDate?: string;
  reason?: string;
  previousArea?: string;
  position?: string;
  movementType?: string;
  /** Tipo de historial (maestro 9). Es lo que pide el endpoint del PDF. */
  movementTypeId?: number;
}

export interface ExpedienteEquipo {
  requestId: number;
  equipmentType?: string;
  brand?: string;
  /** dd/MM/yyyy */
  requestDate?: string;
  /** dd/MM/yyyy */
  deliveryDate?: string;
  /** El SP devuelve "SI" / "NO", no el número. */
  mobileAssigned?: string;
}

export interface ExpedienteCese {
  terminationId?: number;
  /** dd/MM/yyyy */
  terminationDate?: string;
  terminationReason?: string;
  client?: string;
  requirementTitle?: string;
  requirementCode?: string;
}

export interface ExpedienteDetalle {
  idTipoMensaje: number;
  mensaje: string;
  talentId: number;
  names?: string;
  lastname?: string;
  surname?: string;
  /** Correo personal de BT_TALENTO (el corporativo no viaja en este SP). */
  email?: string;
  /** BT_TALENTO.CELULAR, con el prefijo tal como se guardó ("+51 987654321"). */
  celular?: string;
  documentNumber?: string;
  description?: string;
  contracts?: ExpedienteContrato[];
  movements?: ExpedienteMovimiento[];
  equipmentRequests?: ExpedienteEquipo[];
  terminations?: ExpedienteCese[];
  photoUrl?: string;
  photoB64?: string;
  cvNormal?: string;
  cvEs?: string;
  cvEn?: string;
}

/** Respuesta de los endpoints que devuelven PDFs ya generados. */
export interface ExpedientePdfResponse {
  result: { idTipoMensaje: number; mensaje: string };
  lstArchivos: { nombreArchivo: string; archivoB64: string }[] | null;
}
