import { useState } from "react";
import { AppError } from "../../models";
import {
  confirmTalentUpload,
  generateTalentUploadUrl,
  uploadFileToS3,
} from "../../services/apiService";

interface UploadArgs {
  idTalento: number;
  idTipoDocumento: number;
  idTipoArchivo: number;
  file: File;
  idArchivo?: number;
}

export const useUploadTalentFileS3 = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = async ({
    idTalento,
    idTipoDocumento,
    idTipoArchivo,
    file,
    idArchivo,
  }: UploadArgs) => {
    setIsLoading(true);
    try {
      // 1. Pedir URL PUT pre-firmada al backend.
      const { data: presigned } = await generateTalentUploadUrl({
        idTalento,
        idTipoDocumento,
        fileName: file.name,
        contentType: file.type,
      });

      if (presigned.result?.idMensaje !== 2 || !presigned.url) {
        throw new AppError(
          presigned.result?.mensaje || "No se pudo generar la URL de subida",
        );
      }

      // 2. Subir el archivo directamente a S3.
      const s3Response = await uploadFileToS3(presigned.url, file);
      if (!s3Response.ok) {
        throw new AppError("Error subiendo el archivo a S3");
      }

      if (presigned.requiresConfirm === false) {
        return { idMensaje: 2, mensaje: "Archivo subido correctamente" };
      }

      // Con idArchivo se reemplaza el existente.
      const { data: confirm } = await confirmTalentUpload({
        idTalento,
        ...(idArchivo ? { idArchivo } : {}),
        idTipoDocumento,
        idTipoArchivo,
        nombreArchivo: presigned.fileName,
        path: presigned.path,
      });

      if (confirm.idMensaje !== 2) {
        throw new AppError(confirm.mensaje || "Error al registrar el archivo");
      }

      return confirm;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, uploadFile };
};
