import { useState } from "react";
import { AxiosResponse } from "axios";
import { useSnackbar } from "notistack";
import { BaseResponse, BaseResponseFMI } from "../models/response/BaseResponse";
import { axiosInstanceFMI } from "../services/axiosService";

interface UsePostHookReturn {
  postData: (
    url: string,
    data: Record<string, unknown>
  ) => Promise<BaseResponseFMI>;
  postloading: boolean;
}

export const usePostHook = (): UsePostHookReturn => {
  const { enqueueSnackbar } = useSnackbar();
  const [postloading, setPostLoading] = useState(false);

  const postData = async (
    url: string,
    data: Record<string, unknown>
  ): Promise<BaseResponseFMI> => {
    setPostLoading(true);
    try {
      const res: AxiosResponse<BaseResponseFMI> = await axiosInstanceFMI.post(
        url,
        data
      );
      if (res.data.idTipoMensaje === 2) {
        enqueueSnackbar(res.data.mensaje, { variant: "success" });
        return res.data;
      }
      enqueueSnackbar(res.data.mensaje, { variant: "error" });
      return res.data;
    } catch (error) {
      return { idTipoMensaje: 3, mensaje: "Ocurrió un error en la solicitud." };
    } finally {
      setPostLoading(false);
    }
  };

  return { postData, postloading };
};
