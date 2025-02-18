export interface Experience {
    idExperiencia: number;
    nombreEmpresa: string;
    puesto: string;
    funciones: string;
    fechaInicio: string;
    fechaFin: string;
    flActualidad: boolean;
}

export interface AddExperience extends Omit<Experience, 'idExperiencia' | 'nombreEmpresa'> {
    empresa: string;
}

export interface AddOrUpdateExperienceParams extends Omit<Experience, 'idExperiencia' | 'nombreEmpresa'> {
    idExperiencia?: number;
    idTalento: number;
    empresa: string;
}
