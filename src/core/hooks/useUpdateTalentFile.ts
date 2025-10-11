import { useState } from "react";
import { BaseResponse, AppError } from "../models";
import { UploadTalentFileRequest } from "../models/requests/talent";
import { axiosInstance } from "../services/axiosService";

export const useUpdateCVLang = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateFile = async (request: UploadTalentFileRequest) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post<BaseResponse>(
        `bdt/talent/updatecvlang`,
        request
      );

      const { idMensaje, mensaje } = response.data;

      if (idMensaje !== 2) throw new AppError(mensaje);
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Hubo un error actualizando el archivo el archivo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, addFile: updateFile };
};
