import { useState } from "react";
import { axiosInstance } from "../services/axiosService";
import { TalentForFractalCV } from "../models/interfaces/TalentDataForFractal";
import { TalentDataTranslatedResponse } from "../models/response/TalentDataTranslatedResponse";

/**
 * Traducción de los datos de un talento para el CV Fractal, usando Amazon Translate
 * (backend `/translate`) en vez de la IA.
 *
 * Solo se traducen los CAMPOS DE TEXTO que el CV pinta y que cambian entre idiomas
 * (descripción, puesto/funciones, carreras, habilidades blandas, idioma/nivel). El
 * resto (ids, fechas, nombres de empresa/institución, skills técnicas, etc.) se
 * conserva. Los textos se aplanan a un `string[]` con orden determinista, se
 * traducen por batch y se reintegran por índice recorriendo la misma estructura.
 */

interface TranslateApiResponse {
  idMensaje: number;
  mensaje: string;
  translations: string[] | null;
}

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
      // En inglés solo se traducen las 5 experiencias más recientes (las primeras
      // del arreglo); en español se traducen todas.
      const maxExperiences = lang === "EN" ? 5 : undefined;
      const texts = flatten(talentData, maxExperiences);
      const target = lang === "ES" ? "es" : "en";

      const { data } = await axiosInstance.post<TranslateApiResponse>(
        "bdt/translate",
        { texts, source: "auto", target },
      );

      const translations = data?.translations;
      // Si algo no cuadra (longitud distinta o error), se usa el original sin
      // traducir. No se recurre a la IA.
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
