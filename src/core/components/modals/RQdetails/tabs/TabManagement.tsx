import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { UpdateBaseRQSchemaType } from "../../../../models/schemas/UpdateBaseRQSchema";
import { DropdownForm } from "../../../forms";
import { NumberInput } from "../../../ui/InputNumber";
import { Param } from "../../../../models";
import { BillingTable } from "../../../ui/BillingTable";

interface TabProps {
  rqDurationOptions: Param[];
  paymentModes: Param[];
  rqMode: Param[];
  isEditing: boolean;
  handleToggleEdit: () => void;
}

export const TabManagment = ({
  rqDurationOptions,
  paymentModes,
  rqMode,
  isEditing,
  handleToggleEdit,
}: TabProps) => {
  const {
    formState: { errors },
    control,
    clearErrors,
    setValue,
    getValues,
  } = useFormContext<UpdateBaseRQSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lstFacturacion",
  });

  const handleDurationChange = (checked: boolean) => {
    if (!checked) {
      clearErrors(["duracion", "idDuracion"]);
      setValue("duracion", undefined);
      setValue("idDuracion", undefined);
    }
  };

  const findLabelForMode = (idModalidad: number) => {
    const mode = paymentModes.find((mod) => mod.num1 === idModalidad);
    return mode ? mode.string1 : "Desconocida";
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
        declaraSunat: declareSunatIds.includes(value),
        sedeSunat: "sede-principal",
        montoBase: 0,
        montoMovilidad: 0,
        montoMensual: 0,
        montoTrimestral: 0,
        montoSemestral: 0,
        idEstadoRegistro: 1,
      });
    } else if (!checked && existsIndex !== -1) {
      remove(existsIndex);
    }
  };

  return (
    <div className="h-full flex flex-col px-4 overflow-scroll">
      <div className="flex flex-col h-[calc(570px-120px)]">
        {/* Contenido del formulario */}
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={handleToggleEdit}
            className="focus:outline-none"
          >
            <img
              src="/assets/ic_edit.svg"
              alt="Editar"
              className="w-7 h-7"
            />
          </button>
        </div>

        {/* Switch de tiene duración */}
        <div className="flex items-center mb-6">
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
                      disabled={!isEditing}
                      onChange={(e) => {
                        if (isEditing) {
                          field.onChange(e.target.checked);
                          handleDurationChange(e.target.checked);
                        }
                      }}
                      className="sr-only peer"
                      aria-label="Tiene duración"
                    />
                    {/* Fondo del switch */}
                    <div
                      className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                        field.value ? "bg-blue-600" : "bg-gray-200"
                      } ${!isEditing ? "opacity-60" : ""}`}
                    />
                    {/* Bolita deslizante */}
                    <span
                      className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                        field.value
                          ? "translate-x-5"
                          : "translate-x-0"
                      } ${!isEditing ? "opacity-60" : ""}`}
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

        {/* Campos de duración condicionales */}
        <Controller
          name="tieneDuracion"
          control={control}
          render={({ field }) => (
            <>
              {field.value && (
                <div className="flex items-center mb-6">
                  <label className="w-1/3 text-sm font-medium text-gray-700">
                    Duración de RQ:
                  </label>
                  <div className="flex gap-4 w-2/3">
                    <div className="flex flex-col gap-1">
                      <NumberInput<UpdateBaseRQSchemaType>
                        control={control}
                        name="duracion"
                        isDisabled={!isEditing}
                        error={errors?.duracion?.message}
                      />
                    </div>
                    <DropdownForm
                      name="idDuracion"
                      control={control}
                      error={errors.idDuracion}
                      required={false}
                      allowEmpty={true}
                      flex={true}
                      disabled={!isEditing}
                      options={rqDurationOptions.map((d) => ({
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

        <div className="flex items-center mb-6">
          <label className="w-1/3 text-sm font-medium text-gray-700">
            Duración de contrato:
          </label>
          <div className="flex gap-4 w-2/3">
            <div className="flex flex-col gap-1">
              <NumberInput<UpdateBaseRQSchemaType>
                control={control}
                name="contrato.duration"
                isDisabled={!isEditing}
                error={errors?.contrato?.duration?.message}
              />
            </div>
            <DropdownForm
              name="contrato.idDuration"
              control={control}
              error={errors?.contrato?.idDuration}
              required={false}
              flex={true}
              allowEmpty={true}
              allowEmptyMessage="No definido"
              disabled={!isEditing}
              options={rqDurationOptions.map((d) => ({
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
            disabled={!isEditing}
            options={rqMode.map((modalidad) => ({
              value: modalidad.num1,
              label: modalidad.string1,
            }))}
          />
        </div>
        <div className="flex items-center">
          <label className="w-1/3 text-sm font-medium text-gray-700">
            Modalidad de contrato:
          </label>
          <Controller
            name="idModalidadFact"
            control={control}
            render={({ field }) => (
              <div className="mt-4 flex flex-col gap-2">
                {paymentModes.map((mode) => (
                  <label
                    key={mode.num1}
                    className="inline-flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      value={mode.num1}
                      disabled={!isEditing}
                      checked={
                        field.value?.includes(mode.num1) || false
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const value = mode.num1;
                        handleChangeContractMode(e, mode.string1);

                        if (checked) {
                          field.onChange([
                            ...(field.value || []),
                            value,
                          ]);
                        } else {
                          field.onChange(
                            field.value?.filter(
                              (v: number) => v !== value
                            )
                          );
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                    />
                    <span>{mode.string1}</span>
                  </label>
                ))}
              </div>
            )}
          />

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

        <div className="flex-1"></div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={!isEditing}
            className={`btn text-sm ${
              isEditing ? "btn-primary" : "btn-disabled"
            }`}
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
};
