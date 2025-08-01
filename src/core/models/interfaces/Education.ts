export interface Education {
    idEducacion: number;
    nombreInstitucion: string;
    carrera: string;
    grado: string;
    fechaInicio: string;
    fechaFin: string;
    flActualidad: boolean;
}

export interface AddEducation extends Omit<Education, 'idEducacion' | 'nombreInstitucion'> {
    institucion: string;
}

export interface AddOrUpdateEducationParams extends Omit<Education, 'idEducacion' | 'nombreInstitucion' | 'flActualidad'> {
    idTalentoEducacion?: number;
    idTalento: number;
    institucion: string;
    flActualidad: 1 | 0;
}