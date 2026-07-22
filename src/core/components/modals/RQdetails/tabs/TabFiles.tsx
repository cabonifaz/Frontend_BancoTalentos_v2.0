import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  AddFilesSchemaType,
  Param,
  addFilesSchema,
} from "../../../../models";
import { useEffect, useState } from "react";
import { useDeleteHook } from "../../../../hooks/useDeleteHook";
import { useDownloadRqFile } from "../../../../hooks/useDownloadRqFile";
import { Utils } from "../../../../utilities/utils";
import {
  confirmRqUpload,
  generateRqUploadUrl,
  uploadFileToS3,
} from "../../../../services/apiService";
import { enqueueSnackbar } from "notistack";
import { Loading } from "../../../ui/Loading";
import { allowedFileExtensions } from "../../../../utilities/file-utils";

interface Archivo {
  idRequerimientoArchivo: number;
  name: string;
  size: number;
  file: File;
  link?: string;
  idTipoArchivoRq?: number;
}

interface TabProps {
  rqId: number;
  fileOptions: Param[];
  initialFiles: any[];
  fetchRequirement: () => void;
  extensionsParams: Param[];
}

export const TabFiles = ({
  rqId,
  fileOptions,
  initialFiles,
  fetchRequirement,
  extensionsParams,
}: TabProps) => {
  // @marker base state
  const [files, setFiles] = useState<Archivo[]>(initialFiles);
  const allowedFileTypes = allowedFileExtensions(extensionsParams);
  const { deleteData, deleteLoading } = useDeleteHook();
  const hasNewFiles = files.some(
    (f) => f.idRequerimientoArchivo === 0
  );
  const [isLoading, downloadFile] = useDownloadRqFile();
  const [uploading, setUploading] = useState(false);

  // Formulario independiente con su propio esquema de validación
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<AddFilesSchemaType>({
    resolver: zodResolver(addFilesSchema),
    defaultValues: { lstArchivos: [] },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFiles(initialFiles);

      setValue("lstArchivos", initialFiles, {
        shouldValidate: true,
      });

      initialFiles.forEach((file, index) => {
        setValue(
          `lstArchivos.${index}.idTipoArchivoRq`,
          file.idTipoArchivoRq ?? 0,
          { shouldValidate: false }
        );
      });
    }
  }, [initialFiles]);

  const onSubmitAddFiles = async () => {
    // Validar el formulario del hijo manualmente
    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();

    // new files only
    const newFiles = data.lstArchivos.filter(
      (archivo) => archivo.idRequerimientoArchivo === 0
    );

    if (newFiles.length === 0) return;

    setUploading(true);
    const failed: string[] = [];

    try {
      // Por cada archivo nuevo: URL pre-firmada → PUT a S3 → confirmar en BD.
      for (const archivo of newFiles) {
        const file = archivo.file as File;
        const { extensionArchivo } = Utils.getFileNameAndExtension(
          archivo.name
        );
        const idTipoArchivo = Utils.getTipoArchivoId(
          extensionArchivo,
          extensionsParams
        );

        try {
          // 1. URL PUT pre-firmada
          const { data: presigned } = await generateRqUploadUrl({
            idRequerimiento: rqId,
            idTipoArchivoRQ: archivo.idTipoArchivoRq ?? 0,
            fileName: archivo.name,
            contentType: file.type,
          });

          if (presigned.result?.idTipoMensaje !== 2) {
            failed.push(archivo.name);
            continue;
          }

          // 2. Subida directa a S3
          const s3Response = await uploadFileToS3(presigned.url, file);
          if (!s3Response.ok) {
            failed.push(archivo.name);
            continue;
          }

          // 3. Confirmar en el backend
          const { data: confirm } = await confirmRqUpload({
            idRequerimiento: rqId,
            idTipoArchivoRQ: archivo.idTipoArchivoRq ?? 0,
            idTipoArchivo,
            nombreArchivo: presigned.fileName,
            path: presigned.path,
          });

          if (confirm.idTipoMensaje !== 2) failed.push(archivo.name);
        } catch {
          failed.push(archivo.name);
        }
      }

      if (failed.length > 0) {
        enqueueSnackbar({
          message: `No se pudieron subir: ${failed.join(", ")}`,
          variant: "warning",
        });
      } else {
        enqueueSnackbar({
          message: "Archivos subidos con éxito",
          variant: "success",
        });
      }

      fetchRequirement();
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        idRequerimientoArchivo: 0,
        name: file.name,
        size: file.size,
        file,
        idTipoArchivoRq: 0,
      }));

      const currentFormArchivos = getValues("lstArchivos") || [];
      setFiles((prev) => [...prev, ...newFiles]);
      setValue("lstArchivos", [...currentFormArchivos, ...newFiles], {
        shouldValidate: true,
      });
      event.target.value = "";
    }
  };

  const handleRemoveFile = async (
    index: number,
    idArchivo: number
  ) => {
    const updatedArchivos = files.filter((_, i) => i !== index);

    if (idArchivo !== 0) {
      const deleteResponse = await deleteData(
        `/fmi/requirement/file/remove?idRqFile=${idArchivo}`
      );

      if (deleteResponse.idTipoMensaje === 2) {
        fetchRequirement();
      }
      return;
    }
    setFiles(updatedArchivos);
    setValue("lstArchivos", updatedArchivos, {
      shouldValidate: true,
    });
  };

  const handleDownloadRqFile = (rqFile: number) => {
    downloadFile(rqFile);
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col p-4">
        {(uploading || deleteLoading || isLoading) && (
          <Loading opacity="opacity-60" />
        )}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Encabezado */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Archivos elegidos:
            </label>
            <button
              type="button"
              onClick={() =>
                document.getElementById("fileInput")?.click()
              }
              className="btn btn-text"
            >
              Elegir archivos
            </button>
          </div>

          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
            accept={allowedFileTypes}
          />

          {/* Lista de archivos */}
          <div className="mt-2 mb-4 min-h-0 flex-1 overflow-y-auto">
            {/**@marker files maps */}
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md mb-1"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadRqFile(file.idRequerimientoArchivo);
                  }}
                  className="text-blue-500 hover:text-blue-600 focus:outline-none"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700 truncate flex-1 mr-2">
                  {file.name}
                </span>
                {file.idRequerimientoArchivo === 0 && (
                  <span className="text-sm w-fit px-2 py-1 rounded-lg bg-green-100 text-green-700 truncate mr-2">
                    Nuevo
                  </span>
                )}
                <div className="flex flex-col">
                  <select
                    {...register(
                      `lstArchivos.${index}.idTipoArchivoRq`,
                      {
                        valueAsNumber: true,
                      }
                    )}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      setValue(
                        `lstArchivos.${index}.idTipoArchivoRq`,
                        value,
                        {
                          shouldValidate: true,
                        }
                      );

                      setFiles((prev) => {
                        const updated = [...prev];
                        updated[index] = {
                          ...updated[index],
                          idTipoArchivoRq: value,
                        };
                        return updated;
                      });
                    }}
                    value={
                      getValues(
                        `lstArchivos.${index}.idTipoArchivoRq`
                      ) || 0
                    }
                    className="w-60 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 cursor-pointer"
                    disabled={file.idRequerimientoArchivo !== 0}
                  >
                    <option value={0} disabled>
                      Elija un tipo
                    </option>
                    {fileOptions.map((option) => (
                      <option
                        value={option.num1}
                        key={option.idParametro}
                      >
                        {option.string1}
                      </option>
                    ))}
                  </select>
                  {errors.lstArchivos?.[index]?.idTipoArchivoRq && (
                    <p className="text-red-500 text-xs mt-1">
                      {
                        errors.lstArchivos?.[index]?.idTipoArchivoRq
                          ?.message
                      }
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveFile(
                      index,
                      file.idRequerimientoArchivo || 0
                    )
                  }
                  className="text-red-500 hover:text-red-600 focus:outline-none"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="absolute bottom-5 right-5 mt-auto flex justify-end">
            <button
              type="button"
              onClick={onSubmitAddFiles}
              disabled={!hasNewFiles}
              className={`btn w-fit text-sm ${
                hasNewFiles ? "btn-primary" : "btn-disabled"
              }`}
            >
              Agregar archivos nuevos
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
