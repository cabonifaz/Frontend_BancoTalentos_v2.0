import { useCallback, useState } from "react";
import { Tarifa } from "@/core/models/interfaces/Tarifa";
import { TarifarioResponse } from "@/core/models/response/TarifarioResponse";
import { enqueueSnackbar } from "notistack";
import { axiosInstanceFMI } from "@/core/services/axiosService";

export const useFetchTarifario = () => {
  const [tarifario, setTarifario] = useState<Tarifa[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTarifario = useCallback(async (idCliente: number) => {
    setLoading(true);

    try {
      const response = await axiosInstanceFMI.get<TarifarioResponse>(
        `/fmi/tarifario/list?idCliente=${idCliente}`
      );

      if (response.data.idTipoMensaje === 2) {
        setTarifario(response.data.lstTarifario);
        return;
      }

      enqueueSnackbar(response.data.mensaje, { variant: "warning" });
    } catch (e) {
      console.error("Failed to fetch tarifario");
      setTarifario([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tarifario, fetchTarifario, loading };
};
