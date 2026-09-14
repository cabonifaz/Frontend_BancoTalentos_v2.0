import { VacanteSkill } from "@/core/models/interfaces/VacanteSkill";
import { BaseResponseFMI } from "./BaseResponse";

export interface VacTechSkillsResponse extends BaseResponseFMI {
  habilidades: VacanteSkill[];
}
