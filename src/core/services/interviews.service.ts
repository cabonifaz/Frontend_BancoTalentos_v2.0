import { ApiConfig } from "../hooks/useAsyncService";
import { BaseResponseFMI, OperationResult } from "../models";
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

export interface InterviewListRequest {
  npag: number | null;
  busqueda: string | null;
  idCliente: number | null;
  idEstado: number | null;
  fecha: string | null;
}

export interface InterviewResponseDTO {
  id: number;
  talento: string;
  tituloRq: string;
  cliente: string;
  fechaEntrevista: string;
  estado: string;
  idEstado: number;
  etapa: string;
  idEtapa: number;
}

// List Interviews
export const listInterviews = async (
  data: InterviewListRequest,
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<
    OperationResult<{
      items: InterviewResponseDTO[];
      totalElements: number;
      totalPages: number;
      currentPage: number;
    }>
  >("fmi/interviews/list", data, config);
};

// end List Interviews
