import { useState } from "react";
import { AppError } from "../../models";
import { axiosInstance } from "../../services/axiosService";
import { NewTechSkillReq } from "../../models/requests/NewTechSkillReq";
import { NewTechSkillRes } from "../../models/response/NewTechSkillResponse";

export const useCreateNewTechSkill = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createNewTechSkill = async (skillName: string) => {
    setIsLoading(true);
    try {
      const upperSkillName = skillName.toUpperCase();

      if (upperSkillName.trim().length === 0)
        throw new AppError(
          "El nombre de la habilidad técnica no puede estar vacío",
          "VALIDATION"
        );
      const body: NewTechSkillReq = {
        skillName: upperSkillName,
      };

      const response = await axiosInstance.post<NewTechSkillRes>(
        "bdt/skills/techskills/create",
        body
      );

      const { baseResponse: baseReponse } = response.data;

      if (baseReponse.idMensaje !== 2)
        throw new AppError(baseReponse.mensaje, "UNKNOWN");

      return response;
    } catch (error: any) {
      console.log(error);
      if (error instanceof AppError) throw error;
      throw new AppError("Error al crear la habilidad técnica", "UNKNOWN");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createNewTechSkill,
  };
};
