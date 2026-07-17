import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import { generateTalentDownloadUrl } from "../../services/apiService";
import { handleError } from "../../utilities/errorHandler";

/**
 * Visualización de archivos de talento (CV) en un visor del navegador vía URL
 * pre-firmada de S3. Reutiliza el endpoint `generateTalentDownloadUrl` con el
 * flag `inline: true`, de modo que el backend genera la URL con
 * `Content-Disposition: inline` y el PDF/imagen se abre en el visor en vez de
 * descargarse. Expone `viewingId` para mostrar el estado de carga por fila.
 */
export const useViewTalentFile = () => {
  const [viewingId, setViewingId] = useState<number | null>(null);

  const viewFile = async (idArchivo: number) => {
    setViewingId(idArchivo);
    try {
      const { data } = await generateTalentDownloadUrl({
        idFile: idArchivo,
        inline: true,
      });

      if (data.result?.idMensaje === 2 && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        enqueueSnackbar(
          data.result?.mensaje || "No se pudo generar el enlace del CV",
          { variant: "error" },
        );
      }
    } catch (err) {
      handleError(err as Error, enqueueSnackbar);
    } finally {
      setViewingId(null);
    }
  };

  return { viewingId, viewFile } as const;
};
