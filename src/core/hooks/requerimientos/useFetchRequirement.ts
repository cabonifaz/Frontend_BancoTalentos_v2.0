import { useState, useEffect, useCallback } from "react";
import { useSnackbar } from "notistack";
import { RequirementResponse } from "../../models/response/RequirementResponse";
import { axiosInstanceFMI } from "../../services/axiosService";

export const useFetchRequirement = (idRequerimiento: number | null) => {
  const [requirement, setRequirement] = useState<RequirementResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchRequirement = useCallback(async () => {
    if (!idRequerimiento) return;

    setLoading(true);
    try {
      const response = await axiosInstanceFMI.get<RequirementResponse>(
        `/fmi/requirement/data?idRequerimiento=${idRequerimiento}&showfiles=true&showVacantesList=true&showContactList=true`
      );

      if (response.data.idTipoMensaje === 2) {
        setRequirement(response.data);
        return;
      }
      enqueueSnackbar(response.data.mensaje, { variant: "error" });
    } catch (error) {
      enqueueSnackbar("Error al cargar los datos del requerimiento", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchRequirement();
  }, [fetchRequirement]);

  return { requirement, loading, fetchRequirement };
};
