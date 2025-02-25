export interface Experience {
    idExperiencia: number;
    nombreEmpresa: string;
    puesto: string;
    funciones: string;
    fechaInicio: string;
    tiempo: string;
    fechaFin: string;
    flActualidad: boolean;
}

export interface AddExperience extends Omit<Experience, 'idExperiencia' | 'nombreEmpresa' | 'tiempo'> {
    empresa: string;
}

export interface AddOrUpdateExperienceParams extends Omit<Experience, 'idExperiencia' | 'nombreEmpresa' | 'tiempo' | 'flActualidad'> {
    idExperiencia?: number;
    idTalento: number;
    empresa: string;
    flActualidad: 1 | 0;
}
