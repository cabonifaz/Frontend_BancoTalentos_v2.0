import { useEffect, useRef, useState } from "react";
import { DynamicSectionProps } from "../../models";
import { DynamicSection } from "./DynamicSection";
import {
  FieldValues,
  Path,
  Controller,
  useFieldArray,
  ArrayPath,
  useFormContext,
} from "react-hook-form";

interface EducationsSectionProps<F extends FieldValues>
  extends DynamicSectionProps<F> {}

export const EducationsSection = <F extends FieldValues>({
  control,
  errors,
  shouldShowEmptyForm = true,
  shouldAddElements = true,
}: EducationsSectionProps<F>) => {
  const { setValue, getValues, clearErrors } = useFormContext<F>();
  const { fields, append, remove } = useFieldArray<F, ArrayPath<F>>({
    control,
    name: "educaciones" as ArrayPath<F>,
  });

  const [currentDates, setCurrentDates] = useState<Record<number, boolean>>({});
  const hasAppendedInitial = useRef(false);

  useEffect(() => {
    if (
      shouldShowEmptyForm &&
      fields.length === 0 &&
      !hasAppendedInitial.current
    ) {
      append({
        institucion: "",
        carrera: "",
        grado: "",
        fechaInicio: "",
        fechaFin: "",
        flActualidad: false,
      } as any);
      hasAppendedInitial.current = true;
    }
  }, [shouldShowEmptyForm, fields.length, append]);

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
        } as any)
      }
      onRemove={remove}
      canRemoveFirst={!shouldShowEmptyForm}
      canAddSections={shouldAddElements}
    >
      {fields.map((field, index) => (
        <div key={field.id}>
          {/* Institución */}
          <div className="flex flex-col my-2">
            <label
              htmlFor={`educaciones.${index}.institucion`}
              className="text-[#71717A] text-sm px-1"
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
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
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
              className="text-[#71717A] text-sm px-1"
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
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
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
              className="text-[#71717A] text-sm px-1"
            >
              Grado<span className="text-red-400">*</span>
            </label>
            <Controller
              name={`educaciones.${index}.grado` as Path<F>}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id={`educaciones.${index}.grado`}
                  type="text"
                  placeholder="Grado"
                  autoComplete="on"
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                />
              )}
            />
            {(errors as any).educaciones?.[index]?.grado && (
              <p className="text-red-400 text-sm">
                {(errors as any).educaciones[index]?.grado?.message}
              </p>
            )}
          </div>

          {/* Fechas */}
          <div className="flex gap-4">
            <div className="flex flex-col w-1/2">
              <label
                htmlFor={`educaciones.${index}.fechaInicio`}
                className="text-[#71717A] text-sm px-1"
              >
                Mes y año de inicio<span className="text-red-400">*</span>
              </label>
              <Controller
                name={`educaciones.${index}.fechaInicio` as Path<F>}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    id={`educaciones.${index}.fechaInicio`}
                    autoComplete="bday"
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                  />
                )}
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
                        setCurrentDates((prev) => ({
                          ...prev,
                          [index]: checked,
                        }));

                        // Limpiar errores de fechaFin cuando se marca "Hasta la actualidad"
                        if (checked) {
                          // Limpiar el valor de fechaFin
                          setValue(
                            `educaciones.${index}.fechaFin` as Path<F>,
                            "" as any,
                            {
                              shouldValidate: true,
                            },
                          );

                          // Limpiar los errores de fechaFin
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
                  className="cursor-pointer text-[#3f3f46] text-sm"
                >
                  Hasta la actualidad
                </label>
              </div>
            </div>

            <div className="flex flex-col w-1/2">
              <label
                htmlFor={`educaciones.${index}.fechaFin`}
                className="text-[#71717A] text-sm px-1"
              >
                Mes y año de fin
              </label>
              <Controller
                name={`educaciones.${index}.fechaFin` as Path<F>}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    id={`educaciones.${index}.fechaFin`}
                    disabled={getValues(
                      `educaciones.${index}.flActualidad` as Path<F>,
                    )}
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] disabled:text-gray-400"
                  />
                )}
              />
              {(errors as any).educaciones?.[index]?.fechaFin && (
                <p className="text-red-400 text-sm">
                  {(errors as any).educaciones[index]?.fechaFin?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </DynamicSection>
  );
};
