import { BaseResponse } from "./BaseResponse";
import { UserAdmin } from "../interfaces/UserAdmin";

export interface UserAdminListResponse {
  result: BaseResponse;
  registros: UserAdmin[];
  total: number;
}

export interface UserSignatureUrlResponse {
  result: BaseResponse;
  url: string | null;
  path: string | null;
}
