import { useState } from "react";
import { IACVResponse } from "../models/response/AICVResponse";
import { AddTalentType } from "../models/schemas/AddTalentSchema";
import { UseFormSetValue } from "react-hook-form";
import { Param } from "../models";

/**
 * Custom hook for auto-completing a talent form with data from an AI CV response.
 * It provides a function to complete the form and manages the city ID state.
 * @returns An object containing the `completeForm` function and `idCiudad` state.
 */
export const useAutoCompletTalForm = () => {
  const [idCiudad, setIdCiudad] = useState<number>(0);

  /**
   * Completes the form with the provided data.
   * @param data The AI CV response data to populate the form.
   * @param setValue The `setValue` function from `react-hook-form` to set form values.
   * @param countries An array of `Param` objects representing available countries.
   * @param cities An array of `Param` objects representing available cities.
   * @param techSkills An array of `Param` objects representing available technical skills.
   */
  const completeForm = (
    response: IACVResponse,
    setValue: UseFormSetValue<AddTalentType>,
    countries: Param[],
    cities: Param[],
    techSkills: Param[],
  ) => {
    const { data } = response;

    try {
      // Datos personales
      if (data.nombres !== null && data.nombres !== undefined) {
        setValue("nombres", data.nombres);
      }
      if (
        data.apellidoPaterno !== null &&
        data.apellidoPaterno !== undefined
      ) {
        setValue("apellidoPaterno", data.apellidoPaterno);
      }
      if (
        data.apellidoMaterno !== null &&
        data.apellidoMaterno !== undefined
      ) {
        setValue("apellidoMaterno", data.apellidoMaterno);
      }
      if (
        data.docIdentidad !== null &&
        data.docIdentidad !== undefined
      ) {
        setValue("dni", data.docIdentidad);
      }
      if (
        data.contacto?.email !== null &&
        data.contacto?.email !== undefined
      ) {
        setValue("email", data.contacto.email);
      }

      // Teléfono
      if (
        data.contacto?.celularNum !== null &&
        data.contacto?.celularNum !== undefined
      ) {
        setValue("telefono", data.contacto.celularNum);
      }

      // Ubicación
      if (data.location) {
        const id = getCountryId(data.location.pais, countries);
        if (id !== 0) {
          setValue("idPais", id);
          setValue("codigoPais", id);
        }

        if (data.location.ciudad) {
          const idCiudad = getCityId(data.location.ciudad, cities);
          if (idCiudad !== 0) {
            setIdCiudad(idCiudad);
          }
        }
      }

      // Descripción/presentación
      if (
        data.presentacion !== null &&
        data.presentacion !== undefined
      ) {
        setValue("descripcion", data.presentacion);
      }

      // Redes sociales
      if (data.social) {
        if (
          data.social.linkedin !== null &&
          data.social.linkedin !== undefined
        )
          setValue("linkedin", data.social.linkedin);
        if (
          data.social.github !== null &&
          data.social.github !== undefined
        )
          setValue("github", data.social.github);
      }

      // Habilidades técnicas
      if (data.tecSkills && data.tecSkills.length > 0) {
        const mappedTechSkills = data.tecSkills
          .map((skill) => {
            const id = getTechSkillId(
              skill.nombreHabilidad,
              techSkills,
            );

            //if (id === 0) return undefined;
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
      throw new Error("Error al completar el formulario");
    }
  };

  return { completeForm, idCiudad };
};

/**
 * Normalizes a given text string by converting it to lowercase, trimming whitespace,
 * decomposing accented characters, and removing diacritics.
 * @param text The input string to normalize. Can be `null` or `undefined`.
 * @returns The normalized string, or an empty string if the input is falsy.
 */
const normalizeText = (text: string | null | undefined) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // descompone caracteres con tilde
    .replace(/[\u0300-\u036f]/g, ""); // elimina los diacríticos
};

/**
 * Retrieves the ID of a country based on its name from a list of country parameters.
 * @param countryName The name of the country to search for.
 * @param countries An array of `Param` objects representing available countries.
 * @returns The `num1` property (ID) of the matching country, or `0` if not found.
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
 * Retrieves the ID of a technical skill based on its name from a list of skill parameters.
 * @param skillName The name of the technical skill to search for.
 * @param techSkills An array of `Param` objects representing available technical skills.
 * @returns The `num1` property (ID) of the matching skill, or `0` if not found.
 */
const getTechSkillId = (skillName: string, techSkills: Param[]) => {
  const normalizedSkill = normalizeText(skillName);

  const skill = techSkills?.find((t) => {
    const normalizedString1 = normalizeText(t.string1);
    return normalizedString1 === normalizedSkill;
  });

  return skill?.num1 || 0;
};

/**
 * Retrieves the ID of a city based on its name from a list of city parameters.
 * @param cityName The name of the city to search for.
 * @param cities An array of `Param` objects representing available cities.
 * @returns The `num1` property (ID) of the matching city, or `0` if not found.
 */
const getCityId = (cityName: string, cities: Param[]) => {
  const normalizedCity = normalizeText(cityName);

  const city = cities?.find((c) => {
    const normalizedString1 = normalizeText(c.string1);
    return normalizedString1 === normalizedCity;
  });

  return city?.num1 || 0;
};
