import { useRef, useState } from "react";
import { DynamicSectionProps } from "../../../models";
import { DynamicSection } from "./DynamicSection";
import { YearPicker } from "../../ui/YearPicker";
import { MonthYearPicker } from "../../ui/MonthYearPicker";
import {
  FieldValues,
  Path,
  Controller,
  useFieldArray,
  ArrayPath,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { useParams } from "../../../context/ParamsContext";

interface EducationsSectionProps<F extends FieldValues>
  extends DynamicSectionProps<F> {}

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
                  <input
                    {...field}
                    id={`educaciones.${index}.institucion`}
                    type="text"
                    placeholder="Nombre de la institución"
                    autoComplete="organization"
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] dark:border-slate-600"
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
                  <input
                    {...field}
                    id={`educaciones.${index}.carrera`}
                    type="text"
                    placeholder="Carrera"
                    autoComplete="on"
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] dark:border-slate-600"
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
                  <select
                    {...field}
                    id={`educaciones.${index}.grado`}
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] dark:border-slate-600"
                  >
                    <option value="">Selecciona un grado</option>
                    {grados?.map((gr) => (
                      <option key={gr.num1} value={gr.num1}>
                        {gr.string1}
                      </option>
                    ))}
                  </select>
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
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      onClick={() => {
                        field.onChange(checked ? 1 : 2);
                        clearEntryDates(index);
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-1 ${
                        checked ? "bg-[#4F46E5]" : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform dark:bg-slate-800 ${
                          checked ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
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
                      <input
                        {...field}
                        type="checkbox"
                        id={`educaciones.${index}.flActualidad`}
                        className="accent-[#4F46E5] h-4 w-4 cursor-pointer"
                        checked={!!field.value}
                        onChange={(e) => {
                          const checked = e.target.checked;
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
