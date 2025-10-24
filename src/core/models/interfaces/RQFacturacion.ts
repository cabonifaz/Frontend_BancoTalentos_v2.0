export enum RQFacturacionEstadoRegistro {
  ACTIVO = 1,
  INACTIVO = 0,
}

export enum RQFacturacionGrupoModalidad {
  RxH = 1,
  PLANILLA = 2,
}

export enum RQFacturacionDeclaraSunat {
  NO = 0,
  SI = 1,
}

export interface RQFacturacion {
  idRequerimientoFacturacion: number;
  idRequerimiento: number;
  idModalidad: number;
  idGrupoModalidad: RQFacturacionGrupoModalidad;
  declaraSunat: RQFacturacionDeclaraSunat;
  sedeSunat: string;
  montoBase: number;
  montoMovilidad: number;
  montoMensual: number;
  montoTrimestral: number;
  montoSemestral: number;
  idEstadoRegistro: RQFacturacionEstadoRegistro;
}

export type RQFacturacionCreate = Omit<
  RQFacturacion,
  | "idRequerimientoFacturacion"
  | "idEstadoRegistro"
  | "idRequerimiento"
>;
