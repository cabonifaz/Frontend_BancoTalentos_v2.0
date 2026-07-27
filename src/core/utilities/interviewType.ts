import { normalizeText } from "./textUtils";
import {
  TIPO_ENTREVISTA_PRESENCIAL_LABEL,
  TIPO_ENTREVISTA_VIRTUAL_LABEL,
} from "./constants";

/**
 * Lógica compartida entre las pantallas de Crear y Editar entrevista para el
 * comportamiento condicional según el Tipo de Entrevista (maestro 47).
 *
 * El valor del tipo es el string del parámetro (p. ej. "PRESENCIAL" / "VIRTUAL");
 * se compara de forma normalizada para tolerar mayúsculas/tildes.
 */

export const isVirtualType = (tipo?: string | null): boolean =>
  normalizeText(tipo) === normalizeText(TIPO_ENTREVISTA_VIRTUAL_LABEL);

export const isPresencialType = (tipo?: string | null): boolean =>
  normalizeText(tipo) === normalizeText(TIPO_ENTREVISTA_PRESENCIAL_LABEL);

/** Parámetro del maestro 47 (solo los campos que necesitamos). */
interface TipoEntrevistaParam {
  num1: number;
  string1: string;
}

/**
 * ID_TIPO_ENTREVISTA a enviar al backend a partir del valor textual seleccionado.
 * Devuelve `num1` del parámetro (misma convención que estado/etapa). Sin hardcodear.
 */
export const resolveTipoEntrevistaId = (
  types: TipoEntrevistaParam[],
  tipoValue?: string,
): number | null => {
  if (!tipoValue) return null;
  const match = types.find(
    (t) => normalizeText(t.string1) === normalizeText(tipoValue),
  );
  return match ? match.num1 : null;
};

/**
 * Etiqueta textual (string1) del tipo a partir del ID_TIPO_ENTREVISTA (num1)
 * devuelto por el backend. Usado para seleccionar el tipo al abrir una entrevista.
 */
export const resolveTipoEntrevistaLabel = (
  types: TipoEntrevistaParam[],
  id?: number | null,
): string => {
  if (id == null) return "";
  const match = types.find((t) => t.num1 === id);
  return match ? match.string1 : "";
};

/** Datos mínimos de un RQ seleccionado para derivar clientes/ubicaciones. */
export interface RqClientInfo {
  idCliente?: number;
  cliente?: string;
  /** Ubicación del cliente (llega en la respuesta del requerimiento). */
  ubicacion?: string;
}

/**
 * Clientes únicos de los RQ seleccionados. La deduplicación es por `idCliente`.
 * Los RQ aún sin `idCliente` (enriquecimiento asíncrono pendiente) se conservan
 * para no perderlos, pero no se deduplican entre sí.
 */
export const deriveUniqueClients = <T extends RqClientInfo>(rqs: T[]): T[] => {
  const seenIds = new Set<number>();
  const result: T[] = [];
  for (const rq of rqs) {
    if (rq.idCliente == null) {
      result.push(rq);
      continue;
    }
    if (!seenIds.has(rq.idCliente)) {
      seenIds.add(rq.idCliente);
      result.push(rq);
    }
  }
  return result;
};

/** Nombres de clientes únicos (dedupe por idCliente; fallback por nombre). */
export const deriveUniqueClientNames = (rqs: RqClientInfo[]): string[] => {
  const byId = new Map<number, string>();
  const withoutId: string[] = [];
  for (const rq of rqs) {
    if (rq.idCliente != null) {
      if (!byId.has(rq.idCliente)) byId.set(rq.idCliente, rq.cliente || "");
    } else if (rq.cliente) {
      withoutId.push(rq.cliente);
    }
  }
  return Array.from(
    new Set([...byId.values(), ...withoutId]),
  ).filter(Boolean);
};

/**
 * Ubicaciones disponibles derivadas de los clientes únicos de los RQ.
 * Se deduplican por valor, de modo que la misma ubicación (aunque pertenezca a
 * varios clientes) aparece una sola vez.
 */
export const deriveLocationOptions = (rqs: RqClientInfo[]): string[] => {
  const uniqueClients = deriveUniqueClients(rqs);
  const locations = uniqueClients
    .map((c) => (c.ubicacion || "").trim())
    .filter(Boolean);
  return Array.from(new Set(locations));
};

export interface InterviewTypeFields {
  tipoEntrevista: string;
  enlaceEntrevista: string | null;
  ubicacion: string | null;
  direccion: string | null;
}

/**
 * Normaliza los campos dependientes del tipo para el payload al backend,
 * garantizando que los campos que no aplican al tipo seleccionado viajen en NULL
 * (nunca valores obsoletos del otro tipo).
 */
export const buildInterviewTypeFields = (data: {
  tipoEntrevista?: string;
  enlaceEntrevista?: string;
  ubicacion?: string;
  direccion?: string;
}): InterviewTypeFields => {
  if (isVirtualType(data.tipoEntrevista)) {
    return {
      tipoEntrevista: data.tipoEntrevista as string,
      enlaceEntrevista: (data.enlaceEntrevista || "").trim(),
      ubicacion: null,
      direccion: null,
    };
  }
  if (isPresencialType(data.tipoEntrevista)) {
    return {
      tipoEntrevista: data.tipoEntrevista as string,
      enlaceEntrevista: null,
      ubicacion: (data.ubicacion || "").trim(),
      direccion: (data.direccion || "").trim(),
    };
  }
  // Tipo no seleccionado o desconocido: todo en NULL menos el propio tipo.
  return {
    tipoEntrevista: data.tipoEntrevista || "",
    enlaceEntrevista: null,
    ubicacion: null,
    direccion: null,
  };
};

/** Longitud máxima de la dirección física (PRESENCIAL). */
export const DIRECCION_MAX_LENGTH = 500;
