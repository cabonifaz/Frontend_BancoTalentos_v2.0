export interface TechnicalSkill {
    nombreHabilidad: string;
    aniosExperiencia: number;
}

export interface AddTechSkill extends Omit<TechnicalSkill, 'nombreHabilidad'> {
    idHabilidad: number;
}