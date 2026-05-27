import React from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Param, ParamsResponse } from "../models";
import { axiosInstanceNoToken } from "../services/axiosService";
import { ALL_PARAMS_IDS } from "../utilities/constants";

const PARAMS_QUERY_KEY = ["params"];

const fetchAllParams = async (): Promise<Record<string | number, Param[]>> => {
  const response = await axiosInstanceNoToken.get<ParamsResponse>(
    `/bdt/params?groupIdMaestros=${ALL_PARAMS_IDS}`,
  );

  const parametros = response.data.paramsList || [];

  if (response.data.result.idMensaje !== 2 || parametros.length === 0) {
    throw new Error(response.data.result.mensaje);
  }

  return parametros.reduce(
    (acc, param) => {
      acc[param.idMaestro] = acc[param.idMaestro] || [];
      acc[param.idMaestro].push(param);
      return acc;
    },
    {} as Record<string | number, Param[]>,
  );
};

export const useParams = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: PARAMS_QUERY_KEY,
    queryFn: fetchAllParams,
    retry: 10,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const refetchParams = () =>
    queryClient.invalidateQueries({ queryKey: PARAMS_QUERY_KEY });

  const paramsByMaestro: Record<string | number, Param[]> = data ?? {};

  return {
    paramsByMaestro,
    loading: isLoading,
    error: axios.isAxiosError(error) ? error.message : (error as Error)?.message ?? null,
    refetchParams,
  };
};

// kept for backwards compatibility — QueryClientProvider is in App.tsx
export const ParamsProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
