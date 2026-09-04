import { useState } from "react";
import { IACVResponse } from "../../models/response/AICVResponse";
import { UseFormSetValue } from "react-hook-form";
import { Param } from "../../models";
import { AddPostulanteType } from "../../models";

/**
 * `useCompleteExtForm` es un hook personalizado que proporciona funcionalidades para auto-completar un formulario
 * de postulante con datos recibidos de una respuesta de IA, manejando de forma segura los valores nulos o indefinidos.
 *
 * @returns {{ completeForm: (data: IACVResponse, setValue: UseFormSetValue<AddPostulanteType>, countries: Param[], cities: Param[], techSkills: Param[]) => void, idCiudad: number }}
 * Un objeto que contiene la función `completeForm` y el `idCiudad` seleccionado.
 */
export const useCompleteExtForm = () => {
  const [idCiudad, setIdCiudad] = useState<number>(0);

  /**
   * Completa el formulario del postulante con la información proporcionada por la IA.
   * Realiza validaciones para asegurar que los campos solo se actualicen si los valores existen (no son `null` o `undefined`).
   *
   * @param {IACVResponse} data - Los datos de la respuesta de la IA a utilizar para completar el formulario.
   * @param {UseFormSetValue<AddPostulanteType>} setValue - La función `setValue` de `react-hook-form` para actualizar los campos del formulario.
   * @param {Param[]} countries - Lista de países para mapear el ID del país.
   * @param {Param[]} cities - Lista de ciudades para mapear el ID de la ciudad.
   * @param {Param[]} techSkills - Lista de habilidades técnicas para mapear los IDs de las habilidades.
   * @throws {Error} Si ocurre un error durante el proceso de auto-completado del formulario.
   */
  const completeForm = (
    response: IACVResponse,
    setValue: UseFormSetValue<AddPostulanteType>,
    countries: Param[],
    cities: Param[],
    techSkills: Param[],
  ) => {
    const { data } = response;

    try {
      // Datos personales
      safeSetValue("nombres", data.nombres, setValue);
      safeSetValue("apellidoPaterno", data.apellidoPaterno, setValue);
      safeSetValue("apellidoMaterno", data.apellidoMaterno, setValue);
      safeSetValue("dni", data.docIdentidad, setValue);
      safeSetValue("email", data.contacto?.email, setValue);
      safeSetValue("descripcion", data.presentacion, setValue);

      // Teléfono
      safeSetValue("telefono", data.contacto?.celularNum, setValue);

      // Ubicación
      if (data.location) {
        const idPais = getCountryId(data.location.pais, countries);

        safeSetValue("idPais", idPais, setValue);
        safeSetValue("codigoPais", idPais, setValue);

        if (data.location.ciudad) {
          const idCiudad = getCityId(data.location.ciudad, cities);
          if (idCiudad) setIdCiudad(idCiudad);
        }
      }

      // Redes sociales
      if (data.social) {
        safeSetValue("linkedin", data.social.linkedin, setValue);
        safeSetValue("github", data.social.github, setValue);
      }

      // Habilidades técnicas
      if (data.tecSkills && data.tecSkills.length > 0) {
        const mappedTechSkills = data.tecSkills
          .map((skill) => {
            const id = getTechSkillId(
              skill.nombreHabilidad,
              techSkills,
            );

            // if (id === 0) return undefined;
            return {
              idHabilidad: id,
              anios: skill.aniosExperiencia,
              habilidad: skill.nombreHabilidad.toUpperCase(),
            };
          })
          .filter(Boolean);
        if (mappedTechSkills.length > 0) {
          setValue("habilidadesTecnicas", mappedTechSkills as any);
        }
      }

      // Experiencia laboral
      if (data.workExps && data.workExps.length > 0) {
        const mappedExperiences = data.workExps.map((exp) => ({
          empresa: exp.nombreEmpresa,
          puesto: exp.puesto,
          funciones: exp.funciones,
          fechaInicio: exp.fechaInicio,
          fechaFin: exp.fechaFin || "",
          flActualidad: exp.flActualidad === 1,
        }));
        setValue("experiencias", mappedExperiences);
      }

      // Educación
      if (data.edExps && data.edExps.length > 0) {
        const mappedEducations = data.edExps.map((edu) => ({
          institucion: edu.nombreInstitucion || "",
          carrera: edu.carrera || "",
          grado: edu.grado || "",
          fechaInicio: edu.fechaInicio || "",
          fechaFin: edu.fechaFin || "",
          flActualidad: edu.flActualidad === 1,
        }));
        setValue("educaciones", mappedEducations);
      }

      // Idiomas
      if (data.langs && data.langs.length > 0) {
        const mappedLanguages = data.langs.map((lang) => ({
          idIdioma: lang.idIdioma || 0,
          idNivel: lang.idNivel,
          estrellas: lang.estrellas,
        }));
        setValue("idiomas", mappedLanguages);
      }
    } catch (error) {
      throw new Error(
        "Error al completar el formulario automáticamente",
      );
    }
  };

  return { completeForm, idCiudad };
};

