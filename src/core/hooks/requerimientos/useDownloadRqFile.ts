import { useState } from "react";
import { generateRqDownloadUrl } from "../../services/requirements.service";
import { enqueueSnackbar } from "notistack";

export const useDownloadRqFile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadFile = async (rqFile: number) => {
    try {
      setIsLoading(true);
      const { data } = await generateRqDownloadUrl({ idArchivo: rqFile });

      if (data.result?.idTipoMensaje === 2 && data.url) {
        // Descarga directa desde S3 con URL pre-firmada (no pasa por el backend).
        window.open(data.url, "_blank");
      } else {
        enqueueSnackbar({
          message: "Archivo no disponible",
          variant: "warning",
        });
      }
    } catch (error) {
      enqueueSnackbar({ message: "Ha ocurrido un error", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return [isLoading, downloadFile] as const;
};
