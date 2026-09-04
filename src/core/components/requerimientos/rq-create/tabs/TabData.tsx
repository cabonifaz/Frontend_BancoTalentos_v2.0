import { useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../../../models/schemas/NewRQSchemaV1";
import { useEffect, useState } from "react";
import { Param } from "../../../../models";

interface TabProps {
  rqStates: Param[];
}

export const TabData = ({ rqStates }: TabProps) => {
  // @marker base state
  const [autogenRQ, setAutogenRQ] = useState(false);

  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
    setError,
  } = useFormContext<newRQSchemaType>();

  const fchSol = watch("fechaSolicitud");
  const fchVenc = watch("fechaVencimiento");

  useEffect(() => {
    if (fchSol && fchVenc) {
      const fechaSolicitudDate = new Date(fchSol);
      const fechaVencimientoDate = new Date(fchVenc);

      if (fechaVencimientoDate < fechaSolicitudDate) {
        requestAnimationFrame(() => {
          setError("fechaVencimiento", {
            type: "manual",
            message:
              "La fecha de vencimiento no puede ser menor a la fecha de solicitud",
          });
        });
      } else {
        requestAnimationFrame(() => {
          clearErrors("fechaVencimiento");
        });
      }
    }
  }, [fchSol, fchVenc, setError, clearErrors]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        <div className="space-y-4 flex-1">
          {/* Título RQ */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700 dark:text-slate-200">
              Título:
            </label>
            <input
              {...register("titulo")}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] dark:border-slate-600"
            />
          </div>
          {errors.titulo && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.titulo.message}
            </p>
          )}
          {/* Código RQ */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700 dark:text-slate-200">
              Código RQ:
            </label>
            <input
              {...register("codigoRQ")}
              disabled={autogenRQ}
              className={`w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] dark:border-slate-600 ${
                autogenRQ ? "text-zinc-500 dark:text-slate-400" : ""
              }`}
            />
          </div>
          {errors.codigoRQ && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.codigoRQ.message}
            </p>
          )}

          {/* Auto Gen RQ */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700 dark:text-slate-200">
              Autogenerar RQ:
            </label>
            <input
              {...register("autogenRQ")}
              type="checkbox"
              onChange={(e) => {
                setAutogenRQ(e.target.checked);
                setValue("codigoRQ", e.target.checked ? "Autogenerado" : "");
                clearErrors("codigoRQ");
              }}
              className="input-checkbox"
            />
          </div>
          {errors.autogenRQ && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.autogenRQ.message}
            </p>
          )}

          {/* Fecha de Solicitud */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700 dark:text-slate-200">
              Fecha de Solicitud:
            </label>
            <input
              type="date"
              {...register("fechaSolicitud")}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] dark:border-slate-600"
            />
          </div>
          {errors.fechaSolicitud && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.fechaSolicitud.message}
            </p>
          )}

          {/* Descripción */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700 dark:text-slate-200">
              Descripción:
            </label>
            <textarea
              {...register("descripcion")}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] resize-none dark:border-slate-600"
            />
          </div>
          {errors.descripcion && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.descripcion.message}
            </p>
          )}

          {/* Estado */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700 dark:text-slate-200">
              Estado:
            </label>
            <select
              {...register("idEstado", {
                valueAsNumber: true,
              })}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] dark:border-slate-600"
            >
              <option value={0}>Seleccione un estado</option>
              {rqStates.map((option) => (
                <option key={option.num1} value={option.num1}>
                  {option.string1}
                </option>
              ))}
            </select>
          </div>
          {errors.idEstado && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.idEstado.message}
            </p>
          )}

          {/* Fecha Vencimiento */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700 dark:text-slate-200">
              Fecha Vencimiento:
            </label>
            <input
              type="date"
              {...register("fechaVencimiento")}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] dark:border-slate-600"
            />
          </div>
          {errors.fechaVencimiento && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.fechaVencimiento.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
