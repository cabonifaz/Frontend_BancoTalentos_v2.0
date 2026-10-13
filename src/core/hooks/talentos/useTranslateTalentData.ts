import { useState } from "react";
import { axiosInstance } from "../../services/axiosService";
import { TalentForFractalCV } from "../../models/interfaces/TalentDataForFractal";
import { TalentDataTranslatedResponse } from "../../models/response/TalentDataTranslatedResponse";

/**
 * Traducción de los datos de un talento para el CV Fractal con GPT (backend
 * `/ia/prompt`, gpt-4.1-mini).
 *
 * Solo se traducen los CAMPOS DE TEXTO que el CV pinta y que cambian entre idiomas
 * (descripción, puesto/funciones, carreras, habilidades blandas, idioma/nivel). El
 * resto (ids, fechas, nombres de empresa/institución, skills técnicas, etc.) se
 * conserva. Los textos se aplanan a un `string[]` con orden determinista, GPT
 * devuelve un arreglo con la misma cantidad y orden, y se reintegran por índice
 * recorriendo la misma estructura. Así el modelo nunca toca la estructura del
 * talento (claves, ids, fechas).
 */

interface TranslatePromptResponse {
  idMensaje: number;
  mensaje: string;
  promptResponse?: { traducciones?: string[] } | null;
}

/** Salida estricta: { traducciones: string[] }. */
const TRANSLATION_SCHEMA = {
  type: "object",
  properties: {
    traducciones: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["traducciones"],
  additionalProperties: false,
};

/** Instrucciones de sistema para GPT. */
const buildInstructions = (idioma: string): string => `
Eres un traductor profesional de currículums (CV) de perfiles de tecnología.
Recibirás un JSON con "idioma_destino" y un arreglo "textos". Traduce cada texto al ${idioma}.

Reglas:
1. Devuelve en "traducciones" exactamente UN elemento por cada texto de entrada, en el MISMO orden. Nunca unas, separes, omitas ni reordenes textos.
2. Si un texto ya está en ${idioma}, devuélvelo tal cual.
3. Si un texto está vacío, devuelve una cadena vacía.
4. NO traduzcas: nombres de tecnologías, lenguajes, frameworks, herramientas, plataformas, metodologías ni certificaciones (por ejemplo Java, Spring Boot, AWS, Azure, SQL Server, Power BI, Scrum, ITIL), siglas, nombres propios ni nombres de empresas o productos.
5. Conserva los saltos de línea, viñetas, numeración y puntuación del texto original.
6. Usa un tono profesional y natural de CV. Traduce los cargos a su equivalente habitual en ${idioma} (por ejemplo "Analista Programador" -> "Programmer Analyst").
7. No agregues, resumas ni expliques nada: solo la traducción.
`.trim();

/**
 * Aplana los textos traducibles del talento a un array ordenado.
 *
 * `maxExperiences` limita cuántas experiencias (las primeras N, es decir las más
 * recientes) se envían a traducir. Si es `undefined` se traducen todas.
 */
const flatten = (
  t: TalentForFractalCV,
  maxExperiences?: number,
): string[] => {
  const out: string[] = [];
  out.push(t.descripcion ?? "");
  (t.experiencias ?? []).forEach((e, idx) => {
    if (maxExperiences !== undefined && idx >= maxExperiences) return;
    out.push(e.puesto ?? "");
    out.push(e.funciones ?? "");
  });
  (t.educaciones ?? []).forEach((e) => out.push(e.carrera ?? ""));
  (t.certificaciones ?? []).forEach((c) => out.push(c.carrera ?? ""));
  (t.habilidadesBlandas ?? []).forEach((s) => out.push(s.nombreHabilidad ?? ""));
  (t.idiomas ?? []).forEach((l) => {
    out.push(l.nombreIdioma ?? "");
    out.push(l.nivelIdioma ?? "");
  });
  return out;
};

/**
 * Reintegra las traducciones sobre el talento original recorriendo la MISMA
 * estructura que `flatten` (mismo orden), consumiendo el array por un cursor.
 */
const unflatten = (
  original: TalentForFractalCV,
  translations: string[],
  maxExperiences?: number,
): TalentForFractalCV => {
  let i = 0;
  const next = (fallback: string | undefined): string | undefined => {
    const value = translations[i++];
    return value !== undefined && value !== null ? value : fallback;
  };

  const descripcion = next(original.descripcion);
  // Solo se reintegran las primeras `maxExperiences` (las que sí se enviaron a
  // traducir en `flatten`); el resto conserva su texto original.
  const experiencias = (original.experiencias ?? []).map((e, idx) => {
    if (maxExperiences !== undefined && idx >= maxExperiences) return e;
    return {
      ...e,
      puesto: next(e.puesto) ?? e.puesto,
      funciones: next(e.funciones) ?? e.funciones,
    };
  });
  const educaciones = (original.educaciones ?? []).map((e) => ({
    ...e,
    carrera: next(e.carrera) ?? e.carrera,
  }));
  const certificaciones = (original.certificaciones ?? []).map((c) => ({
    ...c,
    carrera: next(c.carrera) ?? c.carrera,
  }));
  const habilidadesBlandas = (original.habilidadesBlandas ?? []).map((s) => ({
    ...s,
    nombreHabilidad: next(s.nombreHabilidad) ?? s.nombreHabilidad,
  }));
  const idiomas = (original.idiomas ?? []).map((l) => ({
    ...l,
    nombreIdioma: next(l.nombreIdioma) ?? l.nombreIdioma,
    nivelIdioma: next(l.nivelIdioma) ?? l.nivelIdioma,
  }));

  return {
    ...original,
    descripcion,
    experiencias,
    educaciones,
    certificaciones,
    habilidadesBlandas,
    idiomas,
  };
};

export const useTranslateTalentData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const translateTalentData = async (
    talentData: TalentForFractalCV,
    lang: "ES" | "EN",
  ): Promise<TalentDataTranslatedResponse> => {
    setIsLoading(true);
    try {
      // Se traducen TODAS las experiencias: la plantilla del CV las pinta todas, y
      // limitar a 5 en inglés dejaba de la sexta en adelante en español.
      const maxExperiences = undefined;
      const texts = flatten(talentData, maxExperiences);
      const idioma = lang === "ES" ? "español" : "inglés";

      // GPT (backend /ia/prompt) traduce la lista de textos. El esquema estricto
      // obliga a devolver un arreglo de strings; la cantidad se valida abajo.
      const { data } = await axiosInstance.post<TranslatePromptResponse>(
        "bdt/ia/prompt",
        {
          instructions: buildInstructions(idioma),
          prompt: JSON.stringify({ idioma_destino: idioma, textos: texts }),
          schema: TRANSLATION_SCHEMA,
        },
      );

      const translations = data?.promptResponse?.traducciones;
      // Si algo no cuadra (error o cantidad distinta), se usa el original sin
      // traducir.
      if (
        data?.idMensaje !== 2 ||
        !Array.isArray(translations) ||
        translations.length !== texts.length
      ) {
        return {
          idMensaje: 2,
          mensaje: "Sin traducción",
          promptResponse: talentData,
        };
      }

      return {
        idMensaje: 2,
        mensaje: "Traducción exitosa",
        promptResponse: unflatten(talentData, translations, maxExperiences),
      };
    } catch {
      // Ante cualquier fallo, el CV se genera con los datos originales.
      return {
        idMensaje: 2,
        mensaje: "Sin traducción",
        promptResponse: talentData,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    translateTalentData,
  };
};
