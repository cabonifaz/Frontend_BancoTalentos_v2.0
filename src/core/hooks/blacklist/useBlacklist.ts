import { useCallback, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  createBlacklist,
  getBlacklist,
  getBlacklistHistory,
  removeBlacklist,
  updateBlacklist,
} from "../../services/apiService";
import {
  BlacklistCreateParams,
  BlacklistHistory,
  BlacklistItem,
  BlacklistKeptClient,
  BlacklistRemoveParams,
  BlacklistReplaceGlobalParams,
  BlacklistReplaceGlobalResult,
  BlacklistUpdateParams,
} from "../../models";

/**
 * Gestiona la Lista Negra: listado de restricciones activas (con filtros),
 * historial por talento y operaciones CRUD. Tras crear/actualizar/eliminar se
 * vuelve a consultar el listado; nunca se muta el estado en memoria.
 *
 * El listado se pagina por talento (`total` alimenta el paginador) y el
 * historial por movimiento, pero se consume con scroll infinito: cada página
 * se acumula sobre la anterior y `totalHistory` indica cuándo ya no queda nada
 * por traer.
 */
export const useBlacklist = () => {
  const [items, setItems] = useState<BlacklistItem[]>([]);
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState<BlacklistHistory[]>([]);
  const [totalHistory, setTotalHistory] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const [historyFailed, setHistoryFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBlacklist = useCallback(
    async (filters?: { nombre?: string; idCliente?: number; pagina?: number }) => {
      setLoadingList(true);
      try {
        const { data } = await getBlacklist({
          nombre: filters?.nombre || undefined,
          // idCliente = 0 ("restringidos para todos los clientes") es un filtro
          // válido, así que aquí no cabe el `|| undefined` del nombre: el 0
          // caería a undefined y el SP devolvería la lista entera.
          idCliente: filters?.idCliente,
          pagina: filters?.pagina,
        });
        if (data.result?.idMensaje === 2) {
          setItems(data.registros ?? []);
          setTotal(data.total ?? 0);
        } else {
          setItems([]);
          setTotal(0);
          if (data.result?.idMensaje === 3) {
            enqueueSnackbar({
              message: data.result?.mensaje || "No se pudo cargar la lista negra",
              variant: "warning",
            });
          }
        }
      } catch {
        setItems([]);
        setTotal(0);
        enqueueSnackbar({
          message: "Ha ocurrido un error al cargar la lista negra",
          variant: "error",
        });
      } finally {
        setLoadingList(false);
      }
    },
    []
  );

  /**
   * Trae una página del historial. Con `append` la página se acumula sobre lo
   * ya cargado (scroll infinito) y se usa `loadingMoreHistory`, para no tapar
   * la línea de tiempo con el cargando; sin él reemplaza todo el listado.
   * `historyFailed` corta el scroll infinito ante un error, si no el
   * observador reintentaría la misma página en bucle.
   */
  const fetchHistory = useCallback(
    async (idTalento: number, pagina?: number, append = false) => {
      setHistoryFailed(false);
      if (append) setLoadingMoreHistory(true);
      else setLoadingHistory(true);
      try {
        const { data } = await getBlacklistHistory({ idTalento, pagina });
        if (data.result?.idMensaje === 2) {
          const page = data.historial ?? [];
          setHistory((prev) => (append ? [...prev, ...page] : page));
          setTotalHistory(data.total ?? 0);
        } else if (append) {
          setHistoryFailed(true);
        } else {
          setHistory([]);
          setTotalHistory(0);
        }
      } catch {
        setHistoryFailed(true);
        if (!append) {
          setHistory([]);
          setTotalHistory(0);
        }
        enqueueSnackbar({
          message: "Ha ocurrido un error al cargar el historial",
          variant: "error",
        });
      } finally {
        if (append) setLoadingMoreHistory(false);
        else setLoadingHistory(false);
      }
    },
    []
  );

  const createRestriction = async (
    params: BlacklistCreateParams
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const { data } = await createBlacklist(params);
      const ok = data.idMensaje === 2;
      enqueueSnackbar({
        message: data.mensaje || (ok ? "Restricción registrada" : "No se pudo registrar"),
        variant: ok ? "success" : data.idMensaje === 1 ? "warning" : "error",
      });
      return ok;
    } catch {
      enqueueSnackbar({
        message: "Ha ocurrido un error al registrar la restricción",
        variant: "error",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateRestriction = async (
    params: BlacklistUpdateParams
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const { data } = await updateBlacklist(params);
      const ok = data.idMensaje === 2;
      enqueueSnackbar({
        message: data.mensaje || (ok ? "Restricción actualizada" : "No se pudo actualizar"),
        variant: ok ? "success" : data.idMensaje === 1 ? "warning" : "error",
      });
      return ok;
    } catch {
      enqueueSnackbar({
        message: "Ha ocurrido un error al actualizar la restricción",
        variant: "error",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Baja lógica de una restricción concreta (ID_ESTADO_REGISTRO = 0). El motivo
   * es el de la baja y es el que queda en el historial: el SP ya no reutiliza
   * el motivo con el que se creó la restricción.
   */
  const removeRestriction = async (
    params: BlacklistRemoveParams
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const { data } = await removeBlacklist(params);
      const ok = data.idMensaje === 2;
      enqueueSnackbar({
        message: data.mensaje || (ok ? "Restricción eliminada" : "No se pudo eliminar"),
        variant: ok ? "success" : "error",
      });
      return ok;
    } catch {
      enqueueSnackbar({
        message: "Ha ocurrido un error al eliminar la restricción",
        variant: "error",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Levanta una restricción global (idCliente = 0) conservándola solo para los
   * clientes indicados: da de baja el registro global y crea una restricción
   * individual por cada cliente que se conserva. Con `clientes` vacío el
   * talento sale por completo de la lista negra.
   *
   * La orquestación vive en el front, así que NO es atómica. El orden importa:
   * primero la baja, porque el SP_INS rechaza restricciones individuales
   * mientras exista una global. Si la baja falla no se inserta nada (el estado
   * queda íntegro); si falla alguna inserción el talento queda libre para esos
   * clientes, por eso se devuelven en `failed` y el modal ofrece reintentar
   * solo esos, sin repetir la baja.
   */
  const replaceGlobalRestriction = async (
    params: BlacklistReplaceGlobalParams
  ): Promise<BlacklistReplaceGlobalResult> => {
    const { idListaNegra, idTalento, clientes, motivoEliminacion } = params;
    let globalRemoved = params.globalAlreadyRemoved ?? false;
    setSaving(true);
    try {
      if (!globalRemoved) {
        const { data } = await removeBlacklist({
          idListaNegra,
          motivo: motivoEliminacion,
        });
        if (data.idMensaje !== 2) {
          enqueueSnackbar({
            message: data.mensaje || "No se pudo quitar la restricción global",
            variant: data.idMensaje === 1 ? "warning" : "error",
          });
          return { ok: false, globalRemoved: false, failed: clientes };
        }
        globalRemoved = true;
      }

      const failed: BlacklistKeptClient[] = [];
      for (const cliente of clientes) {
        try {
          const { data } = await createBlacklist({
            idTalento,
            idCliente: cliente.idCliente,
            motivo: cliente.motivo,
          });
          if (data.idMensaje !== 2) failed.push(cliente);
        } catch {
          failed.push(cliente);
        }
      }

      if (failed.length > 0) {
        enqueueSnackbar({
          message: `No se pudo conservar la restricción de ${failed.length} cliente(s): por ahora el talento quedó libre para ellos.`,
          variant: "error",
        });
        return { ok: false, globalRemoved, failed };
      }

      enqueueSnackbar({
        message:
          clientes.length === 0
            ? "El talento salió de la lista negra"
            : `Restricción global levantada: se conservó para ${clientes.length} cliente(s)`,
        variant: "success",
      });
      return { ok: true, globalRemoved, failed: [] };
    } catch {
      enqueueSnackbar({
        message: "Ha ocurrido un error al levantar la restricción global",
        variant: "error",
      });
      return { ok: false, globalRemoved, failed: clientes };
    } finally {
      setSaving(false);
    }
  };

  return {
    items,
    total,
    history,
    totalHistory,
    loadingList,
    loadingHistory,
    loadingMoreHistory,
    historyFailed,
    saving,
    fetchBlacklist,
    fetchHistory,
    createRestriction,
    updateRestriction,
    removeRestriction,
    replaceGlobalRestriction,
  };
};
