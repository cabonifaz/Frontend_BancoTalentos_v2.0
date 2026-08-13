import { BaseResponseFMI } from "../response/BaseResponse";

/**
 * Modelos para el módulo "Deshacer movimientos" (SUPERADMIN). Consumen la API de
 * FMI (/fmi/employee/*) vía axiosInstanceFMI: listado de empleados, historial
 * completo y los 4 deshacer (ingreso, movimiento, cese, solicitud de equipo).
 */

/** Fila del listado de empleados (SP_TALENTO_EMPLEADO_SEL vía /fmi/employee/list). */
export interface EmployeeListItem {
  idTalento: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  apellidos?: string;
  modalidad?: string;
}

export interface EmployeesListResponse extends BaseResponseFMI {
  talentos: EmployeeListItem[];
  totalElementos: number;
  totalPaginas: number;
}

/** ID_TIPO_HISTORIAL: 1 = ingreso, 2 = movimiento. */
export interface EmployeeMovement {
  movementId: number;
  movementDate: string; // dd/MM/yyyy
  reason: string;
  previousArea: string;
  position: string;
  movementType: string;
  movementTypeId: number;
}

export interface EmployeeEquipmentRequest {
  requestId: number;
  equipmentType: string;
  brand: string;
  requestDate: string; // dd/MM/yyyy
  deliveryDate: string; // dd/MM/yyyy
  mobileAssigned: "SI" | "NO";
}

export interface EmployeeTermination {
  terminationId?: number;
  terminationDate?: string; // dd/MM/yyyy
  terminationReason?: string;
  client?: string;
  requirementTitle?: string;
  requirementCode?: string;
}

/** Historial completo del empleado (/fmi/employee/detail). */
export interface EmployeeUndoDetailResponse extends BaseResponseFMI {
  talentId: number;
  names: string;
  lastname: string;
  surname: string;
  documentNumber: string;
  movements: EmployeeMovement[];
  equipmentRequests: EmployeeEquipmentRequest[];
  terminations: EmployeeTermination[];
}
