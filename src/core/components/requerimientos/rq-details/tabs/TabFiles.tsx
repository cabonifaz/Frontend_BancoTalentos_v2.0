import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Trash2, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  AddFilesSchemaType,
  Param,
  addFilesSchema,
} from "@/core/models";
import { useEffect, useState } from "react";
import { useDeleteHook } from "@/core/hooks/useDeleteHook";
import { useDownloadRqFile } from "@/core/hooks/requerimientos/useDownloadRqFile";
import { Utils } from "@/core/utilities/utils";
import { confirmRqUpload, generateRqUploadUrl } from "@/core/services/requirements.service";
import { uploadFileToS3 } from "@/core/services/s3.service";
import { enqueueSnackbar } from "notistack";
import { Loading } from "@/core/components/ui/Loading";
import { allowedFileExtensions } from "@/core/utilities/file-utils";
import { Button } from "@/core/components/ui/shadcn/button";
import { Badge } from "@/core/components/ui/shadcn/badge";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { cn } from "@/core/lib/utils";
import {
  FileDropzone,
  FileList,
  FileRow,
  IconAction,
  SectionHeader,
  TabBody,
  fileMeta,
  rqControl,
} from "@/core/components/requerimientos/rq-ui";

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
  const newFilesCount = files.filter(
    (f) => f.idRequerimientoArchivo === 0
  ).length;
  const [isLoading, downloadFile] = useDownloadRqFile();
  const [uploading, setUploading] = useState(false);

  // Formulario independiente con su propio esquema de validación
  const {
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

  const handleAddFiles = (picked: File[]) => {
    const newFiles = picked.map((file) => ({
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
  };

  // El <select> anterior ya escribía el tipo con setValue (su onChange pisaba
  // al de register), así que el Select no necesita registrarse.
  const handleTipoChange = (index: number, value: number) => {
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

  const typeLabel = (id?: number) =>
    fileOptions.find((option) => option.num1 === id)?.string1;

  return (
    <TabBody>
      {(uploading || deleteLoading || isLoading) && (
        <Loading opacity="opacity-60" />
      )}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Archivos"
          helper="Documentos del requerimiento. Los nuevos se suben al pulsar el botón."
          actions={
            newFilesCount > 0 && (
              <Button
                onClick={onSubmitAddFiles}
                disabled={uploading}
                className="font-medium"
              >
                <Upload className="h-4 w-4" aria-hidden />
                {newFilesCount === 1
                  ? "Subir 1 archivo nuevo"
                  : `Subir ${newFilesCount} archivos nuevos`}
              </Button>
            )
          }
        />

        <FileDropzone compact accept={allowedFileTypes} onFiles={handleAddFiles} />

        {/**@marker files maps */}
        {files.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
            Este requerimiento aún no tiene archivos.
          </p>
        ) : (
          <FileList>
            {files.map((file, index) => {
              const isNew = file.idRequerimientoArchivo === 0;
              const typeError =
                errors.lstArchivos?.[index]?.idTipoArchivoRq?.message;
              return (
                <FileRow
                  key={`${file.idRequerimientoArchivo}-${index}`}
                  name={file.name}
                  meta={fileMeta(file.name, isNew ? file.size : 0)}
                  tag={isNew && <Badge variant="green">Nuevo</Badge>}
                  control={
                    isNew ? (
                      <div className="flex flex-col gap-1">
                        {/* "Elija un tipo" era una opción disabled: no hay opción vacía. */}
                        <AppSelect
                          aria-label={`Tipo de ${file.name}`}
                          aria-invalid={!!typeError}
                          value={file.idTipoArchivoRq || 0}
                          onChange={(v) => handleTipoChange(index, Number(v))}
                          options={fileOptions.map((option) => ({
                            value: option.num1,
                            label: option.string1,
                          }))}
                          placeholder="Elige un tipo"
                          emptyOption={false}
                          className={cn(
                            rqControl,
                            typeError && "border-red-500 dark:border-red-400"
                          )}
                        />
                        {typeError && (
                          <span className="text-xs text-red-500 dark:text-red-400">
                            {typeError}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-slate-200">
                        {typeLabel(file.idTipoArchivoRq) || "Sin tipo"}
                      </span>
                    )
                  }
                  actions={
                    <>
                      {!isNew && (
                        <IconAction
                          icon={Eye}
                          tone="blue"
                          label={`Ver ${file.name}`}
                          onClick={() =>
                            handleDownloadRqFile(file.idRequerimientoArchivo)
                          }
                        />
                      )}
                      <IconAction
                        icon={Trash2}
                        tone="red"
                        label={isNew ? `Quitar ${file.name}` : `Eliminar ${file.name}`}
                        onClick={() =>
                          handleRemoveFile(
                            index,
                            file.idRequerimientoArchivo || 0
                          )
                        }
                      />
                    </>
                  }
                />
              );
            })}
          </FileList>
        )}
      </section>
    </TabBody>
  );
};
