import { useState } from "react";
import { axiosInstanceFMI } from "../services/axiosService";
import { FileRqResponse } from "../models/response/FileRqResponse";
import { downloadAnyFile } from "../utilities/file-utils";
import { enqueueSnackbar } from "notistack";

export const useDownloadRqFile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const downloadFile = async (rqFile: number) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstanceFMI.get<FileRqResponse>(
        `fmi/requirement/file?idArchivo=${rqFile}`
      );

      const { file, ext, result } = data;

      if (result.idTipoMensaje === 2 && file.trim() !== "") {
        try {
          downloadAnyFile(file, ext);
          enqueueSnackbar({
            message: "Archivo descargado",
            variant: "success",
          });
        } catch {
          enqueueSnackbar({
            message: "No se pudo descargar el archivo",
            variant: "warning",
          });
        }
      } else
        enqueueSnackbar({
          message: "Archivo no encontrado",
          variant: "warning",
        });
    } catch (error) {
      enqueueSnackbar({ message: "Ha ocurrido un error", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return [isLoading, downloadFile] as const;
};
