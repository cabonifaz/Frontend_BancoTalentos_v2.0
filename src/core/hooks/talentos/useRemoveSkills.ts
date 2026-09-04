import { useState } from "react";
import { axiosInstance } from "../../services/axiosService";
import { BaseResponse } from "../../models";

export const useRemoveSkill = () => {
  const [isLoading, setIsLoading] = useState(false);

  const removeTechnicalSkill = async (targetId: number) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.delete<BaseResponse>(
        "/bdt/talent/deleteTechskill?targetId=" + targetId,
      );

      if (response && response.data.idMensaje === 2)
        return response.data;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeSoftSkill = async (targetId: number) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.delete<BaseResponse>(
        "/bdt/talent/deleteSoftskill?targetId=" + targetId,
      );

      if (response && response.data.idMensaje === 2)
        return response.data;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, removeTechnicalSkill, removeSoftSkill };
};
