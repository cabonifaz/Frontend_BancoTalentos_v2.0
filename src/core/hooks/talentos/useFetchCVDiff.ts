import { axiosInstance } from "../../services/axiosService";
import { IACVResponse } from "../../models/response/AICVResponse";

export const useFetchCVDiff = () => {
  /**
   * Envía un nuevo CV junto al id del talento al endpoint "Analizador de
   * Diferencias". A diferencia de {@link useFetchCVData}, la IA no extrae todo el
   * CV: compara el CV contra la información ya almacenada del talento y devuelve
   * ÚNICAMENTE la información nueva, adicional o mejorada.
   *
   * @param idTalento El id del talento a actualizar.
   * @param cvFile El nuevo CV en PDF a comparar.
   * @returns Diferencias detectadas (misma estructura que IACVResponse).
   */
  const fetchCVDiff = async (idTalento: number, cvFile: File) => {
    try {
      const formData = new FormData();
      formData.append("file", cvFile);
      formData.append("idTalento", String(idTalento));

      const response = await axiosInstance.post<IACVResponse>(
        "bdt/ia/analyze-cv-diff",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 180000, // 3 min por el tiempo de procesamiento
        },
      );

      const { idMensaje, mensaje } = response.data;
      if (idMensaje && idMensaje === 2) return response.data;
      throw new Error(mensaje || "Error al analizar el CV");
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error desconocido al analizar el CV",
      );
    }
  };

  return { fetchCVDiff };
};
