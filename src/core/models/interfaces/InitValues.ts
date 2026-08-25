import {
  AddEducation,
  AddExperience,
  AddLanguage,
  AddPostulanteType,
  AddSoftSkill,
  AddTechSkill,
} from "..";
import { AddTalentType } from "../schemas/AddTalentSchema";

export const initialTechnicalSkill: AddTechSkill = {
  idHabilidad: 0,
  anios: 0,
  habilidad: "",
};

export const initialSoftSkill: AddSoftSkill = {
  idHabilidad: 0,
  habilidad: "",
};

export const initialExperience: AddExperience = {
  empresa: "",
  puesto: "",
  funciones: "",
  fechaInicio: "",
  fechaFin: "",
  flActualidad: false,
};

export const initialEducation: AddEducation = {
  institucion: "",
  carrera: "",
  grado: "",
  fechaInicio: "",
  fechaFin: "",
  flActualidad: false,
  tipoFechaEducaciones: 1,
};

export const initialLanguage: AddLanguage = {
  idIdioma: 0,
  idNivel: 0,
  estrellas: 0,
};

export const initialFormValues: AddTalentType = {
  dni: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  codigoPais: 0,
  telefono: "",
  email: "",
  descripcion: "",
  disponibilidad: [],
  procedencia: "",
  idPais: 0,
  idCiudad: 0,
  /* montoInicial: 0,
  montoFinal: 0, */
  linkedin: "",
  github: "",
  tieneEquipo: false,
  experiencias: [initialExperience],
  educaciones: [initialEducation],
  habilidadesTecnicas: [initialTechnicalSkill],
  habilidadesBlandas: [],
  idiomas: [],
  idModalidadFacturacion: 0,
  salaryExpectations: {
    rxh: {
      coin: undefined,
      min: undefined,
      max: undefined,
    },
    planilla: {
      coin: undefined,
      min: undefined,
      max: undefined,
    },
  },
  cv: [],
  foto: [],
};

export const initialFormValuesPostulante: AddPostulanteType = {
  dni: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  codigoPais: 0,
  telefono: "",
  email: "",
  descripcion: "",
  // puesto: "",
  disponibilidad: [],
  idPais: 0,
  idCiudad: 0,
  tieneEquipo: false,
  linkedin: "",
  github: "",
  experiencias: [initialExperience],
  educaciones: [initialEducation],
  habilidadesTecnicas: [],
  // habilidadesBlandas: [initialSoftSkill],
  idiomas: [],
  cv: [],
  foto: [],
};
