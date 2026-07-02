export interface IACVResponse {
  idMensaje: number;
  mensaje: string;
  data: {
    nombres: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    docIdentidad: string | null;
    contacto: {
      celularNum: string | null;
      celularCod: string | null;
      email: string | null;
    };
    location: {
      pais: string | null;
      ciudad: string | null;
    };
    tecSkills: {
      idHabTec?: number | null;
      nombreHabilidad: string | null;
      aniosExperiencia: number | null;
    }[];
    social: {
      linkedin: string | null;
      github: string | null;
    };
    presentacion: string | null;
    softSkills: {
      nombreHabilidad: string | null;
    }[];
    workExps: {
      idExperiencia: number | null;
      nombreEmpresa: string | null;
      puesto: string | null;
      funciones: string | null;
      fechaInicio: string | null;
      fechaFin: string | null;
      tiempo: string | null;
      flActualidad: number;
    }[];
    edExps: {
      idEducacion: number | null;
      nombreInstitucion: string | null;
      carrera: string | null;
      grado: string | null;
      fechaInicio: string | null;
      fechaFin: string | null;
      flActualidad: number;
    }[];
    langs: {
      idTalentoIdioma: number | null;
      idIdioma: number | null;
      nombreIdioma: string | null;
      idNivel: number;
      nivelIdioma: string | null;
      estrellas: number;
    }[];
  };
}
