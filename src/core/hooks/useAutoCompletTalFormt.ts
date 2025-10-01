import { useState } from "react";
import { IACVResponse } from "../models/response/AICVResponse";
import { AddTalentType } from "../models/schemas/AddTalentSchema";
import { UseFormSetValue, UseFormReset } from "react-hook-form";
import { Param } from "../models";

export const useAutoCompletTalForm = () => {
  const [isFilling, setIsFilling] = useState(false);
  const [idCiudad, setIdCiudad] = useState<number>(0);

  const completeForm = (
    data: IACVResponse,
    setValue: UseFormSetValue<AddTalentType>,
    countries: Param[],
    cities: Param[],
    techSkills: Param[],
    reset?: UseFormReset<AddTalentType>
  ) => {
    setIsFilling(true);

    try {
      // Datos personales
      if (data.nombres !== null && data.nombres !== undefined) {
        setValue("nombres", data.nombres);
      }
      if (data.apellidoPaterno !== null && data.apellidoPaterno !== undefined) {
        setValue("apellidoPaterno", data.apellidoPaterno);
      }
      if (data.apellidoMaterno !== null && data.apellidoMaterno !== undefined) {
        setValue("apellidoMaterno", data.apellidoMaterno);
      }
      if (data.docIdentidad !== null && data.docIdentidad !== undefined) {
        setValue("dni", data.docIdentidad);
      }
      if (data.contacto?.email !== null && data.contacto?.email !== undefined) {
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
      if (data.presentacion !== null && data.presentacion !== undefined) {
        setValue("descripcion", data.presentacion);
      }

      // Redes sociales
      if (data.social) {
        if (data.social.linkedin !== null && data.social.linkedin !== undefined)
          setValue("linkedin", data.social.linkedin);
        if (data.social.github !== null && data.social.github !== undefined)
          setValue("github", data.social.github);
      }

      // Habilidades técnicas
      if (data.tecSkills && data.tecSkills.length > 0) {
        const mappedTechSkills = data.tecSkills
          .map((skill) => {
            const id = getTechSkillId(skill.nombreHabilidad, techSkills);

            if (id === 0) return undefined;
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
      console.error("Error al completar el formulario:", error);
    } finally {
      setIsFilling(false);
    }
  };

  return { isFilling, completeForm, idCiudad };
};

const normalizeText = (text: string | null | undefined) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // descompone caracteres con tilde
    .replace(/[\u0300-\u036f]/g, ""); // elimina los diacríticos
};

const getCountryId = (countryName: string, countries: Param[]) => {
  const normalizedCountry = normalizeText(countryName);

  const country = countries?.find((c) => {
    const normalizedString1 = normalizeText(c.string1);
    return normalizedString1 === normalizedCountry;
  });

  return country?.num1 || 0;
};

const getTechSkillId = (skillName: string, techSkills: Param[]) => {
  const normalizedSkill = normalizeText(skillName);

  const skill = techSkills?.find((t) => {
    const normalizedString1 = normalizeText(t.string1);
    return normalizedString1 === normalizedSkill;
  });

  return skill?.num1 || 0;
};

const getCityId = (cityName: string, cities: Param[]) => {
  const normalizedCity = normalizeText(cityName);

  const city = cities?.find((c) => {
    const normalizedString1 = normalizeText(c.string1);
    return normalizedString1 === normalizedCity;
  });

  return city?.num1 || 0;
};
