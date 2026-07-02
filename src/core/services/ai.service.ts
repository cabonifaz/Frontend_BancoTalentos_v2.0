import { ApiConfig } from "../hooks/useAsyncService";
import { axiosInstance } from "./axiosService";

interface SummaryResponse {
  idMensaje: number;
  mensaje: string;

  data: {
    summary: string;
  };
}

export const sumarizeFunctions = (
  functions: string,
  instructions: string,
  config?: ApiConfig,
) => {
  return axiosInstance.post<SummaryResponse>(
    "bdt/ia/summarize",
    {
      activities: functions,
      instructions: instructions,
    },
    {
      signal: config?.signal,
    },
  );
};
