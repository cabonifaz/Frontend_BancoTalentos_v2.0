import {
  useFormContext,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { newRQSchemaType } from "../../../../models/schemas/NewRQSchemaV1";
import { DropdownForm } from "../../../forms";
import { NumberInput } from "../../../ui/InputNumber";
import { BillingTable } from "../../../ui/BillingTable";
import { Param } from "../../../../models";
import { useState } from "react";

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
    setValue,
    clearErrors,
    getValues,
  } = useFormContext<newRQSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lstFacturacion",
  });

  const [selectedContractModes, setSelectedContractModes] = useState<
    { idModalidad: number; label: string }[]
  >([]);

  const handleDurationChange = (checked: boolean) => {
    if (!checked) {
      clearErrors(["duracion", "idDuracion"]);
      setValue("duracion", undefined);
      setValue("idDuracion", undefined);
    }
  };

  const handleChangeContractMode = (
    e: React.ChangeEvent<HTMLInputElement>,
    label: string
  ) => {
    const value = parseInt(e.target.value, 10);
    const checked = e.target.checked;
    const current = getValues("lstFacturacion");

    const declareSunatIds = [2, 3]; // IDs que indican que declara a SUNAT

    const existsIndex = current?.findIndex(
      (f) => f.idModalidad === value
    );

    if (checked && existsIndex === -1) {
      /**
       * Grupo Modalidad:
       * 1 - RxH
       * 2 - PLANILLA
       * Se puede verificar en la Tabla Parametros con idMaestro = 3
       */
      append({
        idModalidad: value,
        idGrupoModalidad: declareSunatIds.includes(value) ? 2 : 1,
        declaraSunat: declareSunatIds.includes(value) ? 1 : 0,
        sedeSunat: "sede-principal",
        montoBase: 0,
        montoMovilidad: 0,
        montoMensual: 0,
        montoTrimestral: 0,
        montoSemestral: 0,
      });
      setSelectedContractModes((p) => [
        ...p,
        { idModalidad: value, label },
      ]);
    } else if (!checked && existsIndex !== -1) {
      remove(existsIndex);
      setSelectedContractModes((p) =>
        p.filter((mod) => mod.idModalidad !== value)
      );
    }
  };

  const findLabelForMode = (idModalidad: number) => {
    const mode = factModes.find((mod) => mod.num1 === idModalidad);
    return mode ? mode.string1 : "Desconocida";
  };

  return (
    <div className="h-full flex flex-col px-4 overflow-scroll">
      <div className="flex flex-col h-[calc(570px-120px)]">
        <div className="flex flex-col p-4 space-y-4">
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium text-gray-700">
              Tiene duración:
            </label>

            <div className="flex items-center gap-4 w-2/3">
              <Controller
                name="tieneDuracion"
                control={control}
                render={({ field }) => (
                  <>
                    <label className="inline-flex items-center cursor-pointer relative">
                      <input
                        type="checkbox"
                        checked={field.value || false}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                          handleDurationChange(e.target.checked);
                        }}
                        className="sr-only peer"
                        aria-label="Tiene duración"
                      />
                      {/* Fondo del switch */}
                      <div
                        className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                          field.value ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      />
                      {/* Bolita deslizante */}
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                          field.value
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </label>

                    {/* Texto visible usando field.value directamente */}
                    <span className="text-sm text-gray-700">
                      {field.value
                        ? "Tiene duración"
                        : "No tiene duración"}
                    </span>
                  </>
                )}
              />

              {errors.tieneDuracion && (
                <span className="text-red-500 text-xs ml-3">
                  {errors.tieneDuracion.message}
                </span>
              )}
            </div>
          </div>
          <Controller
            name="tieneDuracion"
            control={control}
            render={({ field }) => (
              <>
                {field.value && (
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
                        allowEmpty={true}
                        clearErrors={clearErrors}
                        options={rqDuration.map((d) => ({
                          value: d.num1,
                          label: d.string1,
                        }))}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          />
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
                    onChange={(e) =>
                      handleChangeContractMode(e, mod.string1)
                    }
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

          {/* === Render dinámico de BillingTables === */}
          <div className="mt-6 space-y-4">
            {fields.map((field, index) => (
              <BillingTable
                key={field.id}
                index={index}
                modalidadId={field.idModalidad}
                title={findLabelForMode(field.idModalidad)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
