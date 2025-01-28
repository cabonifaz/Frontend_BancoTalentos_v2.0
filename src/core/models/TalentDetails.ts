import { DocumentFile } from "./DocumentFile";
import { Education } from "./Education";
import { Experience } from "./Experience";
import { Feedback } from "./Feedback";
import { Language } from "./Language";
import { SoftSkill } from "./SoftSkill";
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