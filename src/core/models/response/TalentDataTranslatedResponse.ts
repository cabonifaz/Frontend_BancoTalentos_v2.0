import { TalentForFractalCV } from "../interfaces/TalentDataForFractal";
import { BaseResponse } from "./BaseResponse";

export interface TalentDataTranslatedResponse extends BaseResponse {
  promptResponse: TalentForFractalCV;
}
