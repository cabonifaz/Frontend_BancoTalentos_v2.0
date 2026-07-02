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
  useWatch,
} from "react-hook-form";
import { enqueueSnackbar } from "notistack";
import { sumarizeFunctions } from "../../services/ai.service";
import { useAsyncService } from "../../hooks/useAsyncService";
import { ModalWorkingAI } from "../modals/ModalWorkingAI";

interface ExperiencesSectionProps<
  F extends FieldValues,
> extends DynamicSectionProps<F> {
  empresaValue?: string;
}

export const ExperiencesSection = <F extends FieldValues>({
  control,
  errors,
  shouldShowEmptyForm = true,
  shouldAddElements = true,
  empresaValue,
}: ExperiencesSectionProps<F>) => {
  const { setValue, getValues, clearErrors, watch, trigger } =
    useFormContext<F>();
  const { fields, append, remove } = useFieldArray<F, ArrayPath<F>>({
    control,
    name: "experiencias" as ArrayPath<F>,
  });

  /**
   *  Call to API to API to summarize funciones using AI
   */

  const {
    result,
    loading: summarizing,
    execute,
  } = useAsyncService(sumarizeFunctions);

  const watchedFechasInicio = useWatch({
    control,
    name: "experiencias" as any,
  });

  // UI-only: para bloquear el campo "empresa" si se marca "Aquí en Fractal"
  const [defaultCompanies, setDefaultCompanies] = useState<
    Record<number, boolean>
  >({});
  const [currentDates, setCurrentDates] = useState<
    Record<number, boolean>
  >({});

  const hasAppendedInitial = useRef(false);

  useEffect(() => {
    if (empresaValue && typeof empresaValue === "string") {
      const isFractal =
        empresaValue.trim().toLowerCase() === "fractal";
      setDefaultCompanies((prev) => ({ ...prev, 0: isFractal }));
    } else {
      // Cuando no hay empresaValue o está vacío, desmarcar el checkbox
      setDefaultCompanies((prev) => ({ ...prev, 0: false }));
    }
  }, [empresaValue]);

  const handleCurrentCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    onChange: (value: any) => void,
  ) => {
    const isChecked = e.target.checked;
    setDefaultCompanies((prev) => ({ ...prev, [index]: isChecked }));

    // Actualizar el valor del campo empresa
    if (isChecked) {
      onChange("Fractal");
    } else {
      onChange("");
    }
  };

  useEffect(() => {
    if (
      shouldShowEmptyForm &&
      fields.length === 0 &&
      !hasAppendedInitial.current
    ) {
      append({
        empresa: "",
        puesto: "",
        fechaInicio: "",
        fechaFin: "",
        flActualidad: false,
        funciones: "",
      } as any);
      hasAppendedInitial.current = true;
    }
  }, [shouldShowEmptyForm, fields.length, append]);

  useEffect(() => {
    // Validar todas las fechas de fin cuando cambia alguna fecha de inicio
    fields.forEach((_, index) => {
      if (getValues(`experiencias.${index}.fechaFin` as Path<F>)) {
        trigger(`experiencias.${index}.fechaFin` as Path<F>);
      }
    });
  }, [watchedFechasInicio, trigger, fields, getValues]);

  /**
   * Handle sumarization of funciones using AI
   */
  const [resumenInstructions, setResumenInstructions] = useState<
    Record<number, string>
  >({});

  const handleSummarize = async (index: number) => {
    const currentFunciones = watch(
      `experiencias.${index}.funciones` as Path<F>,
    );
    const instrucciones = resumenInstructions[index] || "";

    if (!currentFunciones) {
      enqueueSnackbar({
        message: "La descripción de funciones es requerida",
        variant: "error",
      });
      return;
    }

    // Call to API for summary
    const { result } = await execute(currentFunciones, instrucciones);

    if (result?.idMensaje != 2) {
      enqueueSnackbar({
        message: result?.mensaje || "Error al resumir las funciones",
        variant: "error",
      });
      return;
    }

    setValue(
      `experiencias.${index}.funciones` as Path<F>,
      (result?.data?.summary || "") as any,
    );
  };

  return (
    <>
      {summarizing && (
        <ModalWorkingAI
          randomPhrases={[]}
          title="Resumiendo las funciones laborales"
          subtitle="Esto no tardará mucho"
        />
      )}
      <DynamicSection
        title="Experiencias laborales"
        onAdd={() =>
          append({
            empresa: "",
            puesto: "",
            fechaInicio: "",
            fechaFin: "",
            flActualidad: false,
            funciones: "",
          } as any)
        }
        onRemove={remove}
        canRemoveFirst={!shouldShowEmptyForm}
        canAddSections={shouldAddElements}
      >
      {fields.map((field, index) => {
        // Determinar si es Fractal basado en el valor actual del campo empresa
        const currentEmpresa = watch(
          `experiencias.${index}.empresa` as Path<F>,
        );
        const isFractal =
          typeof currentEmpresa === "string" &&
          currentEmpresa.trim().toLowerCase() === "fractal";

        // Si es Fractal, asegurarse de que el checkbox esté marcado
        if (isFractal && !defaultCompanies[index]) {
          setDefaultCompanies((prev) => ({ ...prev, [index]: true }));
        }

        return (
          <div key={field.id}>
            {/* Empresa */}
            <div className="flex flex-col my-2">
              <label
                htmlFor={`experiencias.${index}.empresa`}
                className="text-[#71717A] text-sm px-1"
              >
                Empresa<span className="text-red-400">*</span>
              </label>

              <Controller
                name={`experiencias.${index}.empresa` as Path<F>}
                control={control}
                render={({
                  field: { value, onChange, ...fieldProps },
                }) => (
                  <input
                    {...fieldProps}
                    value={value || ""}
                    disabled={defaultCompanies[index]}
                    id={`experiencias.${index}.empresa`}
                    type="text"
                    onChange={onChange}
                    placeholder="Nombre de la empresa"
                    autoComplete="organization"
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-600"
                  />
                )}
              />

              {(errors as any).experiencias?.[index]?.empresa && (
                <p className="text-red-400 text-sm">
                  {
                    (errors as any).experiencias[index]?.empresa
                      ?.message
                  }
                </p>
              )}

              {/* Checkbox auxiliar NO registrado (solo UI) */}
              <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                <Controller
                  name={`experiencias.${index}.empresa` as Path<F>}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <input
                      type="checkbox"
                      id={`currentCompany-${index}`}
                      checked={isFractal || defaultCompanies[index]}
                      onChange={(e) => {
                        handleCurrentCompanyChange(
                          e,
                          index,
                          onChange,
                        );
                      }}
                      className="accent-[#4F46E5] h-4 w-4 cursor-pointer"
                    />
                  )}
                />
                <label
                  htmlFor={`currentCompany-${index}`}
                  className="cursor-pointer text-[#3f3f46] text-sm"
                >
                  Aquí en Fractal
                </label>
              </div>
            </div>

            {/* Puesto */}
            <div className="flex flex-col my-2">
              <label
                htmlFor={`experiencias.${index}.puesto`}
                className="text-[#71717A] text-sm px-1"
              >
                Puesto<span className="text-red-400">*</span>
              </label>
              <Controller
                name={`experiencias.${index}.puesto` as Path<F>}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    id={`experiencias.${index}.puesto`}
                    type="text"
                    placeholder="Puesto"
                    autoComplete="organization-title"
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                  />
                )}
              />
              {(errors as any).experiencias?.[index]?.puesto && (
                <p className="text-red-400 text-sm">
                  {
                    (errors as any).experiencias[index]?.puesto
                      ?.message
                  }
                </p>
              )}
            </div>

            {/* Funciones */}
            <div className="flex flex-col my-2">
              <label
                htmlFor={`experiencias.${index}.funciones`}
                className="text-[#71717A] text-sm px-1"
              >
                Funciones
              </label>
              <Controller
                name={`experiencias.${index}.funciones` as Path<F>}
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id={`experiencias.${index}.funciones`}
                    placeholder="Funciones"
                    autoComplete="organization-title"
                    rows={5}
                    className="h-24 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] resize-y"
                  />
                )}
              />

              {/* --- BLOQUE DE RESUMEN CON IA --- */}
              <div className="mt-2 flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Instrucciones para resumir (ej: 'en 3 puntos clave', 'tono formal'...)"
                    className="flex-1 h-9 px-3 text-sm border-gray-300 border rounded-md focus:outline-none focus:border-[#4F46E5]"
                    value={resumenInstructions[index] || ""}
                    onChange={(e) =>
                      setResumenInstructions((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleSummarize(index)}
                    className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    {/* Puedes poner un icono de estrellitas o magia aquí */}
                    <span>Resumir</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 px-1">
                  Utiliza IA para optimizar la descripción de las
                  funciones
                </p>
              </div>

              {(errors as any).experiencias?.[index]?.funciones && (
                <p className="text-red-400 text-sm">
                  {
                    (errors as any).experiencias[index]?.funciones
                      ?.message
                  }
                </p>
              )}
            </div>

            {/* Fechas */}
            <div className="flex gap-4">
              <div className="flex flex-col w-1/2">
                <label
                  htmlFor={`experiencias.${index}.fechaInicio`}
                  className="text-[#71717A] text-sm px-1"
                >
                  Mes y año de inicio
                  <span className="text-red-400">*</span>
                </label>
                <Controller
                  name={
                    `experiencias.${index}.fechaInicio` as Path<F>
                  }
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      id={`experiencias.${index}.fechaInicio`}
                      autoComplete="bday"
                      className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                    />
                  )}
                />
                {(errors as any).experiencias?.[index]
                  ?.fechaInicio && (
                  <p className="text-red-400 text-sm">
                    {
                      (errors as any).experiencias[index]?.fechaInicio
                        ?.message
                    }
                  </p>
                )}

                <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                  <Controller
                    name={
                      `experiencias.${index}.flActualidad` as Path<F>
                    }
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="checkbox"
                        id={`experiencias.${index}.flActualidad`}
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
                              `experiencias.${index}.fechaFin` as Path<F>,
                              "" as any,
                              {
                                shouldValidate: true,
                              },
                            );

                            // Limpiar los errores de fechaFin
                            clearErrors(
                              `experiencias.${index}.fechaFin` as Path<F>,
                            );
                          }
                        }}
                      />
                    )}
                  />
                  <label
                    htmlFor={`experiencias.${index}.flActualidad`}
                    className="cursor-pointer text-[#3f3f46] text-sm"
                  >
                    Hasta la actualidad
                  </label>
                </div>
              </div>

              <div className="flex flex-col w-1/2">
                <label
                  htmlFor={`experiencias.${index}.fechaFin`}
                  className="text-[#71717A] text-sm px-1"
                >
                  Mes y año de fin
                </label>
                <Controller
                  name={`experiencias.${index}.fechaFin` as Path<F>}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      id={`experiencias.${index}.fechaFin`}
                      disabled={getValues(
                        `experiencias.${index}.flActualidad` as Path<F>,
                      )}
                      className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] disabled:text-gray-400"
                    />
                  )}
                />
                {(errors as any).experiencias?.[index]?.fechaFin && (
                  <p className="text-red-400 text-sm">
                    {
                      (errors as any).experiencias[index]?.fechaFin
                        ?.message
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </DynamicSection>
    </>
  );
};
