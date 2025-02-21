export interface Experience {
    idExperiencia: number;
    nombreEmpresa: string;
    puesto: string;
    funciones: string;
    fechaInicio: string;
    diferenciaAnios: number;
    fechaFin: string;
    flActualidad: boolean;
}

export interface AddExperience extends Omit<Experience, 'idExperiencia' | 'nombreEmpresa' | 'diferenciaAnios'> {
    empresa: string;
}

export interface AddOrUpdateExperienceParams extends Omit<Experience, 'idExperiencia' | 'nombreEmpresa' | 'diferenciaAnios'> {
    idExperiencia?: number;
    idTalento: number;
    empresa: string;
}
