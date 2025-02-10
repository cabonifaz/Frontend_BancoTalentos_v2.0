export interface TechnicalSkillType {
    techSkill: string;
    skillYears: string;
}

export interface SoftSkillType {
    name: string;
}

export interface ExperienceType {
    entityName: string;
    area: string;
    description: string;
    startYear: string;
    endYear: string;
}

export interface EducationType {
    entityName: string;
    carrer: string;
    degree: string;
    startYear: string;
    endYear: string;
}

export interface LanguageType {
    language: number;
    level: number;
}