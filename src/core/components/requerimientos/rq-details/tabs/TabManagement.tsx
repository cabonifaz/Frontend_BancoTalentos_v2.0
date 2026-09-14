import {
  Controller,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { UpdateBaseRQSchemaType } from "@/core/models/schemas/UpdateBaseRQSchema";
import { DropdownForm } from "@/core/components/forms";
import { NumberInput } from "@/core/components/requerimientos/InputNumber";
import { Param } from "@/core/models";
import { BillingTable } from "@/core/components/requerimientos/BillingTable";
import { Switch } from "@/core/components/ui/shadcn/switch";
import { cn } from "@/core/lib/utils";
import {
  BandPanel,
  BandSection,
  CheckOption,
  EmptyControl,
  Field,
  FormGroup,
  GroupDivider,
  TabBody,
  rqReadonly,
} from "@/core/components/requerimientos/rq-ui";

interface TabProps {
  rqDurationOptions: Param[];
  paymentModes: Param[];
  rqMode: Param[];
  isEditing: boolean;
  currencyOptions: Param[];
}

export const TabManagment = ({
  rqDurationOptions,
  paymentModes,
  rqMode,
  isEditing,
  currencyOptions,
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

  // Sin pulsar Editar los datos se ven en sus campos, pero bloqueados.
  const locked = !isEditing;

  const durationOptions = rqDurationOptions.map((d) => ({
    value: d.num1,
    label: d.string1,
  }));

  const handleDurationChange = (checked: boolean) => {
    /**
     * Los valores 1, 1 son solo para saltarse la validación,
     * estos valores no se enviarán al backend si tieneDuracion es false.
     */
    if (!checked) {
      setValue("duracion", 1);
      setValue("idDuracion", 1);
      clearErrors(["duracion", "idDuracion"]);
    } else {
      setValue("duracion", 1);
      setValue("idDuracion", 0);
    }
  };

  const findLabelForMode = (idModalidad: number) => {
    const mode = paymentModes.find((mod) => mod.num1 === idModalidad);
    return mode ? mode.string1 : "Desconocida";
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
    idEstadoRegistro: 1,
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

  // Modalidades de los parámetros y, por si acaso, las de alguna facturación
  // cuya modalidad ya no esté en ellos.
  const modes = [
    ...paymentModes.map((mode) => ({ id: mode.num1, label: mode.string1 })),
    ...fields
      .filter((f) => !paymentModes.some((mode) => mode.num1 === f.idModalidad))
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
                required={isEditing && !!field.value}
                error={errors.tieneDuracion?.message}
                aside={
                  <label
                    className={cn(
                      "flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400",
                      isEditing ? "cursor-pointer" : "cursor-not-allowed"
                    )}
                  >
                    Tiene duración
                    <Switch
                      ref={field.ref}
                      aria-label="Tiene duración"
                      checked={field.value || false}
                      disabled={locked}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        handleDurationChange(checked);
                      }}
                      onBlur={field.onBlur}
                      className="h-6 w-11 disabled:cursor-not-allowed disabled:opacity-100 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-slate-700"
                      thumbClassName="h-5 w-5 shadow data-[state=checked]:translate-x-5"
                    />
                  </label>
                }
              >
                {field.value ? (
                  <div className="flex gap-2">
                    <div className="flex w-24 shrink-0 flex-col gap-1">
                      <NumberInput<UpdateBaseRQSchemaType>
                        control={control}
                        name="duracion"
                        isDisabled={locked}
                        error={errors?.duracion?.message}
                        className={cn("w-full text-center", rqReadonly)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <DropdownForm
                        name="idDuracion"
                        control={control}
                        error={errors.idDuracion}
                        required={false}
                        allowEmpty={true}
                        flex={true}
                        disabled={locked}
                        triggerClassName={rqReadonly}
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

          <Field label="Duración del contrato">
            <div className="flex gap-2">
              <div className="flex w-24 shrink-0 flex-col gap-1">
                <NumberInput<UpdateBaseRQSchemaType>
                  control={control}
                  name="contrato.duration"
                  isDisabled={locked}
                  error={errors?.contrato?.duration?.message}
                  className={cn("w-full text-center", rqReadonly)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <DropdownForm
                  name="contrato.idDuration"
                  control={control}
                  error={errors?.contrato?.idDuration}
                  required={false}
                  flex={true}
                  allowEmpty={true}
                  allowEmptyMessage="No definido"
                  disabled={locked}
                  triggerClassName={rqReadonly}
                  options={durationOptions}
                />
              </div>
            </div>
          </Field>

          <Field label="Modalidad" required={isEditing}>
            <DropdownForm
              name="idModalidad"
              control={control}
              error={errors.idModalidad}
              required={false}
              flex={true}
              disabled={locked}
              triggerClassName={rqReadonly}
              options={rqMode.map((modalidad) => ({
                value: modalidad.num1,
                label: modalidad.string1,
              }))}
            />
          </Field>
        </div>

      <GroupDivider />

      {/* Modalidades en casillas (hasta 3 por fila) y, debajo, el recuadro
          con la banda de cada una marcada. */}
      <FormGroup className="min-h-0 flex-1 gap-3" title="Modalidad de contrato">
        <Controller
          name="idModalidadFact"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {modes.map((mode) => (
                <CheckOption
                  key={mode.id}
                  // Con banda cargada también cuenta como marcada: nunca se ve
                  // una banda con la casilla vacía.
                  checked={
                    field.value?.includes(mode.id) ||
                    fields.some((f) => f.idModalidad === mode.id)
                  }
                  disabled={locked}
                  onCheckedChange={(checked) => {
                    handleChangeContractMode(mode.id, checked);

                    if (checked) {
                      field.onChange([...(field.value || []), mode.id]);
                    } else {
                      field.onChange(
                        field.value?.filter((v: number) => v !== mode.id),
                      );
                    }
                  }}
                >
                  {mode.label}
                </CheckOption>
              ))}
            </div>
          )}
        />
        {errors.idModalidadFact && (
          <p className="text-[13px] text-red-500 dark:text-red-400">
            {errors.idModalidadFact.message}
          </p>
        )}

        <BandPanel
          emptyText={
            isEditing
              ? "Selecciona la modalidad para establecer la banda del RQ"
              : "Este RQ aún no tiene modalidad de contrato."
          }
        >
          {modes.map((mode) => {
            const index = fields.findIndex((f) => f.idModalidad === mode.id);
            return index === -1 ? null : (
              <BandSection key={fields[index].id} title={mode.label}>
                <BillingTable
                  index={index}
                  modalidadId={mode.id}
                  isEditable={isEditing}
                  currencyOptions={currencyOptions}
                />
              </BandSection>
            );
          })}
        </BandPanel>
      </FormGroup>
    </TabBody>
  );
};
