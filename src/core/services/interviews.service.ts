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
  entrevistadores: string;
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
  entrevistadores: { fullname: string; email?: string }[];
  grabaciones: { enlace: string; fecha: string }[];
  calificacion: number;
  calificacionPersonal: number;
  calificacionExperiencia: number;
  calificacionIdiomas: number;
  calificacionEducacion: number;
  notasPersonales: string;
  notasExperiencia: string;
  notasIdiomas: string;
  notasEducacion: string;
  clienteResumen: string;
  motivoCancelacion: string;
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
  entrevistadores: string;
  grabaciones: string;
  calificacion: number;
  calificacionPersonal: number;
  calificacionExperiencia: number;
  calificacionIdiomas: number;
  calificacionEducacion: number;
  notasPersonales: string;
  notasExperiencia: string;
  notasIdiomas: string;
  notasEducacion: string;
  idsRqs: number[];
  motivoCancelacion: string;
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

export interface UploadInterviewFilePayload {
  idInterview: number;
  idFileType: number;
  file: File;
}

export const uploadInterviewFile = async (
  data: UploadInterviewFilePayload,
  config?: ApiConfig,
) => {
  const formData = new FormData();
  formData.append("idInterview", data.idInterview.toString());
  formData.append("idFileType", data.idFileType.toString());
  formData.append("file", data.file);

  return axiosInstanceFMI.post<BaseResponseFMI>(
    "fmi/interviews/file/upload",
    formData,
    config,
  );
};

export const deleteInterviewFile = async (
  fileId: number,
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<BaseResponseFMI>(
    "fmi/interviews/file/remove",
    null,
    {
      ...config,
      params: { fileId },
    },
  );
};
