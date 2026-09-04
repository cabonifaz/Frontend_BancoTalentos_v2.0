/** Servicio del modulo `auth`. */
import { AxiosResponse } from "axios";
import {
  axiosInstanceNoToken,
} from "./axiosService";
import { LoginParams, LoginResponse } from "../models";

// auth
export const loginApp = ({
  username,
  password,
}: LoginParams): Promise<
  AxiosResponse<LoginResponse>
> => {
  return axiosInstanceNoToken.post("/bdt/auth/login", {
    username,
    password,
  });
};

// user
