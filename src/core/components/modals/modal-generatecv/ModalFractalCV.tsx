import { useEffect, useState } from "react";
import { AppError, Talent, TalentResponse } from "../../../models";
import { MODAL_FRACTAL_CV } from "../../../utilities/modalsIds";
import { Modal } from "../Modal";
import {
  detectLanguage,
  getTextForDetection,
} from "../../../utilities/language.utils";
import { enqueueSnackbar } from "notistack";
import { Utils } from "../../../utilities/utils";
import { usePDFFromReact } from "../../../hooks/usePDFFromTemplate";
import { Loading } from "../../ui/Loading";
import { PDFViewer } from "@react-pdf/renderer";
import { FractalCVTemplate } from "../../templates/FractalCVTemplate";
import { useTranslateTalentData } from "../../../hooks/useTranslateTalentData";
import { TalentForFractalCV } from "../../../models/interfaces/TalentDataForFractal";
import { useViewTalentFile } from "../../../hooks/talents/useViewTalentFile";
import { useUploadTalentFileS3 } from "../../../hooks/talents/useUploadTalentFileS3";
import {
  ARCHIVO_PDF,
  DOCUMENTO_CV_FR_EN,
  DOCUMENTO_CV_FR_ES,
} from "../../../utilities/constants";

// @marker helpers
const notifySuccess = (message: string) =>
  enqueueSnackbar({ message, variant: "success" });

const notifyError = (message: string) =>
  enqueueSnackbar({ message, variant: "error" });

// Convierte el PDF generado (base64 crudo) en un File para subirlo a S3.
const base64ToPdfFile = (base64: string, fileName: string): File => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], fileName, { type: "application/pdf" });
};

export interface ModalFractalCVProps {
  language?: "ES" | "EN";
  talentDet?: TalentResponse;
  talent?: Talent;
  onUpdate: (idTalento: number) => void;
}

