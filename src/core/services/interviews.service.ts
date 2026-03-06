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

export interface InterviewDetailDTO {
  id: number;
  idTalento: number;
  talento: string;
  fecha: string;
  hora: string;
  idEstado: number;
  estado: string;
  idEtapa: number;
  etapa: string;
  enlaceEntrevista: string;
  calificacion: number;
  notasPersonales: string;
  notasExperiencia: string;
  notasIdiomas: string;
  notasEducacion: string;
  clienteResumen: string;
  selectedRQs: { id: number; label: string; cliente: string }[];
  files: any[];
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

// Get Interview Detail
export const getInterviewDetail = async (id: number, config?: ApiConfig) => {
  return axiosInstanceFMI.get<OperationResult<InterviewDetailDTO>>(
    `fmi/interviews/detail/${id}`,
    config,
  );
};

export interface UpdateInterviewPayload {
  idEntrevista: number;
  idTalento: number;
  fecha: string;
  hora: string;
  estado: number;
  etapa: number;
  enlaceEntrevista: string;
  calificacion: number;
  notasPersonales: string;
  notasExperiencia: string;
  notasIdiomas: string;
  notasEducacion: string;
  idsRqs: number[];
}

export const updateInterview = async (
  data: UpdateInterviewPayload,
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<BaseResponseFMI>(
    "fmi/interviews/update",
    data,
    config,
  );
};
