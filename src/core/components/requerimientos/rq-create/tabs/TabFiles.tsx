import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { newRQSchemaType } from "@/core/models/schemas/NewRQSchemaV1";
import { useState } from "react";
import { Param } from "@/core/models";
import { allowedFileExtensions } from "@/core/utilities/file-utils";
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
  name: string;
  size: number;
  file: File;
  idTipoArchivoRQ: number;
}

interface TabProps {
  fileOptions: { id: number; label: string }[];
  filesParms: Param[];
}

export const TabFiles = ({ fileOptions, filesParms }: TabProps) => {
  const allowedFileTypes = allowedFileExtensions(filesParms);
  // @marker base state
  const [archivos, setArchivos] = useState<Archivo[]>([]);

  const {
    formState: { errors },
    setValue,
  } = useFormContext<newRQSchemaType>();

  const sync = (updated: Archivo[]) => {
    setArchivos(updated);
    setValue("lstArchivos", updated, { shouldValidate: true });
  };

  const handleRemoveFile = (index: number) => {
    sync(archivos.filter((_, i) => i !== index));
  };

  // @marker new files
  const handleAddFiles = (files: File[]) => {
    sync([
      ...archivos,
      ...files.map((file) => ({
        name: file.name,
        size: file.size,
        file,
        idTipoArchivoRQ: 0,
      })),
    ]);
  };

  // El <select> anterior también escribía la lista entera con setValue (su
  // onChange pisaba al de register), así que el Select no necesita registrarse.
  const handleTipoChange = (index: number, nuevoTipo: number) => {
    const updated = [...archivos];
    updated[index] = { ...updated[index], idTipoArchivoRQ: nuevoTipo };
    sync(updated);
  };

  return (
    <TabBody>
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Archivos"
          helper="Adjunta los documentos del requerimiento. Cada archivo necesita un tipo."
        />

        <FileDropzone accept={allowedFileTypes} onFiles={handleAddFiles} />

        {/**@marker files map */}
        {archivos.length > 0 && (
          <FileList>
            {archivos.map((archivo, index) => {
              const typeError =
                errors?.lstArchivos?.[index]?.idTipoArchivoRQ?.message;
              return (
                <FileRow
                  key={`${archivo.name}-${index}`}
                  name={archivo.name}
                  meta={fileMeta(archivo.name, archivo.size)}
                  control={
                    <div className="flex flex-col gap-1">
                      {/* "Elija un tipo" era una opción disabled: no hay opción vacía. */}
                      <AppSelect
                        aria-label={`Tipo de ${archivo.name}`}
                        aria-invalid={!!typeError}
                        value={archivo.idTipoArchivoRQ}
                        onChange={(v) => handleTipoChange(index, Number(v))}
                        options={fileOptions.map((option) => ({
                          value: option.id,
                          label: option.label,
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
                  }
                  actions={
                    <IconAction
                      icon={Trash2}
                      tone="red"
                      label={`Quitar ${archivo.name}`}
                      onClick={() => handleRemoveFile(index)}
                    />
                  }
                />
              );
            })}
          </FileList>
        )}

        {errors.lstArchivos?.message && (
          <p className="text-[13px] text-red-500 dark:text-red-400">
            {errors.lstArchivos.message}
          </p>
        )}
      </section>
    </TabBody>
  );
};
