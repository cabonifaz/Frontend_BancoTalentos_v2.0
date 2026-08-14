// Modelos del módulo Manejo de Usuarios (SUPERADMIN). Tablas USUARIOS / USUARIO_ROL.

export interface UserAdmin {
  idUsuario: number;
  idEmpresa: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  email: string | null;
  cargo: string | null;
  telefono: string | null;
  firma: string | null;
  idEstadoRegistro: number;
  idRol: number | null;
  rol: string | null;
}

export interface UserAdminListParams {
  filtro?: string;
  /** null/omitido = activos e inactivos; 1 = activos; 0 = inactivos. */
  idEstado?: number;
  pagina?: number;
}

/** Edición de usuario. No incluye USUARIO. `firma` = ruta S3 nueva o null (conserva).
 *  `clave` opcional: texto plano (el SP la cifra SHA2_256); null/omitida = no cambia. */
export interface UserUpsertParams {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  email?: string | null;
  cargo?: string | null;
  telefono?: string | null;
  firma?: string | null;
  clave?: string | null;
  idTipoRol: number;
}

/** Alta de usuario. La clave viaja en texto plano; el SP la cifra (SHA2_256). Sin firma. */
export interface UserCreateParams {
  nombres: string;
  apellidos: string;
  usuario: string;
  clave: string;
  email: string;
  telefono: string;
  cargo?: string | null;
  idTipoRol: number;
}

export interface UserSignatureUrlParams {
  idUsuario: number;
  fileName: string;
  contentType: string;
}
