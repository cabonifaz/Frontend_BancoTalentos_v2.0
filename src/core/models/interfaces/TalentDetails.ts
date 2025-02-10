import { DocumentFile, Education, Experience, Feedback, Language, SoftSkill } from "..";
import { TechnicalSkill } from "./TechnicalSkill";

export interface TalentDetails {
    documents: DocumentFile[];
    linkedin: string;
    github: string;
    technicalSkills: TechnicalSkill[];
    softSkills: SoftSkill[];
    availability: string;
    experiencie: Experience[];
    education: Education[];
    language: Language[];
    feedbacks: Feedback[];
}