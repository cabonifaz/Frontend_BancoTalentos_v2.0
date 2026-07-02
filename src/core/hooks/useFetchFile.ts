import { useState } from "react";
import { getCvFile } from "../services/apiService";
import { AppError } from "../models";

export const useFetchFile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchFile = async (idFile: number) => {
    try {
      setIsLoading(true);
      const response = await getCvFile(idFile);
      const { idMensaje } = response.data.result;

      if (idMensaje !== 2)
        throw new AppError("Error al obtner el archivo");

      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error al obtener el archivo");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, fetchFile };
};
