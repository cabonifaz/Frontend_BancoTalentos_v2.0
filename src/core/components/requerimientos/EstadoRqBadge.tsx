import {
  ESTADO_ASIGNADO,
  ESTADO_ATENDIDO,
  ESTADO_CANCELADO,
  ESTADO_EN_PRODUCCION,
  ESTADO_EN_SELECCION,
  ESTADO_PERDIDO,
  ESTADO_REGISTRADO,
  ESTADO_TERMINADO,
} from "../../utilities/constants";

/**
 * Mismo lenguaje visual que el badge de estado de Entrevistas.
 *
 * Los ocho estados del maestro 24 agrupados por lo que significan:
 * azul = el RQ avanza y está cerrado en su ciclo, morado = está en curso,
 * rojo = terminó mal, verde = recién entra, gris = ya no pide acción.
 */
const ESTADO_BADGE: Record<number, string> = {
  [ESTADO_REGISTRADO]: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  [ESTADO_ASIGNADO]: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  [ESTADO_TERMINADO]: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  [ESTADO_EN_SELECCION]: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  [ESTADO_EN_PRODUCCION]: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  [ESTADO_PERDIDO]: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  [ESTADO_CANCELADO]: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  [ESTADO_ATENDIDO]: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
};

/** Estado de un requerimiento (maestro 24): Requerimientos y Postulaciones del talento. */
export const EstadoRqBadge = ({
  idEstado,
  estado,
}: {
  idEstado: number;
  estado: string;
}) => (
  <span
    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${
      ESTADO_BADGE[idEstado] || "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200"
    }`}
  >
    {estado}
  </span>
);
