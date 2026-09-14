import { useRef, useState } from "react";
import { DynamicSectionProps } from "@/core/models";
import { DynamicSection } from "./DynamicSection";
import { YearPicker } from "@/core/components/ui/YearPicker";
import { MonthYearPicker } from "@/core/components/ui/MonthYearPicker";
import {
  FieldValues,
  Path,
  Controller,
  useFieldArray,
  ArrayPath,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { useParams } from "@/core/context/ParamsContext";
import { Input } from "@/core/components/ui/shadcn/input";
import { Checkbox } from "@/core/components/ui/shadcn/checkbox";
import { Switch } from "@/core/components/ui/shadcn/switch";
import { AppSelect } from "@/core/components/ui/AppSelect";

interface EducationsSectionProps<F extends FieldValues>
  extends DynamicSectionProps<F> {}

const fieldClass = "h-12 border-gray-300 dark:border-slate-600";
const checkboxClass =
  "h-4 w-4 data-[state=checked]:border-[#4F46E5] data-[state=checked]:bg-[#4F46E5]";

export const EducationsSection = <F extends FieldValues>({
  control,
  errors,
  shouldShowEmptyForm = true,
  shouldAddElements = true,
  itemVariant = "plain",
}: EducationsSectionProps<F>) => {
  const { setValue, getValues, clearErrors } = useFormContext<F>();
  const { fields, append, remove } = useFieldArray<F, ArrayPath<F>>({
    control,
    name: "educaciones" as ArrayPath<F>,
  });

  const [shouldShowEmptyFormRef] = useState(shouldShowEmptyForm);
  const hasAppendedInitial = useRef(false);

  const { paramsByMaestro } = useParams();
  const grados = paramsByMaestro[38] || [];

  const watchedEducaciones = useWatch({
    control,
    name: "educaciones" as any,
  }) as Array<{ tipoFechaEducaciones?: number }> | undefined;

  if (
    shouldShowEmptyFormRef &&
    fields.length === 0 &&
    !hasAppendedInitial.current
  ) {
    hasAppendedInitial.current = true;
    append({
      institucion: "",
      carrera: "",
      grado: "",
      fechaInicio: "",
      fechaFin: "",
      flActualidad: false,
      tipoFechaEducaciones: 1,
    } as any);
  }

  const clearEntryDates = (index: number) => {
    setValue(`educaciones.${index}.fechaInicio` as Path<F>, "" as any, { shouldValidate: false });
    setValue(`educaciones.${index}.fechaFin` as Path<F>, "" as any, { shouldValidate: false });
    clearErrors(`educaciones.${index}.fechaInicio` as Path<F>);
    clearErrors(`educaciones.${index}.fechaFin` as Path<F>);
  };

  return (
    <DynamicSection
      title="Experiencias educativas"
      onAdd={() =>
        append({
          institucion: "",
          carrera: "",
          grado: "",
          fechaInicio: "",
          fechaFin: "",
          flActualidad: false,
          tipoFechaEducaciones: 1,
        } as any)
      }
      onRemove={remove}
      canRemoveFirst={!shouldShowEmptyForm}
      canAddSections={shouldAddElements}
      itemVariant={itemVariant}
    >
      {fields.map((field, index) => {
        const isMonthYearMode =
          (watchedEducaciones?.[index]?.tipoFechaEducaciones ?? 1) === 2;

        return (
          <div key={field.id}>
            {/* Institución */}
            <div className="flex flex-col my-2">
              <label
                htmlFor={`educaciones.${index}.institucion`}
                className="text-[#71717A] text-sm px-1 dark:text-slate-400"
              >
                Institución<span className="text-red-400">*</span>
              </label>
              <Controller
                name={`educaciones.${index}.institucion` as Path<F>}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id={`educaciones.${index}.institucion`}
                    type="text"
                    placeholder="Nombre de la institución"
                    autoComplete="organization"
                    className={fieldClass}
                  />
                )}
              />
              {(errors as any).educaciones?.[index]?.institucion && (
                <p className="text-red-400 text-sm">
                  {(errors as any).educaciones[index]?.institucion?.message}
                </p>
              )}
            </div>

            {/* Carrera */}
            <div className="flex flex-col my-2">
              <label
                htmlFor={`educaciones.${index}.carrera`}
                className="text-[#71717A] text-sm px-1 dark:text-slate-400"
              >
                Carrera / Curso / Diplomado
                <span className="text-red-400">*</span>
              </label>
              <Controller
                name={`educaciones.${index}.carrera` as Path<F>}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id={`educaciones.${index}.carrera`}
                    type="text"
                    placeholder="Carrera"
                    autoComplete="on"
                    className={fieldClass}
                  />
                )}
              />
              {(errors as any).educaciones?.[index]?.carrera && (
                <p className="text-red-400 text-sm">
                  {(errors as any).educaciones[index]?.carrera?.message}
                </p>
              )}
            </div>

            {/* Grado */}
            <div className="flex flex-col my-2">
              <label
                htmlFor={`educaciones.${index}.grado`}
                className="text-[#71717A] text-sm px-1 dark:text-slate-400"
              >
                Grado<span className="text-red-400">*</span>
              </label>
              <Controller
                name={`educaciones.${index}.grado` as Path<F>}
                control={control}
                render={({ field }) => (
                  // El grado se guarda como string (valor del <select> anterior).
                  <AppSelect
                    ref={field.ref}
                    id={`educaciones.${index}.grado`}
                    name={field.name}
                    onBlur={field.onBlur}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={grados.map((gr) => ({
                      value: gr.num1,
                      label: gr.string1,
                    }))}
                    placeholder="Selecciona un grado"
                    className={`${fieldClass} p-3`}
                  />
                )}
              />
              {(errors as any).educaciones?.[index]?.grado && (
                <p className="text-red-400 text-sm">
                  {(errors as any).educaciones[index]?.grado?.message}
                </p>
              )}
            </div>

            {/* Date mode toggle */}
            <div className="flex items-center justify-end gap-2 mb-2">
              <span className="text-xs text-[#636d7c] dark:text-slate-400">Mes + Año</span>
              <Controller
                name={`educaciones.${index}.tipoFechaEducaciones` as Path<F>}
                control={control}
                render={({ field }) => {
                  const checked = Number(field.value ?? 1) === 2;
                  return (
                    // Switch de shadcn en lugar del botón role="switch" pintado
                    // a mano; mismo tamaño (36×20) y color.
                    <Switch
                      aria-label="Fechas con mes y año"
                      checked={checked}
                      onCheckedChange={(next) => {
                        field.onChange(next ? 2 : 1);
                        clearEntryDates(index);
                      }}
                      className="h-5 w-9 border-0 focus-visible:ring-[#4F46E5] data-[state=checked]:bg-[#4F46E5]"
                      thumbClassName="h-3.5 w-3.5 shadow data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-1"
                    />
                  );
                }}
              />
            </div>

            {/* Fechas */}
            <div className="flex gap-4">
              <div className="flex flex-col w-1/2">
                <label
                  htmlFor={`educaciones.${index}.fechaInicio`}
                  className="text-[#71717A] text-sm px-1 dark:text-slate-400"
                >
                  {isMonthYearMode ? "Mes/Año de inicio" : "Año de inicio"}
                  <span className="text-red-400">*</span>
                </label>
                <Controller
                  name={`educaciones.${index}.fechaInicio` as Path<F>}
                  control={control}
                  render={({ field }) =>
                    isMonthYearMode ? (
                      <MonthYearPicker
                        value={field.value}
                        onChange={field.onChange}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    ) : (
                      <YearPicker
                        value={field.value}
                        onChange={field.onChange}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    )
                  }
                />
                {(errors as any).educaciones?.[index]?.fechaInicio && (
                  <p className="text-red-400 text-sm">
                    {(errors as any).educaciones[index]?.fechaInicio?.message}
                  </p>
                )}

                {/* Checkbox Hasta la actualidad */}
                <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                  <Controller
                    name={`educaciones.${index}.flActualidad` as Path<F>}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        ref={field.ref}
                        id={`educaciones.${index}.flActualidad`}
                        className={checkboxClass}
                        checked={!!field.value}
                        onBlur={field.onBlur}
                        onCheckedChange={(value) => {
                          const checked = value === true;
                          field.onChange(checked);
                          if (checked) {
                            setValue(
                              `educaciones.${index}.fechaFin` as Path<F>,
                              "" as any,
                              { shouldValidate: true },
                            );
                            clearErrors(
                              `educaciones.${index}.fechaFin` as Path<F>,
                            );
                          }
                        }}
                      />
                    )}
                  />
                  <label
                    htmlFor={`educaciones.${index}.flActualidad`}
                    className="cursor-pointer text-[#3f3f46] text-sm dark:text-slate-200"
                  >
                    Hasta la actualidad
                  </label>
                </div>
              </div>

              <div className="flex flex-col w-1/2">
                <label
                  htmlFor={`educaciones.${index}.fechaFin`}
                  className="text-[#71717A] text-sm px-1 dark:text-slate-400"
                >
                  {isMonthYearMode ? "Mes/Año de fin" : "Año de fin"}
                </label>
                <Controller
                  name={`educaciones.${index}.fechaFin` as Path<F>}
                  control={control}
                  render={({ field }) =>
                    isMonthYearMode ? (
                      <MonthYearPicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={getValues(
                          `educaciones.${index}.flActualidad` as Path<F>,
                        )}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    ) : (
                      <YearPicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={getValues(
                          `educaciones.${index}.flActualidad` as Path<F>,
                        )}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    )
                  }
                />
                {(errors as any).educaciones?.[index]?.fechaFin && (
                  <p className="text-red-400 text-sm">
                    {(errors as any).educaciones[index]?.fechaFin?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </DynamicSection>
  );
};
