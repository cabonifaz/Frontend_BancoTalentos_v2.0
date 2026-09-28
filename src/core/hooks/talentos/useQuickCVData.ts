import { axiosInstance } from "../../services/axiosService";

/** Lo único que la carga rápida extrae del CV. */
export interface QuickCVData {
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  /** Sólo dígitos, con prefijo internacional si el CV lo traía. */
  celular: string | null;
  email: string | null;
}

interface QuickCVResponse {
  idMensaje: number;
  mensaje: string;
  data: QuickCVData | null;
}

/**
 * Carga rápida: pide al backend sólo identidad y contacto del CV.
 *
 * Es un endpoint aparte de `analyze-cv` a propósito: el prompt corto es lo que
 * hace que el alta tarde segundos en vez de lo que tarda el análisis completo.
 */
export const useQuickCVData = () => {
  const fetchQuickCVData = async (cvFile: File): Promise<QuickCVData> => {
    const formData = new FormData();
    formData.append("file", cvFile);

    const response = await axiosInstance.post<QuickCVResponse>(
      "bdt/ia/analyze-cv-quick",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      },
    );

    const { idMensaje, mensaje, data } = response.data;
    if (idMensaje === 2 && data) return data;
    throw new Error(mensaje || "No se pudo leer el CV");
  };

  return { fetchQuickCVData };
};