export const ModalFractalCV = ({
  language = "ES",
  talentDet,
  talent,
  onUpdate,
}: ModalFractalCVProps) => {
  const [talentForCV, setTalentForCV] =
    useState<TalentForFractalCV | null>(null);
  const [generatedPDF, setGeneratedPDF] = useState<string | null>(
    null,
  );
  const [existingFile, setExistingFile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const { viewingId, viewFile } = useViewTalentFile();
  const fetchingCV = viewingId !== null;

  useEffect(() => {
    if (!talentDet || !talent) return;

    // Format educations for lang support
    const sortedEducations = talentDet.educaciones;
    const educations =
      sortedEducations
        ?.filter((ed) => ed.grado !== "3") // Ignora las de tipo curso
        .map((ed) => ({
          ...ed,
          grado: Utils.formatDegree(ed.grado),
        })) || [];

    const certificaciones =
      sortedEducations
        ?.filter((ed) => ed.grado === "3") // Toma las de tipo curso
        .map((ed) => ({
          ...ed,
          grado: Utils.formatDegree(ed.grado),
        })) || [];

    const sortedExp = talentDet.experiencias;

    const dataForCV: TalentForFractalCV = {
      descripcion: talentDet.descripcion,
      ciudad: talent?.ciudad,
      pais: talent?.pais,
      habilidadesTecnicas: talentDet.habilidadesTecnicas,
      habilidadesBlandas: talentDet.habilidadesBlandas,
      experiencias: sortedExp,
      educaciones: educations,
      idiomas: talentDet.idiomas,
      certificaciones: certificaciones,
    };
    setTalentForCV(dataForCV);
  }, [talentDet, talent]);

  useEffect(() => {
    if (talentDet?.files) {
      const idTipoDocumento =
        language === "ES" ? DOCUMENTO_CV_FR_ES : DOCUMENTO_CV_FR_EN;
      const file = talentDet.files.find(
        (f: any) => f.idTipoDocumento === idTipoDocumento,
      );
      setExistingFile(file || null);
    }
  }, [talentDet, language]);

  /**
   * @marker handlers
   */

  const handleOnCloseModal = () => {
    setGeneratedPDF(null);
    setShowPreview(false);
  };

  const openFile = () => {
    const lookingFor =
      language === "ES" ? DOCUMENTO_CV_FR_ES : DOCUMENTO_CV_FR_EN;

    const cvFile = talentDet?.files.find(
      (file) => file.idTipoDocumento === lookingFor,
    );

    if (cvFile?.idArchivo) {
      viewFile(cvFile.idArchivo);
    } else {
      notifyError("No se encontró el archivo");
    }
  };

  const getFullname = () => {
    return `${talent?.nombres || ""} ${
      talent?.apellidoPaterno || ""
    } ${talent?.apellidoMaterno || ""}`;
  };

  // @marker generate CV
  const { getPDFWorker, isLoading: converting } = usePDFFromReact();
  const { isLoading: isTranslating, translateTalentData } =
    useTranslateTalentData();
  const { isLoading: isSavingFile, uploadFile } = useUploadTalentFileS3();

  // === Función para generar el PDF (sin guardar) ===
  const handleGenerate = async () => {
    if (!talentForCV || !talentDet || !talent) return;

    try {
      // Detectar idioma
      const textForDetection = getTextForDetection(talentForCV);
      const langDetected = detectLanguage(textForDetection);

      let cvData = talentForCV;

      // Traducir solo si es necesario
      if (
        langDetected !== language &&
        (langDetected === "ES" || langDetected === "EN")
      ) {
        const translated = await translateTalentData(
          talentForCV,
          language,
        );
        cvData = translated.promptResponse;
        setTalentForCV(cvData);
      }

      // Generar PDF en base64
      const encodedPDF = await getPDFWorker(
        cvData,
        getFullname(),
        cvData.experiencias || [],
        language,
      );

      setGeneratedPDF(encodedPDF);
      notifySuccess("CV generado correctamente");
      setShowPreview(true);
    } catch (error) {
      if (error instanceof AppError) notifyError(error.message);
      notifyError("Error al generar el CV.");
    }
  };

  // === Función para guardar (nuevo archivo) vía URL pre-firmada ===
  const handleSave = async () => {
    if (!generatedPDF || !talent?.idTalento) return;

    try {
      const idTipoDocumento =
        language === "ES" ? DOCUMENTO_CV_FR_ES : DOCUMENTO_CV_FR_EN;
      const fileName = `${getFullname().replace(
        /\s+/g,
        "_",
      )}_CV_${language}.pdf`;
      const file = base64ToPdfFile(generatedPDF, fileName);

      await uploadFile({
        idTalento: talent.idTalento,
        idTipoDocumento,
        idTipoArchivo: ARCHIVO_PDF,
        file,
      });

      notifySuccess("CV guardado correctamente");
      setGeneratedPDF(null);
      onUpdate(talent.idTalento);
    } catch (error) {
      if (error instanceof AppError) notifyError(error.message);
      else notifyError("Error al guardar el CV.");
    }
  };

  // === Función para actualizar (archivo existente) vía URL pre-firmada ===
  const handleUpdate = async () => {
    if (!generatedPDF || !talent?.idTalento || !existingFile) return;

    try {
      const idTipoDocumento =
        language === "ES" ? DOCUMENTO_CV_FR_ES : DOCUMENTO_CV_FR_EN;
      const fileName = `${getFullname().replace(
        /\s+/g,
        "_",
      )}_CV_${language}.pdf`;
      const file = base64ToPdfFile(generatedPDF, fileName);

      await uploadFile({
        idTalento: talent.idTalento,
        idTipoDocumento,
        idTipoArchivo: ARCHIVO_PDF,
        file,
        idArchivo: existingFile.idArchivo,
      });

      notifySuccess("CV actualizado correctamente");
      setGeneratedPDF(null);
      setShowPreview(false);
      onUpdate(talent.idTalento);
    } catch (error) {
      if (error instanceof AppError) notifyError(error.message);
      else notifyError("Error al actualizar el CV.");
    }
  };

  // Determinar qué botones mostrar
  const showGenerateButton = !existingFile && !generatedPDF;
  const showRegenerateButton = existingFile && !generatedPDF;
  const showSaveButton = !existingFile && generatedPDF;
  const showUpdateButton = existingFile && generatedPDF;

  const isLoading =
    converting ||
    isTranslating ||
    isSavingFile ||
    fetchingCV;

  return (
    <Modal
      id={MODAL_FRACTAL_CV}
      title={`CV Fractal ${language === "ES" ? "Español" : "Inglés"}`}
      showButtonOptions={false}
      onClose={handleOnCloseModal}
    >
      {isLoading && <Loading opacity="opacity-60" />}
      <div className="mt-5 flex flex-col h-min-[700px]">
        <div className="flex gap-5 items-center justify-center mb-5">
          {showGenerateButton && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              Generar
            </button>
          )}

          {showRegenerateButton && (
            <div className="flex gap-8">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={openFile}
              >
                Ver actual
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                Re-generar
              </button>
            </div>
          )}

          {showSaveButton && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isLoading}
            >
              Guardar
            </button>
          )}

          {showUpdateButton && (
            <button
              className="px-4 py-2 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleUpdate}
              disabled={isLoading}
            >
              Actualizar
            </button>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="w-full h-[65vh] mt-4">
          {talentForCV && talentDet ? (
            <PDFViewer width="100%" height="100%">
              <FractalCVTemplate
                talent={talentForCV}
                fullname={getFullname()}
                sorteWorkExperience={talentForCV?.experiencias || []}
                language={language}
              />
            </PDFViewer>
          ) : (
            <div>Cargando vista previa..</div>
          )}
        </div>
      )}
    </Modal>
  );
};
