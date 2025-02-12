import { AxiosResponse } from "axios";
import { axiosInstance, axiosInstanceNoToken } from "./axiosService";
import { Utils } from "../utilities/utils";
import { FavouritesResponse, LoginParams, LoginResponse, ParamsResponse, TalentParams, TalentsResponse } from "../models";

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
export const getParams = (paramIDs: string): Promise<AxiosResponse<ParamsResponse>> => { // comma separated id's
    return axiosInstanceNoToken.get(`/bdt/params?groupIdMaestros=${paramIDs}`);
};

// user
export const getUserFavourites = (): Promise<AxiosResponse<FavouritesResponse>> => {
    return axiosInstance.get("/user/getFavourites");
};