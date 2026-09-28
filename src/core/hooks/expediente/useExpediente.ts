/** Hooks del módulo `expediente`. Todos pegan al backend de FMI. */
import { useCallback, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  getExpediente,
  getExpedienteEquipoPdf,
  getExpedienteHistorialPdf,
  getExpedienteUltimoEquipoPdf,
  getExpedienteUltimoHistorialPdf,
  searchExpedientes,
} from "../../services/expediente.service";
import {
  ExpedienteDetalle,
  ExpedientePdfResponse,
  ExpedienteTalentoItem,
} from "../../models";
import { openPdfFilesInNewTab } from "../../utilities/pdfViewer";

/**
 * Buscador de talentos con expediente.
 *
 * `SP_TALENTO_CTR_LST` devuelve como máximo 5 filas y sólo busca por nombre
 * completo, así que aquí no hay filtros ni paginación: lo que se muestra es
 * exactamente lo que el SP puede dar.
 */
export const useBuscadorExpediente = () => {
  const [talentos, setTalentos] = useState<ExpedienteTalentoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const buscar = useCallback(async (termino?: string) => {
    setLoading(true);
    try {
      const { data } = await searchExpedientes(termino);
      if (data.idTipoMensaje === 2) {
        setTalentos(data.talentos ?? []);
      } else {
        setTalentos([]);
        enqueueSnackbar(data.mensaje, { variant: "warning" });
      }
    } catch (error) {
      setTalentos([]);
      enqueueSnackbar("No se pudo obtener la lista de talentos", {
        variant: "error",
      });
    } finally {
      setBuscado(true);
      setLoading(false);
    }
  }, []);

  return { talentos, loading, buscado, buscar };
};

/** Expediente completo de un talento. */
export const useExpedienteDetalle = () => {
  const [detalle, setDetalle] = useState<ExpedienteDetalle | undefined>();
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async (idTalento: number) => {
    setLoading(true);
    try {
      const { data } = await getExpediente(idTalento);
      if (data.idTipoMensaje === 2) {
        setDetalle(data);
        return;
      }
      setDetalle(undefined);
      enqueueSnackbar(data.mensaje, { variant: "warning" });
    } catch (error) {
      setDetalle(undefined);
      enqueueSnackbar("No se pudo obtener el expediente del talento", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiar = useCallback(() => setDetalle(undefined), []);

  return { detalle, loading, cargar, limpiar };
};

/** Los PDFs del expediente: movimientos, ceses y solicitudes de equipo. */
export const useExpedientePdf = () => {
  const [loading, setLoading] = useState(false);

  const abrir = useCallback(
    async (
      peticion: Promise<{ data: ExpedientePdfResponse }>,
      errorMsg: string
    ) => {
      setLoading(true);
      try {
        const { data } = await peticion;
        const archivos = data.lstArchivos ?? [];
        if (data.result?.idTipoMensaje !== 2 || archivos.length === 0) {
          enqueueSnackbar(data.result?.mensaje || errorMsg, {
            variant: "warning",
          });
          return;
        }
        openPdfFilesInNewTab(archivos);
      } catch (error) {
        enqueueSnackbar(errorMsg, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verHistorial = useCallback(
    (tipoHistorial: number, idHistorial: number, idTalento: number) =>
      abrir(
        getExpedienteHistorialPdf(tipoHistorial, idHistorial, idTalento),
        "No se pudo obtener el formulario"
      ),
    [abrir]
  );

  const verEquipo = useCallback(
    (idSolicitud: number, idTalento: number) =>
      abrir(
        getExpedienteEquipoPdf(idSolicitud, idTalento),
        "No se pudo obtener la solicitud de equipo"
      ),
    [abrir]
  );

  const verUltimoHistorial = useCallback(
    (tipoHistorial: number, idTalento: number) =>
      abrir(
        getExpedienteUltimoHistorialPdf(tipoHistorial, idTalento),
        "El talento no tiene ese formulario"
      ),
    [abrir]
  );

  const verUltimoEquipo = useCallback(
    (idTalento: number) =>
      abrir(
        getExpedienteUltimoEquipoPdf(idTalento),
        "El talento no tiene solicitudes de equipo"
      ),
    [abrir]
  );

  return { loading, verHistorial, verEquipo, verUltimoHistorial, verUltimoEquipo };
};
