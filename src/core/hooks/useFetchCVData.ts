import { axiosInstanceNoToken } from "../services/axiosService";
import { IACVResponse } from "../models/response/AICVResponse";

/**
 * Custom hook for fetching CV data from the AI analysis service.
 * @returns {{ fetchCVDetails: (cvText: string) => Promise<IACVResponse> }} An object containing the fetchCVDetails function.
 */
export const useFetchCVData = () => {
  /**
   * Fetches CV details by sending the extracted CV text to the AI analysis endpoint.
   * @param {string} cvText The extracted text content of the CV.
   * @returns {Promise<IACVResponse>} A promise that resolves with the AI CV response data.
   * @throws {Error} Throws an error if the processing fails or if the extracted information cannot be processed.
   */
  const fetchCVDetails = async (cvText: string) => {
    try {
      const payload = { extractedText: cvText };
      const respose = await axiosInstanceNoToken.post<IACVResponse>(
        "bdt/ia/analyze/cv",
        payload
      );
      const { result } = respose.data;

      if (result && result.idMensaje == 2) return respose.data;
      throw new Error();
    } catch (error) {
      throw new Error(
        "Lo sentimos, la información extraida no se pudo procesar, intente de nuevo"
      );
    }
  };

  return { fetchCVDetails };
};
