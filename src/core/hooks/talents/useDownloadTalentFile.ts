import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { generateTalentDownloadUrl } from "../../services/apiService";
import { handleError } from "../../utilities/errorHandler";

/**
 * Descarga de archivos de talento vía URL pre-firmada (S3 directo).
 * Reutiliza el endpoint existente `generateTalentDownloadUrl`; el archivo
 * no pasa por el backend. Expone `downloadingId` para mostrar el estado por fila.
 */
export const useDownloadTalentFile = () => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const downloadFile = async (idArchivo: number) => {
    setDownloadingId(idArchivo);
    try {
      const { data } = await generateTalentDownloadUrl({ idFile: idArchivo });

      if (data.result?.idMensaje === 2 && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        enqueueSnackbar(
          data.result?.mensaje || "No se pudo generar el enlace de descarga",
          { variant: "error" },
        );
      }
    } catch (err) {
      handleError(err, enqueueSnackbar);
    } finally {
      setDownloadingId(null);
    }
  };

  return { downloadingId, downloadFile } as const;
};
