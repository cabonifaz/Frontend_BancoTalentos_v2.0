import { AddTalentParams } from "./AddTalentParams";

export interface TalentContactParams
  extends Pick<AddTalentParams, "telefono" | "email"> {
  idTalento: number;
}

export interface TalentSocialMediaParams
  extends Pick<AddTalentParams, "github" | "linkedin"> {
  idTalento: number;
}

export interface TalentProfilePhotoParams
  extends Pick<AddTalentParams, "fotoArchivo"> {
  idTalento: number;
}

export interface TalentCvParams {
  idTalento: number;
  idArchivo: number;
  string64: string;
  nombreArchivo: string;
  extensionArchivo: string;
  idTipoArchivo: number;
  idTipoDocumento: number;
}

export interface TalentSalaryParams
  extends Pick<
    AddTalentParams,
    | "montoInicialPlanilla"
    | "montoFinalPlanilla"
    | "montoInicialRxH"
    | "montoFinalRxH"
    | "idMoneda"
    | "idMonedaPlan"
    | "idMonedaRxh"
  > {
  idTalento: number;
  /**
   * Maestro 3 (NUM1). Ya no se pide al crear el talento: sólo el modal de
   * expectativas salariales puede fijarla o corregirla.
   */
  idModalidadFacturacion?: number;
}

export interface TalentCertParams {
  idTalento: number;
  nombreArchivo: string;
  extensionArchivo: string;
  idTipoArchivo: number;
  idTipoDocumento: number;
  string64: string;
}

export interface TalentTechSkillParams {
  idTalento: number;
  idHabilidad: number;
  habilidad: string;
  anios?: number | null;
}

export interface TalentSoftSkillParams {
  idTalento: number;
  idHabilidad: number;
  habilidad: string;
}

export interface TalentDescriptionParams
  extends Pick<AddTalentParams, "descripcion"> {
  idTalento: number;
}

export interface TalentAvailabilityParams
  extends Pick<AddTalentParams, "disponibilidad"> {
  idTalento: number;
}
