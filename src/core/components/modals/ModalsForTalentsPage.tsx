import { lazy, Suspense } from "react";

import {
  Education,
  Experience,
  Feedback,
  Language,
  Talent,
  TalentResponse,
} from "../../models";
import { DOCUMENTO_CV } from "../../utilities/constants";

// Lazy imports
const ModalResume = lazy(() =>
  import("./ModalResume").then((m) => ({ default: m.ModalResume })),
);
const ModalFractalCV = lazy(() =>
  import("./modal-generatecv/ModalFractalCV").then((m) => ({
    default: m.ModalFractalCV,
  })),
);
const ModalContact = lazy(() =>
  import("./ModalContact").then((m) => ({ default: m.ModalContact })),
);
const ModalSocialMedia = lazy(() =>
  import("./ModalSocialMedia").then((m) => ({
    default: m.ModalSocialMedia,
  })),
);
const ModalEditPhoto = lazy(() =>
  import("./ModalEditPhoto").then((m) => ({
    default: m.ModalEditPhoto,
  })),
);
const ModalUploadResume = lazy(() =>
  import("./ModalUploadResume").then((m) => ({
    default: m.ModalUploadResume,
  })),
);
const ModalSalary = lazy(() =>
  import("./ModalSalary").then((m) => ({ default: m.ModalSalary })),
);
const ModalUploadCert = lazy(() =>
  import("./ModalUploadCert").then((m) => ({
    default: m.ModalUploadCert,
  })),
);
const ModalTechSkills = lazy(() =>
  import("./ModalTechSkills").then((m) => ({
    default: m.ModalTechSkills,
  })),
);
const ModalSoftSkills = lazy(() =>
  import("./ModalSoftSkills").then((m) => ({
    default: m.ModalSoftSkills,
  })),
);
const ModalSummary = lazy(() =>
  import("./ModalSummary").then((m) => ({ default: m.ModalSummary })),
);
const ModalAvailability = lazy(() =>
  import("./ModalAvailability").then((m) => ({
    default: m.ModalAvailability,
  })),
);
const ModalExperience = lazy(() =>
  import("./ModalExperience").then((m) => ({
    default: m.ModalExperience,
  })),
);
const ModalEducation = lazy(() =>
  import("./ModalEducation").then((m) => ({
    default: m.ModalEducation,
  })),
);
const ModalLanguage = lazy(() =>
  import("./ModalLanguage").then((m) => ({
    default: m.ModalLanguage,
  })),
);
const ModalFeedback = lazy(() =>
  import("./ModalFeedback").then((m) => ({
    default: m.ModalFeedback,
  })),
);
const ModalEditPersonal = lazy(() =>
  import("./ModalEditPersonal").then((m) => ({
    default: m.ModalEditPersonal,
  })),
);
const ModalUpdateWithCV = lazy(() =>
  import("./ModalUpdateWithCV").then((m) => ({
    default: m.ModalUpdateWithCV,
  })),
);

interface Props {
  talent?: Talent;
  talentDet?: TalentResponse;
  experienceRef: React.MutableRefObject<Experience | null>;
  educationRef: React.MutableRefObject<Education | null>;
  languageRef: React.MutableRefObject<Language | null>;
  feedbackRef: React.MutableRefObject<Feedback | null>;
  cvLang?: "ES" | "EN";
  fetchTalentDets: (id: number) => void;
  updateTalentList?: (
    idTalento: number,
    fields: Partial<Talent>,
  ) => void;
}

export const ModalsForTalentsPage = ({
  talent,
  talentDet,
  fetchTalentDets,
  experienceRef,
  educationRef,
  languageRef,
  feedbackRef,
  updateTalentList,
  cvLang,
}: Props) => {
  const handleUpdate = (idTalento: number) =>
    fetchTalentDets(idTalento);

  return (
    <>
      <Suspense fallback={null}>
        <ModalResume
          cvData={talentDet?.files.find(
            (file) => file.idTipoDocumento === DOCUMENTO_CV,
          )}
        />

        <ModalFractalCV
          talentDet={talentDet}
          talent={talent}
          language={cvLang}
          onUpdate={handleUpdate}
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
          onUpdate={handleUpdate}
        />

        <ModalUploadResume
          idTalento={talent?.idTalento}
          idArchivo={
            talentDet?.files.find(
              (file) => file.idTipoDocumento === DOCUMENTO_CV,
            )?.idArchivo
          }
          onUpdate={handleUpdate}
        />

        <ModalSalary
          idTalento={talent?.idTalento}
          idMonedaPlan={talent?.idMonedaPlan}
          idMonedaRxh={talent?.idMonedaRxh}
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
          updateTalentList={updateTalentList}
        />

        <ModalEditPersonal
          idTalento={talent?.idTalento}
          onUpdate={handleUpdate}
          updateTalentList={updateTalentList}
        />

        <ModalUpdateWithCV
          idTalento={talent?.idTalento}
          talentDet={talentDet}
          onUpdate={handleUpdate}
        />
      </Suspense>
    </>
  );
};
