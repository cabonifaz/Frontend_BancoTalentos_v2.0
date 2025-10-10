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
import { sortEducation, sortWorkExperience } from "./helpers";
import { useTranslateTalentData } from "../../../hooks/useTranslateTalentData";
import { TalentForFractalCV } from "../../../models/interfaces/TalentDataForFractal";
import { UploadTalentFileRequest } from "../../../models/requests/talent";
import {
  useAddTalentFile,
  useFetchFile,
  useUpdateTalentFile,
} from "../../../hooks";
import {
  ARCHIVO_PDF,
  DOCUMENTO_CV_FR_EN,
  DOCUMENTO_CV_FR_ES,
} from "../../../utilities/constants";
import { getCvFile } from "../../../services/apiService";

// @marker helpers
const notifySuccess = (message: string) =>
  enqueueSnackbar({ message, variant: "success" });

const notifyError = (message: string) =>
  enqueueSnackbar({ message, variant: "error" });

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
    null
  );
  const [existingFile, setExistingFile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const { isLoading: fetchingCV, fetchFile } = useFetchFile();

  useEffect(() => {
    if (!talentDet || !talent) return;

    // Format educations for lang support
    const sortedEducations = sortEducation(talentDet.educaciones);
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

    const sortedExp = sortWorkExperience(talentDet.experiencias);

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
        (f: any) => f.idTipoDocumento === idTipoDocumento
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

  const openFile = async () => {
    const lookingFor =
      language === "ES" ? DOCUMENTO_CV_FR_ES : DOCUMENTO_CV_FR_EN;

    const cvFile = talentDet?.files.find(
      (file) => file.idTipoDocumento === lookingFor
    );

    try {
      const response = await fetchFile(cvFile?.idArchivo || 0);
      const { archivo, result } = response;
      if (result.idMensaje == 2) Utils.openPdfDocument(archivo);
      else notifyError(result.mensaje);
    } catch (error) {
      notifyError("Error al abrir el arhivo");
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
  const { isLoading: isUploading, addFile } = useAddTalentFile();
  const { isLoading: isUpdating, addFile: updateFile } =
    useUpdateTalentFile();

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
          language
        );
        cvData = translated.promptResponse;
        setTalentForCV(cvData);
        notifySuccess("Traducción correcta, generando CV...");
      }

      // Generar PDF en base64
      const encodedPDF = await getPDFWorker(
        cvData,
        getFullname(),
        cvData.experiencias || [],
        language
      );

      setGeneratedPDF(encodedPDF);
      notifySuccess(
        "CV generado correctamente. Revisa la vista previa."
      );
      setShowPreview(true);
    } catch (error) {
      if (error instanceof AppError) notifyError(error.message);
      notifyError("Error al generar el CV.");
    }
  };

  // === Función para guardar (nuevo archivo) ===
  const handleSave = async () => {
    if (!generatedPDF || !talent) return;

    try {
      const idTipoDocumento =
        language === "ES" ? DOCUMENTO_CV_FR_ES : DOCUMENTO_CV_FR_EN;

      const uploadRequest: UploadTalentFileRequest = {
        idTalento: talent.idTalento ?? undefined,
        nombreArchivo: `${getFullname().replace(
          /\s+/g,
          "_"
        )}_CV_${language}.pdf`,
        extensionArchivo: "pdf",
        idTipoArchivo: ARCHIVO_PDF,
        idTipoDocumento: idTipoDocumento,
        string64: generatedPDF,
      };

      await addFile(uploadRequest);
      notifySuccess("CV guardado correctamente");
      setGeneratedPDF(null);
      onUpdate(talent.idTalento);
    } catch (error) {
      if (error instanceof AppError) notifyError(error.message);
      notifyError("Error al guardar el CV.");
    }
  };

  // === Función para actualizar (archivo existente) ===
  const handleUpdate = async () => {
    if (!generatedPDF || !talent || !existingFile) return;

    try {
      const idTipoDocumento =
        language === "ES" ? DOCUMENTO_CV_FR_ES : DOCUMENTO_CV_FR_EN;

      const updateRequest: UploadTalentFileRequest = {
        idArchivo: existingFile.idArchivo,
        idTalento: talent.idTalento ?? undefined,
        nombreArchivo: `${getFullname().replace(
          /\s+/g,
          "_"
        )}_CV_${language}`,
        extensionArchivo: "pdf",
        idTipoArchivo: ARCHIVO_PDF,
        idTipoDocumento: idTipoDocumento,
        string64: generatedPDF,
      };

      await updateFile(updateRequest);
      notifySuccess("CV actualizado correctamente");
      setGeneratedPDF(null);
      setShowPreview(false);
      onUpdate(talent.idTalento);
    } catch (error) {
      if (error instanceof AppError) notifyError(error.message);
      notifyError("Error al actualizar el CV.");
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
    isUploading ||
    isUpdating ||
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
