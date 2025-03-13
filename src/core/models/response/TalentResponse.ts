import { BaseResponse, Education, Experience, Feedback, Language, SoftSkill, TalentFile, TechnicalSkill } from "..";

export interface TalentResponse {
    result: BaseResponse;
    email: string;
    celular: string;
    linkedin: string;
    github: string;
    descripcion: string;
    disponibilidad: string;
    idColeccion: number[];
    idMoneda: number;
    files: TalentFile[];
    habilidadesTecnicas: TechnicalSkill[];
    habilidadesBlandas: SoftSkill[];
    experiencias: Experience[];
    educaciones: Education[];
    idiomas: Language[];
    feedback: Feedback[];
}