import { useEffect, useRef, useState } from "react";
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
  ARCHIVO_WORD,
  DOCUMENTO_CV_FR_EN,
  DOCUMENTO_CV_FR_ES,
} from "../../../utilities/constants";
import {
  DOCX_MIME,
  downloadFractalCVDocx,
} from "../../../utilities/fractalCVDocx";
import {
  confirmTalentUpload,
  generateTalentUploadUrl,
  uploadFileToS3,
} from "../../../services/apiService";

const PDF_MIME = "application/pdf";

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
  return new File([byteArray], fileName, { type: PDF_MIME });
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
  const [isUpdatingCv, setIsUpdatingCv] = useState(false);
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
  // Un CV recién generado se guarda como PDF; el editado (Word) se sube aparte.
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

  /**
   * Reemplaza el CV existente en S3 sobrescribiendo su MISMA key vía URL
   * pre-firmada. Sirve tanto para PDF (regenerado) como para Word (editado): el
   * tipo lo definen `contentType`/`idTipoArchivo`. La subida depende del código
   * 200 del PUT; solo se confirma en BD si la ruta cambió (p. ej. al alternar
   * entre .pdf y .docx), caso en el que el backend limpia el objeto anterior.
   */
  const replaceCvInPlace = async (
    rawFile: File,
    contentType: string,
    idTipoArchivo: number,
  ) => {
    if (!talent?.idTalento || !existingFile?.idArchivo) {
      throw new AppError("No hay un CV existente para reemplazar");
    }
    const idTipoDocumento =
      language === "ES" ? DOCUMENTO_CV_FR_ES : DOCUMENTO_CV_FR_EN;
    // El File debe tener el mismo MIME que se firma en la URL pre-firmada.
    const file =
      rawFile.type === contentType
        ? rawFile
        : new File([rawFile], rawFile.name, { type: contentType });

    const { data: presigned } = await generateTalentUploadUrl({
      idTalento: talent.idTalento,
      idTipoDocumento,
      fileName: file.name,
      contentType,
      idArchivo: existingFile.idArchivo,
    });
    if (presigned.result?.idMensaje !== 2 || !presigned.url) {
      throw new AppError(
        presigned.result?.mensaje || "No se pudo generar la URL de subida",
      );
    }

    const s3Response = await uploadFileToS3(presigned.url, file);
    if (!s3Response.ok) {
      throw new AppError(
        `Error subiendo el archivo a S3 (código ${s3Response.status})`,
      );
    }

    // Reemplazo in-place: normalmente basta el 200. Solo si cambió la ruta se
    // registra en BD (p. ej. al alternar entre .pdf y .docx).
    if (presigned.requiresConfirm) {
      const { data: confirm } = await confirmTalentUpload({
        idTalento: talent.idTalento,
        idArchivo: existingFile.idArchivo,
        idTipoDocumento,
        idTipoArchivo,
        nombreArchivo: presigned.fileName,
        path: presigned.path,
      });
      if (confirm.idMensaje !== 2) {
        throw new AppError(confirm.mensaje || "Error al registrar el archivo");
      }
    }
  };

  // === Función para actualizar (regenerar sobre el existente) → PDF ===
  const handleUpdate = async () => {
    if (!generatedPDF || !talent?.idTalento || !existingFile) return;

    try {
      setIsUpdatingCv(true);
      const fileName = `${getFullname().replace(
        /\s+/g,
        "_",
      )}_CV_${language}.pdf`;
      const file = base64ToPdfFile(generatedPDF, fileName);
      await replaceCvInPlace(file, PDF_MIME, ARCHIVO_PDF);

      notifySuccess("CV actualizado correctamente");
      setGeneratedPDF(null);
      setShowPreview(false);
      onUpdate(talent.idTalento);
    } catch (error) {
      if (error instanceof AppError) notifyError(error.message);
      else notifyError("Error al actualizar el CV.");
    } finally {
      setIsUpdatingCv(false);
    }
  };

  // === Word editable: descargar / re-subir (se guarda como .docx en S3) ===
  const editedInputRef = useRef<HTMLInputElement>(null);
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);
  const [isUploadingEdited, setIsUploadingEdited] = useState(false);

  // Descarga el CV en Word (.docx) para editarlo. No se guarda: es efímero.
  const handleDownloadForEdit = async () => {
    if (!talentForCV) return;
    try {
      setIsDownloadingWord(true);
      await downloadFractalCVDocx(
        talentForCV,
        getFullname(),
        talentForCV.experiencias || [],
        language,
      );
    } catch {
      notifyError("No se pudo generar el Word para editar.");
    } finally {
      setIsDownloadingWord(false);
    }
  };

  // Sube el .docx editado a S3 sobrescribiendo el CV existente (in-place). Se
  // guarda tal cual como Word; la subida solo depende del código 200 del PUT.
  const handleEditedFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file || !talent?.idTalento) return;

    if (!file.name.toLowerCase().endsWith(".docx")) {
      notifyError("El archivo debe ser un Word (.docx)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notifyError("El archivo supera el tamaño máximo permitido (10 MB)");
      return;
    }
    if (!existingFile?.idArchivo) {
      notifyError("Primero genera y guarda el CV para poder reemplazarlo");
      return;
    }

    try {
      setIsUploadingEdited(true);
      await replaceCvInPlace(file, DOCX_MIME, ARCHIVO_WORD);
      notifySuccess("CV editado subido correctamente");
      onUpdate(talent.idTalento);
    } catch (error) {
      if (error instanceof AppError) notifyError(error.message);
      else notifyError("Error al subir el CV editado.");
    } finally {
      setIsUploadingEdited(false);
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
    isUpdatingCv ||
    fetchingCV ||
    isDownloadingWord ||
    isUploadingEdited;

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

        {/* Word editable: solo disponible si el CV ya existe en S3 o se acaba de
            generar (no tiene sentido editar un CV que aún no se ha generado). */}
        {(existingFile || generatedPDF) && (
          <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 text-center max-w-md">
              ¿Necesitas agregar información extra? Descarga el CV en Word, edítalo y
              vuelve a subirlo: reemplazará al actual (se guarda como Word).
            </p>
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleDownloadForEdit}
                disabled={isLoading || !talentForCV}
              >
                Descargar para editar
              </button>
              <button
                className="px-4 py-2 bg-slate-600 text-white rounded-lg shadow hover:bg-slate-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={() => editedInputRef.current?.click()}
                disabled={isLoading || !existingFile?.idArchivo}
              >
                Subir CV editado
              </button>
              <input
                ref={editedInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleEditedFileSelected}
              />
            </div>
          </div>
        )}
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
