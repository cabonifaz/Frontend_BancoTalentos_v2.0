import { useState, useCallback } from "react";
import axios from "axios";
import { Param, ParamsResponse } from "../models";
import { axiosInstanceNoToken } from "../services/axiosService";

export const useFetchParams = () => {
  const [paramsByMaestro, setParamsByMaestro] = useState<
    Record<number, Param[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParams = useCallback(async (idMaestros: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstanceNoToken.get<ParamsResponse>(
        `/bdt/params?groupIdMaestros=${idMaestros}`,
      );

      const parametros = response.data.paramsList || [];

      if (response.data.result.idMensaje === 2 && parametros.length > 0) {
        const groupedData = parametros.reduce(
          (acc, param) => {
            acc[param.idMaestro] = acc[param.idMaestro] || [];
            acc[param.idMaestro].push(param);
            return acc;
          },
          {} as Record<number, Param[]>,
        );

        setParamsByMaestro(groupedData); // sobrescribimos (no cache)
      } else {
        setError(response.data.result.mensaje);
      }
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.result?.mensaje || err.message
        : "Error desconocido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    paramsByMaestro,
    loading,
    error,
    fetchParams,
  };
};
