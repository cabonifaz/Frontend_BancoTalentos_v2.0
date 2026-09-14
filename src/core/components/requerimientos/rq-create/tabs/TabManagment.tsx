import {
  useFormContext,
  Controller,
  useFieldArray,
} from "react-hook-form";
import { newRQSchemaType } from "@/core/models/schemas/NewRQSchemaV1";
import { DropdownForm } from "@/core/components/forms";
import { NumberInput } from "@/core/components/requerimientos/InputNumber";
import { BillingTable } from "@/core/components/requerimientos/BillingTable";
import { Param } from "@/core/models";
import { Switch } from "@/core/components/ui/shadcn/switch";
import {
  BandPanel,
  BandSection,
  CheckOption,
  EmptyControl,
  Field,
  FormGroup,
  GroupDivider,
  TabBody,
} from "@/core/components/requerimientos/rq-ui";

interface TabProps {
  rqDuration: Param[];
  rqModes: Param[];
  factModes: Param[];
  currencyTypes: Param[];
}

export const TabManagement = ({
  rqDuration,
  rqModes,
  factModes,
  currencyTypes,
}: TabProps) => {
  const {
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

  const durationOptions = rqDuration.map((d) => ({
    value: d.num1,
    label: d.string1,
  }));

  const handleDurationChange = (checked: boolean) => {
    if (!checked) {
      clearErrors(["duracion", "idDuracion"]);
      setValue("duracion", undefined);
      setValue("idDuracion", undefined);
    }
  };

  const createDefaultBillingItem = (
    idModalidad: number,
    isPlanilla: boolean,
  ) => ({
    idModalidad,
    idGrupoModalidad: isPlanilla ? 2 : 1,
    currencyType: 0,
    minBaseAmount: 0,
    maxBaseAmount: 0,
    minTravelAllowance: 0,
    maxTravelAllowance: 0,
    minMonthlyAmount: 0,
    maxMonthlyAmount: 0,
    minQuarterlyAmount: 0,
    maxQuarterlyAmount: 0,
    minSemiAnnualAmount: 0,
    maxSemiAnnualAmount: 0,
  });

  const handleChangeContractMode = (value: number, checked: boolean) => {
    const current = getValues("lstFacturacion");

    const declareSunatIds = [2, 3]; // IDs que indican que declara a SUNAT

    const existsIndex = current?.findIndex(
      (f) => f.idModalidad === value,
    );

    if (checked && existsIndex === -1) {
      /**
       * Grupo Modalidad:
       * 1 - RxH
       * 2 - PLANILLA
       * Se puede verificar en la Tabla Parametros con idMaestro = 3
       */
      const declaraSunat = declareSunatIds.includes(value);
      append(createDefaultBillingItem(value, declaraSunat));
    } else if (!checked && existsIndex !== -1) {
      remove(existsIndex);
    }
  };

  const findLabelForMode = (idModalidad: number) => {
    const mode = factModes.find((mod) => mod.num1 === idModalidad);
    return mode ? mode.string1 : "Desconocida";
  };

  // Modalidades de los parámetros y, por si acaso, las de alguna facturación
  // cuya modalidad ya no esté en ellos.
  const modes = [
    ...factModes.map((mod) => ({ id: mod.num1, label: mod.string1 })),
    ...fields
      .filter((f) => !factModes.some((mod) => mod.num1 === f.idModalidad))
      .map((f) => ({
        id: f.idModalidad,
        label: findLabelForMode(f.idModalidad),
      })),
  ];

  return (
    // min-h-full: el recuadro de bandas crece hasta el final de la pestaña.
    <TabBody className="min-h-full">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
          <Controller
            name="tieneDuracion"
            control={control}
            render={({ field }) => (
              <Field
                label="Duración del RQ"
                required={!!field.value}
                error={errors.tieneDuracion?.message}
                aside={
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400">
                    Tiene duración
                    <Switch
                      ref={field.ref}
                      aria-label="Tiene duración"
                      checked={field.value || false}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        handleDurationChange(checked);
                      }}
                      onBlur={field.onBlur}
                      className="h-6 w-11 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-slate-700"
                      thumbClassName="h-5 w-5 shadow data-[state=checked]:translate-x-5"
                    />
                  </label>
                }
              >
                {field.value ? (
                  <div className="flex gap-2">
                    <div className="flex w-24 shrink-0 flex-col gap-1">
                      <NumberInput<newRQSchemaType>
                        control={control}
                        name="duracion"
                        error={errors?.duracion?.message}
                        className="w-full text-center"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <DropdownForm
                        name="idDuracion"
                        control={control}
                        error={errors.idDuracion}
                        required={false}
                        flex={true}
                        allowEmpty={true}
                        clearErrors={clearErrors}
                        options={durationOptions}
                      />
                    </div>
                  </div>
                ) : (
                  <EmptyControl>Sin duración definida</EmptyControl>
                )}
              </Field>
            )}
          />

          <Field label="Duración del contrato" required>
            <div className="flex gap-2">
              <div className="flex w-24 shrink-0 flex-col gap-1">
                <NumberInput<newRQSchemaType>
                  control={control}
                  name="contrato.duration"
                  error={errors?.contrato?.duration?.message}
                  className="w-full text-center"
                />
              </div>
              <div className="min-w-0 flex-1">
                <DropdownForm
                  name="contrato.idDuration"
                  control={control}
                  error={errors?.contrato?.idDuration}
                  required={false}
                  flex={true}
                  clearErrors={clearErrors}
                  options={durationOptions}
                />
              </div>
            </div>
          </Field>

          <Field label="Modalidad" required>
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
          </Field>
        </div>

      <GroupDivider />

      {/* Modalidades en casillas (hasta 3 por fila) y, debajo, el recuadro
          con la banda de cada una marcada. Como antes, marcada = tiene su
          tabla de facturación (no se escribe idModalidadFact: el payload no
          cambia). */}
      <FormGroup className="min-h-0 flex-1 gap-3" title="Modalidad de contrato">
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((mode) => (
            <CheckOption
              key={mode.id}
              checked={fields.some((f) => f.idModalidad === mode.id)}
              onCheckedChange={(checked) =>
                handleChangeContractMode(mode.id, checked)
              }
            >
              {mode.label}
            </CheckOption>
          ))}
        </div>
        {errors.idModalidadFact && (
          <p className="text-[13px] text-red-500 dark:text-red-400">
            {errors.idModalidadFact.message}
          </p>
        )}

        <BandPanel emptyText="Selecciona la modalidad para establecer la banda del RQ">
          {modes.map((mode) => {
            const index = fields.findIndex((f) => f.idModalidad === mode.id);
            return index === -1 ? null : (
              <BandSection key={fields[index].id} title={mode.label}>
                <BillingTable
                  index={index}
                  modalidadId={mode.id}
                  currencyOptions={currencyTypes}
                />
              </BandSection>
            );
          })}
        </BandPanel>
      </FormGroup>
    </TabBody>
  );
};
