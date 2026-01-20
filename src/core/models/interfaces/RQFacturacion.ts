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
  currencyType: number;

  minBaseAmount: number;
  maxBaseAmount: number;

  minTravelAllowance: number;
  maxTravelAllowance: number;

  minMonthlyAmount: number;
  maxMonthlyAmount: number;

  minQuarterlyAmount: number;
  maxQuarterlyAmount: number;

  minSemiAnnualAmount: number;
  maxSemiAnnualAmount: number;
  montoSemestral: number;

  idEstadoRegistro: RQFacturacionEstadoRegistro;
}

export type RQFacturacionCreate = Omit<
  RQFacturacion,
  | "idRequerimientoFacturacion"
  | "idEstadoRegistro"
  | "idRequerimiento"
>;

export type RQFacturacionExtra = RQFacturacion & {
  nombreModalidad: string;
  nombreGrupoModalidad: string;
};
