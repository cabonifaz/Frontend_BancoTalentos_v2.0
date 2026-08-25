export interface AddTalentParams {
  dni: string | null;
  telefono?: string;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
  email?: string;
  linkedin?: string;
  github?: string;
  descripcion?: string;
  disponibilidad?: string;
  procedencia?: string;
  puesto?: string;
  idPais?: number;
  idCiudad?: number;
  idModalidadFacturacion?: number;
  montoInicialPlanilla?: number;
  montoFinalPlanilla?: number;
  montoInicialRxH?: number;
  montoFinalRxH?: number;
  idMoneda?: number | null;
  habilidadesTecnicas?: {
    idHabilidad: number;
    anios?: number | null;
  }[];
  habilidadesBlandas?: {
    idHabilidad: number;
  }[];
  experiencias?: {
    empresa: string;
    puesto: string;
    funciones?: string;
    fechaInicio: string;
    fechaFin?: string | null;
    flActualidad: number;
  }[];
  educaciones?: {
    institucion: string;
    carrera: string;
    grado: string;
    fechaInicio: string;
    fechaFin?: string | null;
    flActualidad: number;
    tipoFechaEducaciones?: number;
  }[];
  idiomas?: {
    idIdioma: number;
    idNivel: number;
    estrellas: number;
  }[];
  cvArchivo?: {
    stringB64: string;
    nombreArchivo: string;
    extensionArchivo: string;
    idTipoArchivo: number;
    idTipoDocumento: number;
  };
  fotoArchivo?: {
    stringB64: string;
    nombreArchivo: string;
    extensionArchivo: string;
    idTipoArchivo: number;
    idTipoDocumento: number;
    /**
     * Ruta (key) S3 de la foto ya subida con URL pre-firmada. Cuando se envía,
     * `stringB64` va vacío y el backend sólo registra la ruta, sin subir nada.
     */
    rutaArchivo?: string;
  };

  // Salary Expec Plan
  idMonedaPlan?: number;
  montMaxPlan?: number;
  montMinPlan?: number;

  // Salary Expec RXH
  idMonedaRxh?: number;
  montMaxRxh?: number;
  montMinRxh?: number;

}
