import { useState } from "react";
import { VacanteSkill } from "../../models/interfaces/VacanteSkill";
import { axiosInstanceFMI } from "../../services/axiosService";
import { AppError, BaseResponseFMI } from "../../models";

export const useUpdateVacTechSkills = () => {
  const [isLoading, setIsLoading] = useState(false);

  const update = async (idVac: number, skills: VacanteSkill[]) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstanceFMI.post<BaseResponseFMI>(
        `fmi/requirement/vacantes/skills/update?idVacante=${idVac}`,
        skills
      );
      if (data.idTipoMensaje !== 2) throw new AppError(data.mensaje, "UNKNOWN");
      return data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Error al actualizar las habilidades técnicas",
        "UNKNOWN"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return [isLoading, update] as const;
};
