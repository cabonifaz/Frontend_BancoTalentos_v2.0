import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { Utils } from "../utilities/utils";
import { BASE_URL } from "../utilities/constants";

let axiosInstance: AxiosInstance;
let axiosInstanceNoToken: AxiosInstance;

const createAxios = (baseURL: string): AxiosInstance => {
    return axios.create({ baseURL });
}

const setupInterceptors = (instance: AxiosInstance, configToken: boolean = false) => {
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            if (configToken) {
                const token = localStorage.getItem("token") || undefined;
                if (Utils.isValidToken(token)) {
                    config.headers.Authorization = `Bearer ${token}`;
                    return config;
                }
                return Promise.reject(new Error("Token expirado"));
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
}

export const initAxios = () => {
    if (!axiosInstance || !axiosInstanceNoToken) {
        axiosInstance = createAxios(BASE_URL);
        axiosInstanceNoToken = createAxios(BASE_URL);

        setupInterceptors(axiosInstance, true);
        setupInterceptors(axiosInstanceNoToken);
    }

    return { axiosInstance, axiosInstanceNoToken };
}

export { axiosInstance, axiosInstanceNoToken };