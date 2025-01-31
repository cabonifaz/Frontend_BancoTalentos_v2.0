export type TechnicalSkillType = {
    techSkill: string;
    skillYears: string;
}

export type SoftSkillType = {
    name: string;
}

export type ExperienceType = {
    entityName: string;
    area: string;
    description: string;
    startYear: string;
    endYear: string;
}

export type EducationType = {
    entityName: string;
    carrer: string;
    degree: string;
    startYear: string;
    endYear: string;
}

export type LanguageType = {
    language: number;
    level: number;
}