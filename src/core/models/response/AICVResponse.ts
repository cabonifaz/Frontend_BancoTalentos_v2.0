export interface IACVResponse {
  idMensaje: number;
  mensaje: string;
  data: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    docIdentidad: string;
    contacto: {
      celularNum: string;
      celularCod: string;
      email: string;
    };
    location: {
      pais: string;
      ciudad: string;
    };
    tecSkills: {
      nombreHabilidad: string;
      aniosExperiencia: number;
    }[];
    social: {
      linkedin: string;
      github: string;
    };
    presentacion: string;
    softSkills: {
      nombreHabilidad: string;
    }[];
    workExps: {
      idExperiencia: number | null;
      nombreEmpresa: string;
      puesto: string;
      funciones: string;
      fechaInicio: string;
      fechaFin: string | null;
      tiempo: string;
      flActualidad: number;
    }[];
    edExps: {
      idEducacion: number | null;
      nombreInstitucion: string;
      carrera: string;
      grado: string;
      fechaInicio: string;
      fechaFin: string;
      flActualidad: number;
    }[];
    langs: {
      idTalentoIdioma: number | null;
      idIdioma: number | null;
      nombreIdioma: string;
      idNivel: number;
      nivelIdioma: string;
      estrellas: number;
    }[];
  };
}
