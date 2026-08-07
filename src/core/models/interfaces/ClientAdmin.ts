// Modelos del módulo Manejo de Clientes (SUPERADMIN). Tabla CLIENTE.

export interface ClientAdmin {
  idCliente: number;
  idEmpresa: number;
  ruc: string;
  razonSocial: string;
  direccion: string | null;
  ubicacion: string | null;
  direccionExacta: string | null;
  usucre: string | null;
  fchcre: string | null;
  usumod: string | null;
  fchmod: string | null;
  idEstadoRegistro: number;
}

export interface ClientAdminListParams {
  filtro?: string;
  /** null/omitido = activos e inactivos; 1 = activos; 0 = inactivos. */
  idEstado?: number;
  pagina?: number;
}

/** Alta/edición de un cliente. En el alta `idCliente` va sin definir. */
export interface ClientUpsertParams {
  idCliente?: number;
  ruc: string;
  razonSocial: string;
  direccion?: string | null;
  ubicacion?: string | null;
  direccionExacta?: string | null;
}
