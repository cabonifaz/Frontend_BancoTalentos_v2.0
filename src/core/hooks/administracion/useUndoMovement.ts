import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { deleteEquipmentRequestFMI, undoCeseFMI, undoIngresoFMI, undoMovimientoFMI } from "../../services/administration.service";

/**
 * Deshacer el último movimiento de un empleado (ingreso, movimiento, cese o
 * solicitud de equipo), llamando a la API de FMI. Cada función devuelve `true`
 * si el backend respondió éxito (idTipoMensaje === 2), para que la pantalla
 * decida si refresca el historial.
 */
export const useUndoMovement = () => {
  const [isLoading, setIsLoading] = useState(false);

  const run = async (
    request: Promise<{ data: { idTipoMensaje: number; mensaje: string } }>,
    errorMsg: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data } = await request;
      const ok = data.idTipoMensaje === 2;
      enqueueSnackbar(data.mensaje, { variant: ok ? "success" : "error" });
      return ok;
    } catch (error) {
      console.error(errorMsg, error);
      enqueueSnackbar(errorMsg, { variant: "error" });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const undoIngreso = (idHistorial: number, idTalento: number) =>
    run(undoIngresoFMI(idHistorial, idTalento), "Error al deshacer el ingreso");

  const undoMovimiento = (idHistorial: number, idTalento: number) =>
    run(
      undoMovimientoFMI(idHistorial, idTalento),
      "Error al deshacer el movimiento"
    );

  const undoCese = (idHistorial: number, idTalento: number) =>
    run(undoCeseFMI(idHistorial, idTalento), "Error al deshacer el cese");

  const deleteEquipmentRequest = (idSolicitud: number, idTalento: number) =>
    run(
      deleteEquipmentRequestFMI(idSolicitud, idTalento),
      "Error al deshacer la solicitud de equipo"
    );

  return {
    isLoading,
    undoIngreso,
    undoMovimiento,
    undoCese,
    deleteEquipmentRequest,
  };
};
