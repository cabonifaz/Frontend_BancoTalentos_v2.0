import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../../../models/schemas/NewRQSchemaV1";
import { useState } from "react";
import { Param } from "../../../../models";
import { allowedFileExtensions } from "../../../../utilities/file-utils";

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
    register,
    formState: { errors },
    setValue,
  } = useFormContext<newRQSchemaType>();

  const handleRemoveFile = (index: number) => {
    const updatedArchivos = archivos.filter((_, i) => i !== index);
    setArchivos(updatedArchivos);
    setValue("lstArchivos", updatedArchivos, {
      shouldValidate: true,
    });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      // @marker new files
      const nuevosArchivos = Array.from(event.target.files).map(
        (file) => ({
          name: file.name,
          size: file.size,
          file,
          idTipoArchivoRQ: 0,
        })
      );

      setArchivos((prevArchivos) => {
        const actualizados = [...prevArchivos, ...nuevosArchivos];
        setValue("lstArchivos", actualizados, {
          shouldValidate: true,
        });
        return actualizados;
      });
    }
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        {/* Archivos */}
        <div className="mx-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
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
        </div>
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {/**@marker files map */}
          {archivos.map((archivo, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 p-2 bg-gray-50 rounded-md mb-1 dark:bg-slate-800"
            >
              <span className="text-sm text-gray-700 truncate flex-1 mr-2 dark:text-slate-200">
                {archivo.name}
              </span>
              <label className="flex  text-sm text-gray-600 gap-3 items-center dark:text-slate-300">
                <span className="flex items-center gap-2">
                  Tipo de archivo
                  {errors?.lstArchivos?.[index]?.idTipoArchivoRQ && (
                    <span className="text-red-500 text-xs font-medium">
                      *{" "}
                      {
                        errors?.lstArchivos?.[index]?.idTipoArchivoRQ
                          ?.message
                      }
                    </span>
                  )}
                </span>
                <select
                  className="w-60 px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 cursor-pointer dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  defaultValue={0}
                  {...register(
                    `lstArchivos.${index}.idTipoArchivoRQ`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                  onChange={(e) => {
                    const nuevoTipo = Number(e.target.value);
                    setArchivos((prev) => {
                      const actualizados = [...prev];
                      actualizados[index] = {
                        ...actualizados[index],
                        idTipoArchivoRQ: nuevoTipo,
                      };
                      setValue("lstArchivos", actualizados, {
                        shouldValidate: true,
                      });
                      return actualizados;
                    });
                  }}
                >
                  <option value={0} disabled>
                    Elija un tipo
                  </option>
                  {fileOptions.map((option) => (
                    <option value={option.id} key={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="text-red-500 hover:text-red-600 focus:outline-none dark:hover:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        {errors.lstArchivos && (
          <p className="text-red-500 text-sm mt-1">
            {errors.lstArchivos.message}
          </p>
        )}
      </div>
    </>
  );
};
