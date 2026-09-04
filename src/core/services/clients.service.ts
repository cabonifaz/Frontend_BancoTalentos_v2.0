/** Catálogo de clientes. Lo consumen varios módulos, por eso vive en core. */
import { AxiosResponse } from "axios";
import {
  axiosInstanceFMI,
} from "./axiosService";
import { ClientListResponse } from "../models";

// requirements
export const getClients = (): Promise<
  AxiosResponse<ClientListResponse>
> => {
  return axiosInstanceFMI.get("/fmi/client/list");
};
