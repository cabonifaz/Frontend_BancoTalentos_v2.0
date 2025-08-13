import {
  AddEducation,
  AddExperience,
  AddLanguage,
  AddSoftSkill,
  AddTechSkill,
} from "..";

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
};

export const initialLanguage: AddLanguage = {
  idIdioma: 0,
  idNivel: 0,
  estrellas: 0,
};
