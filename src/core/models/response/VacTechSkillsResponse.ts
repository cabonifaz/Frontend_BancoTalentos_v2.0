import { VacanteSkill } from "../interfaces/VacanteSkill";
import { BaseResponseFMI } from "./BaseResponse";

export interface VacTechSkillsResponse extends BaseResponseFMI {
  habilidades: VacanteSkill[];
}
