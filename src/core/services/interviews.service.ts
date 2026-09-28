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
  idTipoEntrevista: number | null;
  enlaceEntrevista: string | null;
  ubicacion: string | null;
  direccion: string | null;
  entrevistadores: string;
  perfil: string;
}

export const createInterview = async (
  data: CreateInterviewType,
  config?: ApiConfig,
) => {
  // Devuelve el id de la entrevista creada (data) para poder generar/subir el ICS.
  return axiosInstanceFMI.post<OperationResult<number>>(
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
  idEtapa: number | null;
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
  idTipoEntrevista?: number;
  enlaceEntrevista: string;
  ubicacion?: string;
  direccion?: string;
  entrevistadores: { fullname: string; email?: string; notificacion: boolean }[];
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
  perfil: string;
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
  idTipoEntrevista: number | null;
  enlaceEntrevista: string | null;
  ubicacion: string | null;
  direccion: string | null;
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
  perfil: string;
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

export interface GenerateUploadUrlPayload {
  idInterview: number;
  idFileType: number;
  fileName: string;
  contentType: string;
}

export interface GenerateUploadUrlResponse {
  data: {
    url: string;
    path: string;
    fileName: string;
  }
}

export interface GenerateDownloadUrlResponse {
  baseResponse: BaseResponseFMI;
  data: {
    url: string;
    fileName: string;
  };
}

export const generateUploadUrl = async (
  data: GenerateUploadUrlPayload,
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<GenerateUploadUrlResponse>(
    "fmi/interviews/file/upload-url",
    data,
    config,
  );
};

/**
 * Subida directa a S3 con la URL pre-firmada.
 *
 * Reexporta la implementacion canonica de `apiService.ts` en vez de duplicarla:
 * habia dos `uploadFileToS3` en el frontend y esta copia era la debil (fetch a
 * pelo con `file.type`, sin timeout ni traduccion del error de S3). Con el
 * reexport, entrevistas, talentos, requerimientos y firma de usuario suben por
 * el mismo codigo.
 */
export { uploadFileToS3, describeS3Error } from "./s3.service";

export interface ConfirmUploadPayload {
  idInterview: number;
  idFileType: number;
  fileName: string;
  path: string;
  /**
   * Solo para el ICS (archivo generado por el sistema): si es true, el backend
   * envía el correo de entrevista adjuntando el ICS recién registrado.
   */
  notify?: boolean;
  /** Asunto/tipo de notificación ("Nueva Entrevista" | "Actualización de Entrevista"). */
  notificationType?: string;
}

export const confirmUploadFile = async (
  data: ConfirmUploadPayload,
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<BaseResponseFMI>(
    "fmi/interviews/file/confirm-upload",
    data,
    config,
  );
};

export const downloadInterviewFile = async (fileId:number) => {
  return axiosInstanceFMI.get(
    `fmi/interviews/file/download/${fileId}`
  );
};

export const generateDownloadUrl = async (
  idFile: number,
  config?: ApiConfig,
): Promise<{ data: GenerateDownloadUrlResponse }> => {
  return axiosInstanceFMI.post(
    "fmi/interviews/file/download-url",
    { idFile },
    { signal: config?.signal },
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

// ─── Preguntas y respuestas (entrevista telefónica) ────────────────────────

export interface InterviewQuestion {
  /** PK de ENTREVISTAS_RESPUESTAS; sólo existe en lo ya guardado. */
  idRespuesta?: number;
  idEntrevista?: number;
  /** Pregunta del maestro 55 (num1). Es lo que se guarda. */
  idPregunta: number;
  /** Texto de la pregunta (string1 del maestro 55): sólo llega al listar. */
  pregunta?: string;
  respuesta?: string | null;
}

/**
 * Alta en bloque de las respuestas de una entrevista. Se llama con el id ya
 * creado, igual que la subida del ICS: al crear la entrevista todavía no existe
 * el id al que colgarlas.
 */
export const saveInterviewQuestions = async (
  idEntrevista: number,
  preguntas: InterviewQuestion[],
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<BaseResponseFMI>(
    "fmi/interviews/questions",
    { idEntrevista, preguntas },
    config,
  );
};

/** Edición de una respuesta ya registrada. */
export const updateInterviewQuestion = async (
  data: { idRespuesta: number; idPregunta: number; respuesta?: string | null },
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<BaseResponseFMI>(
    "fmi/interviews/questions/update",
    data,
    config,
  );
};

/** Baja lógica de una respuesta. */
export const deleteInterviewQuestion = async (
  idRespuesta: number,
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.post<BaseResponseFMI>(
    "fmi/interviews/questions/remove",
    null,
    { ...config, params: { idRespuesta } },
  );
};

/** Respuestas vigentes de una entrevista; el orden lo pone el maestro 55. */
export const listInterviewQuestions = async (
  idEntrevista: number,
  config?: ApiConfig,
) => {
  return axiosInstanceFMI.get<OperationResult<InterviewQuestion[]>>(
    `fmi/interviews/questions/${idEntrevista}`,
    config,
  );
};

// ─── Entrevistas de un talento ─────────────────────────────────────────────

export interface InterviewByTalent {
  idEntrevista: number;
  idTipoEntrevista?: number | null;
  /** dd/MM/yyyy */
  fecha?: string;
  /** HH:mm */
  hora?: string;
}

/**
 * Entrevistas de un talento, opcionalmente de un solo tipo, de la más reciente
 * a la más antigua. El listado general no sirve para esto: no filtra por
 * talento ni devuelve el tipo de entrevista.
 */
export const listInterviewsByTalent = async (
  idTalento: number,
  idTipoEntrevista?: number | null,
  config?: ApiConfig,
) => {
  const tipo =
    idTipoEntrevista != null ? `&idTipoEntrevista=${idTipoEntrevista}` : "";
  return axiosInstanceFMI.get<OperationResult<InterviewByTalent[]>>(
    `fmi/interviews/by-talent?idTalento=${idTalento}${tipo}`,
    config,
  );
};