/* --------------------
   Helpers
-------------------- */

/**
 * Establece un valor en el formulario de forma segura, solo si el valor no es `null` o `undefined`.
 *
 * @template K - Las claves válidas del tipo `AddPostulanteType`.
 * @param {K} key - La clave del campo del formulario a establecer.
 * @param {AddPostulanteType[K] | null | undefined} value - El valor a establecer. Puede ser `null` o `undefined`.
 * @param {UseFormSetValue<AddPostulanteType>} setValue - La función `setValue` de `react-hook-form`.
 */
const safeSetValue = <K extends keyof AddPostulanteType>(
  key: K,
  value: AddPostulanteType[K] | null | undefined,
  setValue: UseFormSetValue<AddPostulanteType>,
) => {
  if (value !== null && value !== undefined) {
    setValue(key, value);
  }
};

/**
 * Normaliza una cadena de texto, convirtiéndola a minúsculas, eliminando espacios extra, tildes y caracteres no imprimibles.
 *
 * @param {string | null | undefined} text - El texto a normalizar.
 * @returns {string} El texto normalizado o una cadena vacía si el input es `null` o `undefined`.
 */
const normalizeText = (text: string | null | undefined) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // descompone caracteres con tilde
    .replace(/\u0300-\u036f]/g, ""); // elimina los diacríticos
};

/**
 * Obtiene el ID de un país a partir de su nombre normalizado.
 *
 * @param {string} countryName - El nombre del país a buscar.
 * @param {Param[]} countries - La lista de objetos `Param` que contienen los países disponibles.
 * @returns {number} El ID del país (`num1`) si se encuentra, de lo contrario `0`.
 */
const getCountryId = (countryName: string, countries: Param[]) => {
  const normalizedCountry = normalizeText(countryName);

  const country = countries?.find((c) => {
    const normalizedString1 = normalizeText(c.string1);
    return normalizedString1 === normalizedCountry;
  });

  return country?.num1 || 0;
};

/**
 * Obtiene el ID de una ciudad a partir de su nombre normalizado.
 *
 * @param {string} cityName - El nombre de la ciudad a buscar.
 * @param {Param[]} cities - La lista de objetos `Param` que contienen las ciudades disponibles.
 * @returns {number} El ID de la ciudad (`num1`) si se encuentra, de lo contrario `0`.
 */
const getCityId = (cityName: string, cities: Param[]) => {
  const normalizedCity = normalizeText(cityName);

  const city = cities?.find((c) => {
    const normalizedString1 = normalizeText(c.string1);
    return normalizedString1 === normalizedCity;
  });

  return city?.num1 || 0;
};

/**
 * Obtiene el ID de una habilidad técnica a partir de su nombre normalizado.
 *
 * @param {string} skillName - El nombre de la habilidad técnica a buscar.
 * @param {Param[]} techSkills - La lista de objetos `Param` que contienen las habilidades técnicas disponibles.
 * @returns {number} El ID de la habilidad técnica (`num1`) si se encuentra, de lo contrario `0`.
 */
const getTechSkillId = (skillName: string, techSkills: Param[]) => {
  const normalizedSkill = normalizeText(skillName);

  const skill = techSkills?.find((t) => {
    const normalizedString1 = normalizeText(t.string1);
    return normalizedString1 === normalizedSkill;
  });

  return skill?.num1 || 0;
};
