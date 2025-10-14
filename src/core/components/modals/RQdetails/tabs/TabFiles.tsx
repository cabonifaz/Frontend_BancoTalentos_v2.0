import { zodResolver } from "@hookform/resolvers/zod";
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
import { usePostHook } from "../../../../hooks/usePostHook";
import { Loading } from "../../../ui/Loading";

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
}

export const TabFiles = ({
  rqId,
  fileOptions,
  initialFiles,
  fetchRequirement,
}: TabProps) => {
  // @marker base state
  const [files, setFiles] = useState<Archivo[]>(initialFiles);
  const { deleteData, deleteLoading } = useDeleteHook();
  const hasNewFiles = files.some(
    (f) => f.idRequerimientoArchivo === 0
  );
  const [isLoading, downloadFile] = useDownloadRqFile();
  const { postData, postloading } = usePostHook();

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

    const lstArchivos = await Promise.all(
      newFiles.map(async (archivo) => {
        const base64 = await Utils.fileToBase64(archivo.file);
        const { nombreArchivo, extensionArchivo } =
          Utils.getFileNameAndExtension(archivo.name);
        const idTipoArchivo =
          Utils.getTipoArchivoId(extensionArchivo);
        return {
          string64: base64,
          nombreArchivo,
          extensionArchivo,
          idTipoArchivo,
          idTipoArchivoRQ: archivo.idTipoArchivoRq,
        };
      }) || []
    );

    const payload = {
      idRequerimiento: rqId,
      lstArchivos,
    };

    const response = await postData(
      "/fmi/requirement/file/save",
      payload
    );
    if (response.idTipoMensaje === 2) {
      fetchRequirement();
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
      <div className="p-4 h-full flex flex-col">
        {(postloading || deleteLoading || isLoading) && (
          <Loading opacity="opacity-60" />
        )}
        <div className="flex flex-col">
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
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />

          {/* Lista de archivos */}
          <div className="mt-2 flex-1 overflow-y-auto mb-4">
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
                  <img
                    src="/assets/ic_preview_file.png"
                    alt="icon preview"
                    className="w-5 h-5"
                  />
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
                  <img
                    src="/assets/ic_remove.png"
                    alt="icon close"
                    className="w-5 h-5"
                  />
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
