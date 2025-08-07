import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Utils } from "../utilities/utils";
import { BASE_URL, BASE_URL_FMI } from "../utilities/constants";

let axiosInstance: AxiosInstance; // BDT
let axiosInstanceNoToken: AxiosInstance; // BDT
let axiosInstanceFMI: AxiosInstance; // FMI
let axiosInstanceNoTokenFMI: AxiosInstance; // FMI

const createAxios = (baseURL: string): AxiosInstance => {
  return axios.create({ baseURL });
};

const setupInterceptors = (
  instance: AxiosInstance,
  configToken: boolean = false,
) => {
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
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
};

export const initAxios = () => {
  if (
    !axiosInstance ||
    !axiosInstanceNoToken ||
    !axiosInstanceFMI ||
    !axiosInstanceNoTokenFMI
  ) {
    axiosInstance = createAxios(BASE_URL);
    axiosInstanceNoToken = createAxios(BASE_URL);
    axiosInstanceFMI = createAxios(BASE_URL_FMI);
    axiosInstanceNoTokenFMI = createAxios(BASE_URL_FMI);

    setupInterceptors(axiosInstance, true);
    setupInterceptors(axiosInstanceNoToken, false);
    setupInterceptors(axiosInstanceFMI, true);
    setupInterceptors(axiosInstanceNoTokenFMI, false);
  }

  return {
    axiosInstance,
    axiosInstanceNoToken,
    axiosInstanceFMI,
    axiosInstanceNoTokenFMI,
  };
};

export {
  axiosInstance,
  axiosInstanceNoToken,
  axiosInstanceFMI,
  axiosInstanceNoTokenFMI,
};
