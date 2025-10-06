import { useState } from "react";
import { AppError, BaseResponseFMI } from "../../models";
import { VacanteCarrera } from "../../models/interfaces/VacanteCarrera";
import { axiosInstanceFMI } from "../../services/axiosService";

export const useUpdateVacCarreras = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const update = async (idVacante: number, careers: VacanteCarrera[]) => {
    setIsUpdating(true);
    try {
      const response = await axiosInstanceFMI.post<BaseResponseFMI>(
        `fmi/requirement/vacantes/careers/update?idVacante=${idVacante}`,
        careers
      );
      const data = response.data;

      if (data.idTipoMensaje !== 2) throw new AppError(data.mensaje, "UNKNOWN");
      else return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      else
        throw new AppError(
          "Error al actuliazar las carrraas para las vacantes",
          "UNKNOWN"
        );
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, update };
};
