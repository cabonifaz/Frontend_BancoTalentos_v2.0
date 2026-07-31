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
  /** Dirección exacta del cliente (DIRECCION_EXACTA); alimenta el combobox de Dirección. */
  direccion?: string;
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

/**
 * Opción de combobox derivada de un cliente: el `value` que se guarda y el
 * nombre de `cliente` para mostrarlo al lado (`valor - Cliente`).
 */
export interface ClientComboEntry {
  value: string;
  cliente: string;
}

/**
 * Direcciones físicas disponibles derivadas de los clientes únicos de los RQ
 * (campo DIRECCION_EXACTA), junto con el cliente al que pertenecen. Se deduplican
 * por dirección; ante direcciones repetidas se conserva el primer cliente.
 *
 * Independiente de {@link deriveLocationEntries}: DIRECCION_EXACTA es texto de
 * dirección legible, no el enlace de Google Maps de la ubicación.
 */
export const deriveDireccionEntries = (
  rqs: RqClientInfo[],
): ClientComboEntry[] => {
  const uniqueClients = deriveUniqueClients(rqs);
  const seen = new Set<string>();
  const out: ClientComboEntry[] = [];
  for (const c of uniqueClients) {
    const value = (c.direccion || "").trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push({ value, cliente: (c.cliente || "").trim() });
  }
  return out;
};

/**
 * Ubicaciones (enlace de Google Maps) disponibles derivadas de los clientes
 * únicos de los RQ, junto con el cliente al que pertenecen. Se deduplican por
 * valor; ante URLs repetidas se conserva el primer cliente.
 */
export const deriveLocationEntries = (
  rqs: RqClientInfo[],
): ClientComboEntry[] => {
  const uniqueClients = deriveUniqueClients(rqs);
  const seen = new Set<string>();
  const out: ClientComboEntry[] = [];
  for (const c of uniqueClients) {
    const value = (c.ubicacion || "").trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push({ value, cliente: (c.cliente || "").trim() });
  }
  return out;
};

/**
 * Etiquetas legibles para las ubicaciones de cliente. Como la ubicación guardada
 * es un enlace de Google Maps (feo de mostrar), se rotula con el nombre del
 * cliente del que proviene: `Ubicación (NombreCliente)`.
 *
 * Devuelve un mapa `urlUbicacion -> etiqueta`. Si dos clientes comparten la misma
 * URL, se conserva el primero (coherente con la deduplicación por URL de
 * `deriveLocationOptions`).
 */
export const deriveLocationLabelMap = (
  rqs: RqClientInfo[],
): Record<string, string> => {
  const uniqueClients = deriveUniqueClients(rqs);
  const map: Record<string, string> = {};
  for (const c of uniqueClients) {
    const url = (c.ubicacion || "").trim();
    if (!url || map[url]) continue;
    const name = (c.cliente || "").trim();
    map[url] = name ? `Ubicación (${name})` : "Ubicación";
  }
  return map;
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

/**
 * Valida que un texto sea un enlace de geoubicación de Google Maps.
 * Acepta los formatos habituales:
 *   - https://www.google.com/maps/...            (incluye google.<tld>, p. ej. google.com.pe)
 *   - https://maps.google.com/...
 *   - https://maps.app.goo.gl/...                (enlaces cortos para compartir)
 *   - https://goo.gl/maps/...                    (enlaces cortos heredados)
 * Se usa para validar la ubicación ingresada manualmente en entrevistas PRESENCIALES.
 */
export const isGoogleMapsUrl = (value?: string | null): boolean => {
  const v = (value || "").trim();
  if (!v) return false;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();
  // Enlaces cortos para compartir.
  if (host === "maps.app.goo.gl") return true;
  if (host === "goo.gl" && path.startsWith("/maps")) return true;
  // Subdominio de mapas: maps.google.<tld>
  if (/^maps\.google\.[a-z.]+$/.test(host)) return true;
  // Dominio principal con ruta de mapas: (www.)google.<tld>/maps...
  if (/^(www\.)?google\.[a-z.]+$/.test(host) && path.startsWith("/maps")) {
    return true;
  }
  return false;
};
