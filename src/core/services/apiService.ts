import { AxiosResponse } from "axios";
import { LoginParams, LoginResponse, TalentParams, TalentsResponse } from "../models";
import { axiosInstance, axiosInstanceNoToken } from "./axiosService";
import { Utils } from "../utilities/utils";

// auth
export const loginApp = ({ username, password }: LoginParams): Promise<AxiosResponse<LoginResponse>> => {
    return axiosInstanceNoToken.post("/bdt/auth/login", { username, password });
}

// talents
export const getTalents = (params: TalentParams): Promise<AxiosResponse<TalentsResponse>> => {
    const queryString = Utils.buildQueryString(params);
    const url = `/bdt/talent/list${queryString ? `?${queryString}` : ''}`;
    return axiosInstance.get(url);
}

export const getTalent = () => {

}

export const addTalent = () => {

}

// params
export const getParams = (paramIDs: string[]) => {

}