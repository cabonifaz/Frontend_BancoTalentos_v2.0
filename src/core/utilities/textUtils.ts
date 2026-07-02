/**
 * Normaliza texto para comparaciones: minúsculas, sin tildes y sin espacios sobrantes.
 */
export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // descompone caracteres con tilde
    .replace(/[̀-ͯ]/g, ""); // elimina los diacriticos
};

/**
 * Sanitiza texto eliminando espacios extras, emojis y caracteres no pertinentes
 */
export const sanitizeText = (text: string): string => {
  if (!text) return "";

  let result = text;
  
  result = result.replace(/[\u2600-\u27BF]/g, "");   // Símbolos misc
  result = result.replace(/[\u2300-\u23FF]/g, "");   // Misc technical
  result = result.replace(/[\u2B50]/g, "");          // Star
  result = result.replace(/[\uFE00-\uFE0F]/g, "");   // Variation selectors
  result = result.replace(/[\u200D]/g, "");          // Zero width joiner
  
  // Eliminar emojis usando rangos de surrogados
  result = result.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
  
  result = result.replace(/[•●○◘◦⦿⦾■□▪▫]/g, "");    // Bullets/viñetas
  result = result.replace(/[\uF0A7\uF0B7\uF0D8]/g, ""); // Bullets (Wingdings)
  result = result.replace(/[►▶▷◄◀◁]/g, "");          // Flechas
  result = result.replace(/[★☆✓✔✗✘]/g, "");          // Símbolos de check/star
  result = result.replace(/[©®™℗]/g, "");            // Copyright, trademark
  result = result.replace(/[†‡§¶]/g, "");            // Símbolos de párrafo
  result = result.replace(/[‹›«»]/g, "");            // Comillas angulares
  result = result.replace(/[""'']/g, "");            // Comillas tipográficas
  result = result.replace(/['']/g, "'");             // Apóstrofes tipográficos → normal
  result = result.replace(/[–—−]/g, "-");            // Guiones largos → guión normal
  result = result.replace(/[…]/g, "...");            // Puntos suspensivos

  // Caracteres especiales específicos
  result = result.replace(/[\uFFFD]/g, "");          // Carácter de reemplazo
  result = result.replace(/[\u00A0]/g, " ");         // Non-breaking space → espacio normal
  

  result = result.replace(/\[\d{2}:\d{2}\]/g, "");   // [19:45]
  
  // eslint-disable-next-line no-control-regex
  result = result.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""); // Control chars (preserva \n y \r)
  result = result.replace(/[\u007F-\u009F]/g, "");   // Caracteres de control extendidos
  result = result.replace(/[\u200B-\u200D]/g, "");   // Zero-width spaces
  result = result.replace(/[\u200E-\u200F]/g, "");   // Left-to-right/right-to-left marks
  result = result.replace(/[\u202A-\u202E]/g, "");   // Embedding/override marks
  result = result.replace(/[\uFEFF]/g, "");          // Byte order mark
  
  // Primero: normalizar saltos de línea (unificar \r\n y \r a \n)
  result = result.replace(/\r\n/g, "\n");
  result = result.replace(/\r/g, "\n");
  
  // Eliminar espacios múltiples en la misma línea (pero no saltos de línea)
  result = result.replace(/[ \t]+/g, " ");
  
  // Eliminar espacios al inicio/final de cada línea
  result = result.replace(/^ +/gm, "");
  result = result.replace(/ +$/gm, "");
  
  // Eliminar líneas vacías múltiples (máximo 2 saltos consecutivos)
  result = result.replace(/\n{3,}/g, "\n\n");
  
  return result.trim();
};

/**
 * Trunca texto a un máximo de caracteres
 */
export const truncateText = (
  text: string,
  maxLength: number
): { text: string; wasTruncated: boolean } => {
  if (!text || text.length <= maxLength) {
    return { text, wasTruncated: false };
  }

  return {
    text: text.substring(0, maxLength),
    wasTruncated: true,
  };
};

/**
 * Sanitiza Y trunca texto 
 */
export const processText = (
  text: string,
  maxLength: number
): {
  text: string;
  wasSanitized: boolean;
  wasTruncated: boolean;
} => {
  if (!text) {
    return {
      text: "",
      wasSanitized: false,
      wasTruncated: false,
    };
  }

  const sanitized = sanitizeText(text);
  const wasSanitized = sanitized !== text;
  
  const { text: finalText, wasTruncated } = truncateText(sanitized, maxLength);
  
  return {
    text: finalText,
    wasSanitized,
    wasTruncated,
  };
};