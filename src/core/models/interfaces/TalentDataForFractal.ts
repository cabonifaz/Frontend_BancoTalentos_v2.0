import { Education } from "./Education";
import { Experience } from "./Experience";
import { Language } from "./Language";
import { SoftSkill } from "./SoftSkill";
import { TechnicalSkill } from "./TechnicalSkill";

export interface TalentForFractalCV {
  descripcion?: string;
  ciudad?: string;
  pais?: string;
  habilidadesTecnicas?: TechnicalSkill[];
  habilidadesBlandas?: SoftSkill[];
  experiencias?: Experience[];
  educaciones?: Education[];
  certificaciones: Education[];
  idiomas?: Language[];
}
