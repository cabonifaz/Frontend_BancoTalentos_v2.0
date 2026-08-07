// Modelos del módulo Gestores por Cliente (SUPERADMIN). Tabla CLIENTE_GESTOR.

export interface ClientGestor {
  idClienteGestor: number;
  idCliente: number;
  idUsuario: number;
  prioridad: number;
  usuario: string;
  nombres: string;
  apellidos: string;
}

/** Alta de un gestor en un slot libre. */
export interface AssignGestorParams {
  idCliente: number;
  idUsuario: number;
  prioridad: number;
}

/** Cambio del usuario de un slot existente. */
export interface ChangeGestorParams {
  idClienteGestor: number;
  idUsuario: number;
}
