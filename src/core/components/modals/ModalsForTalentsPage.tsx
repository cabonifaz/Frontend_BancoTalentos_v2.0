import { ModalAvailability } from "./ModalAvailability";
import { ModalContact } from "./ModalContact";
import { ModalEditPhoto } from "./ModalEditPhoto";
import { ModalEducation } from "./ModalEducation";
import { ModalExperience } from "./ModalExperience";
import { ModalFeedback } from "./ModalFeedback";
import { ModalLanguage } from "./ModalLanguage";
import { ModalResume } from "./ModalResume";
import { ModalSalary } from "./ModalSalary";
import { ModalSocialMedia } from "./ModalSocialMedia";
import { ModalSoftSkills } from "./ModalSoftSkills";
import { ModalSummary } from "./ModalSummary";
import { ModalTechSkills } from "./ModalTechSkills";

export const ModalsForTalentsPage = () => {
    return (
        <>
            <ModalAvailability />
            <ModalContact />
            <ModalEditPhoto />
            <ModalEducation />
            <ModalExperience />
            <ModalFeedback />
            <ModalLanguage />
            <ModalResume />
            <ModalSalary />
            <ModalSocialMedia />
            <ModalSoftSkills />
            <ModalSummary />
            <ModalTechSkills />
        </>
    );
}