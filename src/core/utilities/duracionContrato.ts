import { addDays, addMonths, format, isValid, parse } from "date-fns";
import { Param } from "../models";

/**
 * Fechas del contrato deducidas de la duración pactada en la Gestión del RQ.
 *
 * Al confirmar un talento, el contrato arranca el día de la confirmación y
 * termina a esa fecha más la duración del RQ. Lo que se calcula aquí son sólo
 * los valores con los que se autocompletan los dos datepickers del Modal de
 * Ingreso: quien confirma puede cambiarlos.
 */

/** Unidades de tiempo del maestro 28 (duración). */
type Unidad = "dias" | "semanas" | "meses" | "anios";

/**
 * Hoy el maestro 28 es 1 = Días · 2 = Semanas · 3 = Meses. Es sólo el respaldo:
 * la unidad se resuelve primero por el nombre del parámetro, para que añadir
 * "Años" o reordenar el maestro no obligue a tocar el código.
 */
const UNIDAD_POR_ID: Record<number, Unidad> = {
  1: "dias",
  2: "semanas",
  3: "meses",
};

const sinAcentos = (texto: string): string =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const resolverUnidad = (
  idUnidad?: number | null,
  nombre?: string,
): Unidad | null => {
  const texto = sinAcentos(nombre ?? "");
  if (texto.startsWith("dia")) return "dias";
  if (texto.startsWith("seman")) return "semanas";
  if (texto.startsWith("mes")) return "meses";
  if (texto.startsWith("ano") || texto.startsWith("anio")) return "anios";
  return idUnidad ? UNIDAD_POR_ID[idUnidad] ?? null : null;
};

/** Fecha de hoy en el formato que usan los inputs de tipo date. */
export const hoyISO = (): string => format(new Date(), "yyyy-MM-dd");

/**
 * Fin del contrato = inicio + duración, sumada tal cual: un contrato de 1 mes
 * que empieza el 18/09 termina el 18/10.
 *
 * Devuelve `""` cuando el RQ no tiene duración de contrato configurada o la
 * unidad no se reconoce: mejor dejar el campo vacío que autocompletar una fecha
 * inventada.
 */
export const finDeContrato = (
  inicioISO: string,
  duracion?: number | null,
  idUnidad?: number | null,
  unidades: Param[] = [],
): string => {
  if (!inicioISO || !duracion || duracion <= 0) return "";

  const unidad = resolverUnidad(
    idUnidad,
    unidades.find((u) => u.num1 === idUnidad)?.string1,
  );
  if (!unidad) return "";

  const inicio = parse(inicioISO, "yyyy-MM-dd", new Date());
  if (!isValid(inicio)) return "";

  // La duración se guarda como DECIMAL, así que puede venir "1.5 meses": la
  // parte entera va en su unidad y el resto se reparte en días.
  const enteros = Math.floor(duracion);
  const resto = duracion - enteros;

  let fin: Date;
  switch (unidad) {
    case "dias":
      fin = addDays(inicio, Math.round(duracion));
      break;
    case "semanas":
      fin = addDays(inicio, Math.round(duracion * 7));
      break;
    case "meses":
      fin = addDays(addMonths(inicio, enteros), Math.round(resto * 30));
      break;
    case "anios":
      fin = addDays(addMonths(inicio, enteros * 12), Math.round(resto * 365));
      break;
  }

  return format(fin, "yyyy-MM-dd");
};
