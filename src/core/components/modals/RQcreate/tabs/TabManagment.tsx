import { useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../../../models/schemas/NewRQSchemaV1";
import { DropdownForm } from "../../../forms";
import { NumberInput } from "../../../ui/InputNumber";
import { Param } from "../../../../models";

interface TabProps {
  rqDuration: Param[];
  rqModes: Param[];
  factModes: Param[];
}

export const TabManagement = ({
  rqDuration,
  rqModes,
  factModes,
}: TabProps) => {
  const {
    register,
    formState: { errors },
    control,
    clearErrors,
  } = useFormContext<newRQSchemaType>();

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center">
          <label className="w-1/3 text-sm font-medium text-gray-700">
            Duración de RQ:
          </label>
          <div className="flex gap-4 w-2/3">
            <div className="flex flex-col gap-1">
              <NumberInput<newRQSchemaType>
                control={control}
                name="duracion"
                error={errors?.duracion?.message}
              />
            </div>
            <DropdownForm
              name="idDuracion"
              control={control}
              error={errors.idDuracion}
              required={false}
              flex={true}
              clearErrors={clearErrors}
              options={rqDuration.map((d) => ({
                value: d.num1,
                label: d.string1,
              }))}
            />
          </div>
        </div>
        <div className="flex items-center">
          <label className="w-1/3 text-sm font-medium text-gray-700">
            Duración de contrato:
          </label>
          <div className="flex gap-4 w-2/3">
            <div className="flex flex-col gap-1">
              <NumberInput<newRQSchemaType>
                control={control}
                name="contrato.duration"
                error={errors?.contrato?.duration?.message}
              />
            </div>
            <DropdownForm
              name="contrato.idDuration"
              control={control}
              error={errors?.contrato?.idDuration}
              required={false}
              flex={true}
              clearErrors={clearErrors}
              options={rqDuration.map((d) => ({
                value: d.num1,
                label: d.string1,
              }))}
            />
          </div>
        </div>
        <div className="flex items-center">
          <label className="w-1/3 text-sm font-medium text-gray-700">
            Modalidad:
          </label>
          <DropdownForm
            name="idModalidad"
            control={control}
            error={errors.idModalidad}
            required={false}
            flex={true}
            clearErrors={clearErrors}
            options={rqModes.map((mod) => ({
              value: mod.num1,
              label: mod.string1,
            }))}
          />
        </div>
        <div className="flex items-center">
          <label className="w-1/3 text-sm font-medium text-gray-700">
            Modalidad de contrato:
          </label>
          <div className="flex flex-col gap-2">
            {factModes.map((mod) => (
              <label
                key={mod.num1}
                className="inline-flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  value={mod.num1}
                  {...register("idModalidadFact")}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                />
                <span>{mod.string1}</span>
              </label>
            ))}
          </div>
          {errors.idModalidadFact && (
            <span className="text-red-500 text-xs">
              {errors.idModalidadFact.message}
            </span>
          )}
        </div>
      </div>
    </>
  );
};
