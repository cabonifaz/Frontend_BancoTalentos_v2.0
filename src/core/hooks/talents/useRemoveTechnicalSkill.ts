import { useState } from "react";
import { axiosInstance } from "../../services/axiosService";
import { BaseResponse } from "../../models";

export const useRemoveTechnicalSkill = () => {
  const [isLoading, setIsLoading] = useState(false);

  const remove = async (targetId: number) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.delete<BaseResponse>(
        "/bdt/talent/deleteTechskill?targetId=" + targetId
      );

      if (response && response.data.idMensaje == 2)
        return response.data;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, remove };
};
