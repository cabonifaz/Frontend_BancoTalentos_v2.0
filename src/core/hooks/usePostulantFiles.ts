import { useCallback, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  confirmPostulantUpload,
  describeS3Error,
  generatePostulantDownloadUrl,
  generatePostulantUploadUrl,
  listPostulantFiles,
  removePostulantFile,
  uploadFileToS3,
} from "../services/apiService";
import { PostulantFile } from "../models";

/**
 * Gestiona los archivos de un postulante (REQUERIMIENTO_TALENTO): listar, subir por
 * URL pre-firmada, descargar y eliminar. Tras subir/eliminar/seleccionar siempre se
 * vuelve a consultar el listado (SP_..._LST); nunca se muta el estado en memoria.
 */
export const usePostulantFiles = (idRequerimiento: number) => {
  const [files, setFiles] = useState<PostulantFile[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFiles = useCallback(async (idRequerimientoTalento: number) => {
    setLoadingList(true);
    try {
      const { data } = await listPostulantFiles(idRequerimientoTalento);
      if (data.idTipoMensaje === 2) {
        setFiles(data.archivos ?? []);
      } else {
        setFiles([]);
        enqueueSnackbar({
          message: data.mensaje || "No se pudieron cargar los archivos",
          variant: "warning",
        });
      }
    } catch {
      setFiles([]);
      enqueueSnackbar({
        message: "Ha ocurrido un error al cargar los archivos",
        variant: "error",
      });
    } finally {
      setLoadingList(false);
    }
  }, []);

  const selectPostulante = useCallback(
    (idRequerimientoTalento: number | null) => {
      setSelectedId(idRequerimientoTalento);
      if (idRequerimientoTalento) {
        fetchFiles(idRequerimientoTalento);
      } else {
        setFiles([]);
      }
    },
    [fetchFiles]
  );

  const uploadFile = async (file: File, idTipoArchivo: number) => {
    if (!selectedId) return;
    setUploading(true);
    try {
      // 1. URL PUT pre-firmada
      const { data: presigned } = await generatePostulantUploadUrl({
        idRequerimiento,
        idRequerimientoTalento: selectedId,
        fileName: file.name,
        contentType: file.type,
      });
      if (presigned.result?.idTipoMensaje !== 2 || !presigned.url) {
        enqueueSnackbar({
          message: presigned.result?.mensaje || "No se pudo generar la URL de subida",
          variant: "error",
        });
        return;
      }

      // 2. Subida directa a S3
      const s3Response = await uploadFileToS3(presigned.url, file);
      if (!s3Response.ok) {
        enqueueSnackbar({
          message: await describeS3Error(s3Response),
          variant: "error",
        });
        return;
      }

      // 3. Confirmar en el backend
      const { data: confirm } = await confirmPostulantUpload({
        idRequerimiento,
        idRequerimientoTalento: selectedId,
        nombreArchivo: presigned.fileName,
        idTipoArchivo,
        path: presigned.path,
      });
      if (confirm.idTipoMensaje !== 2) {
        enqueueSnackbar({
          message: confirm.mensaje || "Error al registrar el archivo",
          variant: "error",
        });
        return;
      }

      enqueueSnackbar({ message: "Archivo subido con éxito", variant: "success" });
      await fetchFiles(selectedId); // refresco automático
    } catch {
      enqueueSnackbar({
        message: "Ha ocurrido un error al subir el archivo",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (idArchivo: number) => {
    if (!selectedId) return;
    setDownloading(true);
    try {
      const { data } = await generatePostulantDownloadUrl({
        idRequerimientoTalento: selectedId,
        idArchivo,
      });
      if (data.result?.idTipoMensaje === 2 && data.url) {
        window.open(data.url, "_blank");
      } else {
        enqueueSnackbar({ message: "Archivo no disponible", variant: "warning" });
      }
    } catch {
      enqueueSnackbar({ message: "Ha ocurrido un error", variant: "error" });
    } finally {
      setDownloading(false);
    }
  };

  const deleteFile = async (idArchivo: number) => {
    if (!selectedId) return;
    setDeleting(true);
    try {
      const { data } = await removePostulantFile(idArchivo);
      if (data.idTipoMensaje === 2) {
        enqueueSnackbar({ message: "Archivo eliminado", variant: "success" });
        await fetchFiles(selectedId); // refresco automático
      } else {
        enqueueSnackbar({
          message: data.mensaje || "No se pudo eliminar el archivo",
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar({
        message: "Ha ocurrido un error al eliminar el archivo",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const isBusy = loadingList || uploading || downloading || deleting;

  return {
    files,
    selectedId,
    selectPostulante,
    uploadFile,
    downloadFile,
    deleteFile,
    isBusy,
    loadingList,
  };
};
