// Modelos del módulo Manejo de Parámetros (SUPERADMIN).
// La tabla PARAMETROS es genérica: el significado de NUM/STRING/DATE depende del
// maestro, por eso aquí se exponen todos los campos tal cual.

export interface ParamMaster {
  idMaestro: number;
  descripcion: string;
  totalRegistros: number;
  registrosActivos: number;
  registrosInactivos: number;
}

export interface ParamItem {
  idParametro: number;
  idMaestro: number;
  descripcion: string | null;
  idSubMaestro: number | null;
  num1: number | null;
  num2: number | null;
  num3: number | null;
  string1: string | null;
  string2: string | null;
  string3: string | null;
  date1: string | null;
  date2: string | null;
  date3: string | null;
  usucre: string | null;
  fchcre: string | null;
  usumod: string | null;
  fchmod: string | null;
  idEstadoRegistro: number;
}

export interface ParamMasterListParams {
  filtro?: string;
  pagina?: number;
}

/** Modo 2: parámetros de un maestro, paginados. `pagina` omitido = todo. */
export interface ParamItemListParams {
  idMaestro: number;
  pagina?: number;
}

/** Alta/edición de un parámetro. En el alta `idParametro` va sin definir. */
export interface ParamUpsertParams {
  idParametro?: number;
  idMaestro: number;
  descripcion?: string | null;
  idSubMaestro?: number | null;
  num1?: number | null;
  num2?: number | null;
  num3?: number | null;
  string1?: string | null;
  string2?: string | null;
  string3?: string | null;
  date1?: string | null;
  date2?: string | null;
  date3?: string | null;
}
