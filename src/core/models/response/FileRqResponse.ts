import { BaseResponseFMI } from "./BaseResponse";

export interface FileRqResponse {
  file: string;
  ext: string;
  result: BaseResponseFMI;
}
