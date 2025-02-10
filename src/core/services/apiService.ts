import axios, { AxiosResponse } from "axios";
import { loadAbort } from "../utilities/loadAbort";
import { LoginParams, LoginResponse, UseApiCall } from "../models";
import { axiosInstanceNoToken } from "./axiosService";

// auth
export const loginApp = ({ username, password }: LoginParams): Promise<AxiosResponse<LoginResponse>> => {
    return axiosInstanceNoToken.post("/bdt/auth/login", { username, password });
}

// talents
export const getTalents = () => {
    const controller = loadAbort();

    return {
        call: axios.get("/", { signal: controller.signal }),
        controller
    }
}

export const getTalent = () => {
    const controller = loadAbort();

    return {
        call: axios.get("/", { signal: controller.signal }),
        controller
    }
}

export const addTalent = (talent: unknown): UseApiCall<null> => {
    const controller = loadAbort();

    return {
        call: axios.post("/", talent, { signal: controller.signal }),
        controller
    }
}

// params
export const getParams = (paramIDs: string[]) => {
    const controller = loadAbort();

    return {
        call: axios.get("/", { signal: controller.signal }),
        controller
    }
}