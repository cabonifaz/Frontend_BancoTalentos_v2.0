import { AxiosResponse } from "axios";
import { LoginParams, LoginResponse } from "../models";
import { axiosInstanceNoToken } from "./axiosService";

// auth
export const loginApp = ({ username, password }: LoginParams): Promise<AxiosResponse<LoginResponse>> => {
    return axiosInstanceNoToken.post("/bdt/auth/login", { username, password });
}

// talents
export const getTalents = () => {

}

export const getTalent = () => {

}

export const addTalent = () => {

}

// params
export const getParams = (paramIDs: string[]) => {

}