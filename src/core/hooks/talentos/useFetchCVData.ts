import { axiosInstance } from "../../services/axiosService";
import { IACVResponse } from "../../models/response/AICVResponse";

export const useFetchCVData = () => {
  /**
   * Fetches CV details by sending the PDF file directly to the AI analysis endpoint.
   * @param {File} cvFile The PDF file to analyze.
   * @returns {Promise<IACVResponse>} A promise that resolves with the AI CV response data.
   */
  const fetchCVDetails = async (cvFile: File) => {
    try {
      const formData = new FormData();
      formData.append("file", cvFile);

      const response = await axiosInstance.post<IACVResponse>(
        "bdt/ia/analyze-cv",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 180000, // 3 min por el tiempo de procesamiento
        },
      );

      const { idMensaje, mensaje } = response.data;
      if (idMensaje && idMensaje === 2) return response.data;
      throw new Error(mensaje || "Error al procesar el CV");
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error desconocido al procesar el CV",
      );
    }
  };

  return { fetchCVDetails };
};
