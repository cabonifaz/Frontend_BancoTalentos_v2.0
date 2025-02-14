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