/**
 * Derivaciones del expediente.
 *
 * El backend de FMI no manda estado del talento, cliente actual, antigüedad ni
 * una línea de tiempo: manda contratos, movimientos, equipos y ceses. Todo lo
 * demás se calcula aquí, para no tener que tocar el SP ni el endpoint.
 */
import {
  ExpedienteCese,
  ExpedienteContrato,
  ExpedienteDetalle,
  ExpedienteEquipo,
  ExpedienteMovimiento,
} from "../models";

/** Tipos de historial (PARAMETROS maestro 9). */
export const HISTORIAL_INGRESO = 1;
export const HISTORIAL_MOVIMIENTO = 2;
export const HISTORIAL_CESE = 3;

/** Maestro 9: tipos de historial, para el modal de documentos. */
export const MAESTRO_TIPO_HISTORIAL = 9;

export const nombreCompleto = (detalle?: ExpedienteDetalle): string =>
  [detalle?.names, detalle?.lastname, detalle?.surname]
    .filter((parte) => !!parte && parte.trim() !== "")
    .join(" ")
    .trim();

export const iniciales = (nombre: string): string => {
  const partes = nombre.split(" ").filter(Boolean);
  if (partes.length === 0) return "?";
  return (partes[0][0] + (partes[1]?.[0] ?? "")).toUpperCase();
};

/** El SP devuelve las fechas ya formateadas como dd/MM/yyyy. */
export const parseFecha = (fecha?: string): Date | null => {
  if (!fecha) return null;
  const partes = fecha.trim().split("/");
  if (partes.length !== 3) return null;
  const [dia, mes, anio] = partes.map(Number);
  if (!dia || !mes || !anio) return null;
  const fechaObj = new Date(anio, mes - 1, dia);
  return isNaN(fechaObj.getTime()) ? null : fechaObj;
};

/** Contrato vigente: el SP marca ACTIVO/FINALIZADO y ordena del más nuevo. */
export const contratoVigente = (
  contratos?: ExpedienteContrato[]
): ExpedienteContrato | undefined =>
  contratos?.find((contrato) => contrato.status === "ACTIVO");

export type EstadoTalento = {
  texto: string;
  clase: string;
};

export const estadoTalento = (
  contratos?: ExpedienteContrato[]
): EstadoTalento => {
  if (!contratos || contratos.length === 0) {
    return {
      texto: "SIN CONTRATOS",
      clase:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300",
    };
  }
  if (contratoVigente(contratos)) {
    return {
      texto: "ACTIVO",
      clase:
        "bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300",
    };
  }
  return {
    texto: "CESADO",
    clase: "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300",
  };
};

/** "1 año 4 meses" desde el inicio del contrato vigente. */
export const antiguedad = (desde?: string): string => {
  const inicio = parseFecha(desde);
  if (!inicio) return "—";

  const hoy = new Date();
  let meses =
    (hoy.getFullYear() - inicio.getFullYear()) * 12 +
    (hoy.getMonth() - inicio.getMonth());
  if (hoy.getDate() < inicio.getDate()) meses -= 1;
  if (meses < 0) return "—";

  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  const partes: string[] = [];
  if (anios > 0) partes.push(`${anios} ${anios === 1 ? "año" : "años"}`);
  if (resto > 0) partes.push(`${resto} ${resto === 1 ? "mes" : "meses"}`);
  return partes.length > 0 ? partes.join(" ") : "menos de un mes";
};

export type TipoHito = "ingreso" | "movimiento" | "equipo" | "cese";

export interface HitoExpediente {
  tipo: TipoHito;
  fecha?: string;
  orden: number;
  titulo: string;
  detalle: string;
  /** Datos para pedir el PDF; sin ellos el hito se pinta sin botón. */
  pdf?: { tipoHistorial?: number; idHistorial?: number; idSolicitud?: number };
}

const orden = (fecha?: string): number => parseFecha(fecha)?.getTime() ?? 0;

/**
 * Un solo hilo con todo el expediente. En FMI esto hay que reconstruirlo
 * abriendo las cinco pestañas.
 *
 * El ingreso no lleva PDF por fila: el detalle no devuelve el `ID_HISTORIAL`
 * del ingreso de cada contrato, sólo se puede pedir el último (ver
 * `ModalDocumentos`).
 */
export const lineaDeTiempo = (detalle?: ExpedienteDetalle): HitoExpediente[] => {
  if (!detalle) return [];

  const hitos: HitoExpediente[] = [];

  (detalle.contracts ?? []).forEach((contrato: ExpedienteContrato) => {
    hitos.push({
      tipo: "ingreso",
      fecha: contrato.startDate,
      orden: orden(contrato.startDate),
      titulo: `Ingreso — ${contrato.client || "Sin cliente"}`,
      detalle: [
        contrato.rqCode,
        contrato.rqTitle,
        `Contrato ${contrato.contractId}`,
        contrato.contractType,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  });

  (detalle.movements ?? []).forEach((mov: ExpedienteMovimiento) => {
    hitos.push({
      tipo: "movimiento",
      fecha: mov.movementDate,
      orden: orden(mov.movementDate),
      titulo: `Movimiento — ${mov.movementType || "Sin tipo"}`,
      detalle: [mov.reason, mov.previousArea, mov.position]
        .filter((valor) => !!valor && valor !== "-")
        .join(" · "),
      pdf: {
        tipoHistorial: mov.movementTypeId ?? HISTORIAL_MOVIMIENTO,
        idHistorial: mov.movementId,
      },
    });
  });

  (detalle.equipmentRequests ?? []).forEach((equipo: ExpedienteEquipo) => {
    hitos.push({
      tipo: "equipo",
      fecha: equipo.requestDate,
      orden: orden(equipo.requestDate),
      titulo: "Solicitud de equipo",
      detalle: [
        equipo.equipmentType,
        equipo.brand !== "-" ? equipo.brand : undefined,
        equipo.deliveryDate ? `entregado el ${equipo.deliveryDate}` : undefined,
      ]
        .filter(Boolean)
        .join(" · "),
      pdf: { idSolicitud: equipo.requestId },
    });
  });

  (detalle.terminations ?? []).forEach((cese: ExpedienteCese) => {
    hitos.push({
      tipo: "cese",
      fecha: cese.terminationDate,
      orden: orden(cese.terminationDate),
      titulo: `Cese — ${cese.terminationReason || "Sin motivo"}`,
      detalle: [cese.client, cese.requirementCode, cese.requirementTitle]
        .filter((valor) => !!valor && valor !== "-")
        .join(" · "),
      pdf: { tipoHistorial: HISTORIAL_CESE, idHistorial: cese.terminationId },
    });
  });

  return hitos.sort((a, b) => b.orden - a.orden);
};
