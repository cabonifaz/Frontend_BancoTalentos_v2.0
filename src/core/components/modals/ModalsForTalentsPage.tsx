import { Education, Experience, Feedback, Language, Talent, TalentResponse } from "../../models";
import { DOCUMENTO_CV } from "../../utilities/constants";
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
import { ModalUploadCert } from "./ModalUploadCert";
import { ModalUploadResume } from "./ModalUploadResume";

interface Props {
    talent?: Talent;
    talentDet?: TalentResponse;
    experienceRef: React.MutableRefObject<Experience | null>;
    educationRef: React.MutableRefObject<Education | null>;
    languageRef: React.MutableRefObject<Language | null>;
    feedbackRef: React.MutableRefObject<Feedback | null>;
    fetchTalentDets: (id: number) => void;
    updateTalentList?: (idTalento: number, fields: Partial<Talent>) => void;
}

export const ModalsForTalentsPage = ({
    talent,
    talentDet,
    fetchTalentDets,
    experienceRef,
    educationRef,
    languageRef,
    feedbackRef,
    updateTalentList
}: Props) => {

    const handleUpdate = (idTalento: number) => fetchTalentDets(idTalento);

    return (
        <>
            <ModalResume
                cvData={talentDet?.files.find((file) => file.idTipoDocumento === DOCUMENTO_CV)}
            />

            <ModalContact
                idTalento={talent?.idTalento}
                email={talentDet?.email}
                phone={talentDet?.celular}
                onUpdate={handleUpdate}
            />

            <ModalSocialMedia
                idTalento={talent?.idTalento}
                linkedin={talentDet?.linkedin}
                github={talentDet?.github}
                onUpdate={handleUpdate}
            />

            <ModalEditPhoto
                idTalento={talent?.idTalento}
                updateTalentList={updateTalentList}
            />

            <ModalUploadResume
                idTalento={talent?.idTalento}
                idArchivo={talentDet?.files.find((file) => file.idTipoDocumento === DOCUMENTO_CV)?.idArchivo}
                onUpdate={handleUpdate}
            />

            <ModalSalary
                idTalento={talent?.idTalento}
                idMoneda={talentDet?.idMoneda}
                idModalidadFacturacion={talent?.idModalidadFacturacion}
                initPlan={talent?.montoInicialPlanilla}
                endPlan={talent?.montoFinalPlanilla}
                initRxH={talent?.montoInicialRxH}
                endRxH={talent?.montoFinalRxH}
                updateTalentList={updateTalentList}
            />

            <ModalUploadCert
                idTalento={talent?.idTalento}
                onUpdate={handleUpdate}
            />

            <ModalTechSkills
                idTalento={talent?.idTalento}
                onUpdate={handleUpdate}
            />

            <ModalSoftSkills
                idTalento={talent?.idTalento}
                onUpdate={handleUpdate}
            />

            <ModalSummary
                idTalento={talent?.idTalento}
                description={talentDet?.descripcion}
                onUpdate={handleUpdate}
            />

            <ModalAvailability
                idTalento={talent?.idTalento}
                availability={talentDet?.disponibilidad}
                onUpdate={handleUpdate}
            />

            <ModalExperience
                idTalento={talent?.idTalento}
                experienceRef={experienceRef}
                onUpdate={handleUpdate}
            />

            <ModalEducation
                idTalento={talent?.idTalento}
                educationRef={educationRef}
                onUpdate={handleUpdate}
            />

            <ModalLanguage
                idTalento={talent?.idTalento}
                languageRef={languageRef}
                onUpdate={handleUpdate}
            />

            <ModalFeedback
                idTalento={talent?.idTalento}
                feedbackRef={feedbackRef}
                onUpdate={handleUpdate}
            />
        </>
    );
}