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