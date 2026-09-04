/** Servicio del modulo `mi-cuenta`. */
import { AxiosResponse } from "axios";
import {
  axiosInstance,
} from "./axiosService";
import { BaseResponse, UpdateUserParams, UserInfoResponse } from "../models";

export const getUserInfo = (_?: null): Promise<
  AxiosResponse<UserInfoResponse>
> => {
  return axiosInstance.get("/bdt/user/getUserInfo");
};

export const updateUserInfo = (
  data: UpdateUserParams
): Promise<AxiosResponse<BaseResponse>> => {
  return axiosInstance.put("/bdt/user/updateUserInfo", data);
};

// FMI ENDPOINTS

// requirements
