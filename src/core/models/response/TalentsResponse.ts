import { BaseResponse, Talent } from "..";

export interface TalentsResponse {
    result: BaseResponse;
    total: number;
    talents: Talent[];
}