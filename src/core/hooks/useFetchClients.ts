import { useCallback, useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Client } from "@/core/models/interfaces/Client";
import { axiosInstanceFMI } from "@/core/services/axiosService";
import { ClientListResponse } from "@/core/models";

export const useFetchClients = () => {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const response =
        await axiosInstanceFMI.get<ClientListResponse>("/fmi/client/list");

      if (response.data.idTipoMensaje === 2) {
        setClientes(response.data.clientes || []);
        return;
      }
      enqueueSnackbar(response.data.mensaje, { variant: "warning" });
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return { clientes, loading, fetchClients };
};
