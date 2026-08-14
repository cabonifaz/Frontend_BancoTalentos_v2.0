import { AxiosResponse } from "axios";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiConfig } from "../../../core/hooks/useAsyncService";
import { OperationResult } from "../../../core/models/response/BaseResponse";
import { SelectionFilter } from "../../../core/services/seleccion.service";
import { defaultRange } from "./components/dateRange";
import { FiltersState } from "./components/FiltersBar";

type Fetcher<T> = (
  data: SelectionFilter,
  config?: ApiConfig,
) => Promise<AxiosResponse<OperationResult<T>>>;

/**
 * Estado de una sección de Selección: filtros + datos. Sólo consulta al montar y
 * al presionar Aplicar (no en cada cambio de filtro). Cancela peticiones obsoletas.
 */
export function useSelectionSection<T>(
  fetcher: Fetcher<T>,
  initial: T,
  options?: { emptyDates?: boolean },
) {
  const [filters, setFilters] = useState<FiltersState>({
    ...(options?.emptyDates ? { fechaIni: "", fechaFin: "" } : defaultRange()),
    idCliente: null,
  });
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const res = await fetcher(
        {
          fechaIni: filters.fechaIni,
          fechaFin: filters.fechaFin,
          idCliente: filters.idCliente,
          usucre: filters.usucre ?? null,
        },
        { signal: controller.signal },
      );
      const body = res.data;
      if (body.baseResponse?.idTipoMensaje === 2) {
        setData(body.data);
      } else {
        enqueueSnackbar(body.baseResponse?.mensaje ?? "No se pudo consultar", {
          variant: "warning",
        });
        setData(initial);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setData(initial);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { filters, setFilters, data, loading, apply: load };
}
