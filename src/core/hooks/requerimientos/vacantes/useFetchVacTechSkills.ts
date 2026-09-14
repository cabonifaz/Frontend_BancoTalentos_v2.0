import { useState } from "react";
import { axiosInstanceFMI } from "@/core/services/axiosService";
import { VacTechSkillsResponse } from "@/core/models/response/VacTechSkillsResponse";
import { AppError } from "@/core/models";

export const useFetchVacTechSkills = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchTechSkills = async (idVac: number) => {
    setIsLoading(true);
    try {
      const response = await axiosInstanceFMI.get<VacTechSkillsResponse>(
        `fmi/requirement/vacante/techskills?idVacante=${idVac}`
      );

      const data = response.data;

      if (data.idTipoMensaje !== 2) throw new AppError(data.mensaje, "UNKNOWN");
      return data.habilidades;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError("Ocurrión un error, inténtelo de nuevo", "UNKNOWN");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, fetchTechSkills };
};
