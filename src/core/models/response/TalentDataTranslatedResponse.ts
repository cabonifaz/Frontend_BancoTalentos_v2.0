import { TalentForFractalCV } from "@/core/models/interfaces/TalentDataForFractal";
import { BaseResponse } from "./BaseResponse";

export interface TalentDataTranslatedResponse extends BaseResponse {
  promptResponse: TalentForFractalCV;
}
