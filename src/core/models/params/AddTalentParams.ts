export interface AddTalentParams {
    telefono: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
    linkedin?: string;
    github?: string;
    descripcion: string;
    disponibilidad: string;
    puesto: string;
    idPais: number;
    idCiudad: number;
    montoInicialPlanilla: number;
    montoFinalPlanilla: number;
    montoInicialRxH: number;
    montoFinalRxH: number;
    idMoneda: number;
    habilidadesTecnicas: {
        idHabilidad: number;
        anios: number;
    }[];
    habilidadesBlandas: {
        idHabilidad: number;
    }[];
    experiencias: {
        empresa: string;
        puesto: string;
        funciones: string;
        fechaInicio: string;
        fechaFin?: string | null;
        flActualidad: number;
    }[];
    educaciones: {
        institucion: string;
        carrera: string;
        grado: string;
        fechaInicio: string;
        fechaFin?: string | null;
        flActualidad: number;
    }[];
    idiomas: {
        idIdioma: number;
        idNivel: number;
        estrellas: number;
    }[];
    cvArchivo: {
        stringB64: string;
        nombreArchivo: string;
        extensionArchivo: string;
        idTipoArchivo: number;
        idTipoDocumento: number;
    };
    fotoArchivo: {
        stringB64: string;
        nombreArchivo: string;
        extensionArchivo: string;
        idTipoArchivo: number;
        idTipoDocumento: number;
    };
};