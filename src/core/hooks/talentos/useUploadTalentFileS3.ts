import { useState } from "react";
import { AppError } from "../../models";
import { describeS3Error, uploadFileToS3 } from "../../services/s3.service";
import { confirmTalentUpload, generateTalentUploadUrl } from "../../services/talents.service";

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

      // 2. Subir el archivo directamente a S3 con el content-type FIRMADO.
      const s3Response = await uploadFileToS3(
        presigned.url,
        file,
        presigned.contentType,
      );
      if (!s3Response.ok) {
        throw new AppError(await describeS3Error(s3Response));
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
