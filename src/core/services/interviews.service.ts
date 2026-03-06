import { ApiConfig } from "../hooks/useAsyncService";
import { BaseResponse, BaseResponseFMI } from "../models";
import { axiosInstanceFMI } from "./axiosService";

export interface CreateInterviewType {
  idTalento: number;
  lstIdRequerimientos: number[];
  fecha: string;
  hora: string;
  estado: number;
  etapa: number;
  enlaceEntrevista: string;
}

export const createInterview = async (
  data: CreateInterviewType,
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<BaseResponseFMI>(
    "fmi/interviews/create",
    data,
    config,
  );
};
