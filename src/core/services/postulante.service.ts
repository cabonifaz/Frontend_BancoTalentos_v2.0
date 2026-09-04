/** Servicio del modulo `postulante` (formulario publico). */
import { AxiosResponse } from "axios";
import {
  axiosInstanceNoTokenFMI,
} from "./axiosService";
import { AddPostulanteParams, BaseResponseFMI } from "../models";

// postulantes
export const addPostulanteService = (
  data: AddPostulanteParams
): Promise<AxiosResponse<BaseResponseFMI>> => {
  const token = localStorage.getItem("tempToken") || "";

  return axiosInstanceNoTokenFMI.post(
    "/fmi/postulant/register",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
