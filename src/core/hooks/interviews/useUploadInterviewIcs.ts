import { useState } from "react";
import {
  generateUploadUrl,
  uploadFileToS3,
  confirmUploadFile,
} from "../../services/interviews.service";
import { TIPO_ARCHIVO_ENTREVISTA_ICS } from "../../utilities/constants";
import {
  IcsInterviewData,
  MIME_ICS,
  buildInterviewIcsFile,
} from "../../utilities/ics.utils";

/**
 * Genera el ICS de una entrevista, lo sube a S3 (URL pre-firmada) y registra su
 * metadata reutilizando el flujo de archivos de entrevista existente. El backend,
 * al confirmar el ICS con `notify`, reemplaza cualquier ICS activo previo (uno
 * solo por entrevista) y envía el correo con el ICS adjunto.
 *
 * Devuelve true si el ICS quedó registrado. Un false NO debe afectar la creación/
 * actualización de la entrevista: el ICS se maneja de forma independiente.
 */
export const useUploadInterviewIcs = () => {
  const [isUploadingIcs, setIsUploadingIcs] = useState(false);

  const uploadInterviewIcs = async (
    data: IcsInterviewData,
    notify: boolean,
    notificationType: string,
  ): Promise<boolean> => {
    setIsUploadingIcs(true);
    try {
      const file = buildInterviewIcsFile(data);
      if (!file) return false;

      const presigned = await generateUploadUrl({
        idInterview: data.id,
        idFileType: TIPO_ARCHIVO_ENTREVISTA_ICS,
        fileName: file.name,
        contentType: MIME_ICS,
      });
      const urlData = presigned.data?.data;
      if (!urlData?.url) return false;

      // El PUT manda el MISMO content-type con el que se pidio la firma: si se
      // dejara `file.type` y el navegador lo resolviera distinto, S3 responderia
      // SignatureDoesNotMatch.
      const s3 = await uploadFileToS3(urlData.url, file, MIME_ICS);
      if (!s3.ok) return false;

      const { data: confirm } = await confirmUploadFile({
        idInterview: data.id,
        idFileType: TIPO_ARCHIVO_ENTREVISTA_ICS,
        fileName: urlData.fileName,
        path: urlData.path,
        notify,
        notificationType,
      });
      return confirm?.idTipoMensaje === 2;
    } catch {
      return false;
    } finally {
      setIsUploadingIcs(false);
    }
  };

  return { isUploadingIcs, uploadInterviewIcs };
};
