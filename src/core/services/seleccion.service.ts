import { ApiConfig } from "../hooks/useAsyncService";
import { OperationResult } from "../models/response/BaseResponse";
import { axiosInstance } from "./axiosService";

/** Filtros comunes de las estadísticas de Selección. Fechas en yyyy-MM-dd. */
export interface SelectionFilter {
  fechaIni: string;
  fechaFin: string;
  idCliente: number | null;
  /** Usuario de selección (USUCRE) elegido por el Admin. Solo aplica a Entrevistas. */
  usucre?: string | null;
}

export interface SelectionUser {
  idUsuario: number | null;
  /** USUCRE: clave con la que se filtran las entrevistas. */
  usuario: string;
  nombre: string;
  email: string;
}

export interface SelectionSummary {
  totalEntrevistas: number;
  totalIngresos: number;
}

export interface SeriePoint {
  periodo: string;
  cantidad: number;
}

export interface LabelCount {
  id: number | null;
  label: string;
  cantidad: number;
}

export interface SelectionInterviews {
  total: number;
  serie: SeriePoint[];
  porUsuario: LabelCount[];
  /** Detalle del usuario objetivo (Gestor: el suyo; Admin: el elegido). */
  usuarioTotal: number;
  usuarioSerie: SeriePoint[];
}

export interface PerformanceRow {
  cliente: string;
  entrevistas: number;
  ingresos: number;
}

export const getSeleccionResumen = async (
  data: SelectionFilter,
  config?: ApiConfig,
) =>
  axiosInstance.post<OperationResult<SelectionSummary>>(
    "bdt/seleccion/resumen",
    data,
    config,
  );

export const getSeleccionEntrevistas = async (
  data: SelectionFilter,
  config?: ApiConfig,
) =>
  axiosInstance.post<OperationResult<SelectionInterviews>>(
    "bdt/seleccion/entrevistas",
    data,
    config,
  );

export const getSeleccionIngresos = async (
  data: SelectionFilter,
  config?: ApiConfig,
) =>
  axiosInstance.post<OperationResult<LabelCount[]>>(
    "bdt/seleccion/ingresos",
    data,
    config,
  );

export const getSeleccionRendimiento = async (
  data: SelectionFilter,
  config?: ApiConfig,
) =>
  axiosInstance.post<OperationResult<PerformanceRow[]>>(
    "bdt/seleccion/rendimiento",
    data,
    config,
  );

/** Buscador de usuarios de selección (solo Admin, funcionalidad 2050). */
export const getSeleccionUsuarios = async (filtro: string, config?: ApiConfig) =>
  axiosInstance.get<OperationResult<SelectionUser[]>>(
    "bdt/seleccion/usuarios",
    { ...config, params: filtro ? { filtro } : undefined },
  );
