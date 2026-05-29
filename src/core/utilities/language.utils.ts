import { franc } from "franc-min";

export const detectLanguage = (
  text: string
): "ES" | "EN" | string => {
  const langCode = franc(text);

  if (langCode === "spa") return "ES";
  if (langCode === "eng") return "EN";
  return langCode;
};

export const getTextForDetection = (object: any): string => {
  const extractText = (value: any): string[] => {
    // Si es null o undefined, ignorar
    if (value == null) {
      return [];
    }

    // Si es string, agregarlo si no está vacío
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? [trimmed] : [];
    }

    // Ignorar números y booleanos (evita falsos positivos como "true", "false", "1", "0")
    if (typeof value === "number" || typeof value === "boolean") {
      return [];
    }

    // Si es array, procesar cada elemento recursivamente
    if (Array.isArray(value)) {
      return value.flatMap((item) => extractText(item));
    }

    // Si es objeto, procesar cada propiedad recursivamente
    if (typeof value === "object") {
      return Object.values(value).flatMap((v) => extractText(v));
    }

    // Para cualquier otro tipo, retornar array vacío
    return [];
  };

  // Extraer todo el texto y unirlo con espacios
  const allText = extractText(object);
  return allText.join(" ");
};

/**
 * Formatea una fecha según el idioma.
 * @param dateStr Fecha en formato ISO o similar (ej. "2022-05-10")
 * @param lang Idioma: "ES" o "EN"
 * @returns Fecha formateada (ej. "mayo 2022" o "May 2022")
 */
export const formatDateByLang = (
  dateStr: string,
  lang: "ES" | "EN" = "ES"
): string => {
  if (!dateStr) return "";

  const lower = dateStr.trim().toLowerCase();

  if (["actualidad", "present", "presente"].includes(lower)) {
    return lang === "ES" ? "Actualidad" : "Present";
  }

  const [day, month, year] = dateStr.split("/").map(Number);

  if (!day || !month || !year) return dateStr;

  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return dateStr;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
  };

  let formatted = date.toLocaleDateString(
    lang === "ES" ? "es-ES" : "en-US",
    options
  );

  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  return formatted;
};

export const formatDateByLangOnlyYear = (
  dateStr: string,
  lang: "ES" | "EN" = "ES"
): string => {
  if (!dateStr) return "";

  const lower = dateStr.trim().toLowerCase();

  if (["actualidad", "present", "presente"].includes(lower)) {
    return lang === "ES" ? "Actualidad" : "Present";
  }

  const [day, month, year] = dateStr.split("/").map(Number);

  if (!day || !month || !year) return dateStr;

  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return dateStr;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
  };

  let formatted = date.toLocaleDateString(
    lang === "ES" ? "es-ES" : "en-US",
    options
  );

  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  return formatted;
};