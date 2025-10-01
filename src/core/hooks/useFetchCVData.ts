import { useState } from "react";
import { axiosInstance } from "../services/axiosService";
import { IACVResponse } from "../models/response/AICVResponse";
import { enqueueSnackbar } from "notistack";

export const useFetchCVData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchCVDetails = async (cvText: string) => {
    setIsLoading(true);

    try {
      const payload = { extractedText: cvText };
      const respose = await axiosInstance.post<IACVResponse>(
        "bdt/ia/analyze/cv",
        payload
      );
      const { result } = respose.data;

      if (result && result.idMensaje == 2) return respose.data;
      else {
        enqueueSnackbar({
          message: "No se ha podido extraer la información del CV",
          variant: "warning",
        });
      }
    } catch (error) {
      enqueueSnackbar({
        message: "Ha ocurrido un error analizando el CV",
        variant: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, fetchCVDetails };
};
