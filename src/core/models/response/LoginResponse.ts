import { BaseResponse } from "./BaseResponse";

export interface LoginResponse {
    result: BaseResponse;
    token: string;
}