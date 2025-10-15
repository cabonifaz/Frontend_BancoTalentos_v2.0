import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { UpdateBaseRQSchemaType } from "../../../../models/schemas/UpdateBaseRQSchema";
import { RequirementResponse } from "../../../../models/response/RequirementResponse";
import { Param } from "../../../../models";
import { formatISODate } from "../../../../utilities/date.utils";

interface TabProps {
  rqId: number;
  requirement?: RequirementResponse;
  rqStates: Param[];
  isEditing: boolean;
  fetchRequirement: () => void;
  setIsEditing: (value: boolean) => void;
}

export const TabRQData = ({
  requirement,
  rqStates,
  isEditing,
  setIsEditing,
}: TabProps) => {
  const rq = requirement?.requerimiento;

  const {
    register,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
    watch,
  } = useFormContext<UpdateBaseRQSchemaType>();
  const [initialValues, setInitialValues] = useState<
    Partial<UpdateBaseRQSchemaType>
  >({});

  useEffect(() => {
    if (rq) {
      const mappedValues: Partial<UpdateBaseRQSchemaType> = {
        codigoRQ: rq.codigoRQ,
        titulo: rq.titulo,
        descripcion: rq.descripcion,
        idEstadoRQ: rq.idEstado,
        fechaSolicitud: formatISODate(rq.fechaSolicitud),
        fechaVencimiento: formatISODate(rq.fechaVencimiento),
      };

      // Set form values
      (
        Object.keys(mappedValues) as (keyof typeof mappedValues)[]
      ).forEach((key) => {
        setValue(
          key,
          mappedValues[
            key
          ] as UpdateBaseRQSchemaType[keyof UpdateBaseRQSchemaType]
        );
      });

      // Set reference snapshot
      setInitialValues(mappedValues);
    }
  }, [rq]);

  // Agregar watchers para las fechas
  const fchSolcitud = watch("fechaSolicitud");
  const fchVencimiento = watch("fechaVencimiento");

  useEffect(() => {
    if (fchSolcitud && fchVencimiento) {
      const fechaSolicitudDate = new Date(fchSolcitud);
      const fechaVencimientoDate = new Date(fchVencimiento);

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
  }, [fchSolcitud, fchVencimiento]);

  // @marker handlers
  const handleEdit = () => {
    if (isEditing) {
      (
        Object.keys(initialValues) as (keyof typeof initialValues)[]
      ).forEach((key) => {
        setValue(
          key,
          initialValues[
            key
          ] as UpdateBaseRQSchemaType[keyof UpdateBaseRQSchemaType],
          { shouldValidate: false }
        );
      });
    }
    setIsEditing(!isEditing);
  };

  return (
    <>
      <div className="flex flex-col flex-1">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleEdit}
            className="focus:outline-none"
          >
            <img
              src="/assets/ic_edit.svg"
              alt="Editar"
              className="w-7 h-7"
            />
          </button>
        </div>
        {/* Campos del formulario */}
        <div className="space-y-4 flex-1">
          {/* Título RQ */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700">
              Título:
            </label>
            <input
              {...register("titulo")}
              disabled={!isEditing}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
          {errors.titulo && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.titulo.message}
            </p>
          )}
          {/* Código RQ */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700">
              Código RQ:
            </label>
            <input
              {...register("codigoRQ")}
              disabled={!isEditing}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
          {errors.codigoRQ && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.codigoRQ.message}
            </p>
          )}

          {/* Fecha de Solicitud */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700">
              Fecha de Solicitud:
            </label>
            <input
              type="date"
              {...register("fechaSolicitud")}
              disabled={!isEditing}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
          {errors.fechaSolicitud && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.fechaSolicitud.message}
            </p>
          )}

          {/* Descripción */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700">
              Descripción:
            </label>
            <textarea
              {...register("descripcion")}
              disabled={!isEditing}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5] resize-none"
            />
          </div>
          {errors.descripcion && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.descripcion.message}
            </p>
          )}

          {/* Estado */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700">
              Estado:
            </label>
            <select
              {...register("idEstadoRQ", {
                valueAsNumber: true,
              })}
              disabled={!isEditing}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
            >
              {rqStates.map((option) => (
                <option key={option?.num1} value={option?.num1}>
                  {option?.string1}
                </option>
              ))}
            </select>
          </div>
          {errors.idEstadoRQ && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.idEstadoRQ.message}
            </p>
          )}

          {/* Fecha Vencimiento */}
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700">
              Fecha Vencimiento:
            </label>
            <input
              type="date"
              {...register("fechaVencimiento")}
              id="fechaVencimiento"
              className="input w-2/3"
              disabled={!isEditing}
            />
          </div>
          {errors.fechaVencimiento && (
            <p className="text-red-500 text-sm mt-1 ml-[33%]">
              {errors.fechaVencimiento.message}
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 mt-4">
          <button
            type="submit"
            disabled={!isEditing}
            className={`btn ${
              isEditing ? "btn-primary" : "btn-disabled"
            }`}
          >
            Actualizar
          </button>
        </div>
      </div>
    </>
  );
};
