import {
  FieldValues,
  Controller,
  Path,
  ArrayPath,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { DynamicSection } from "..";
import { DynamicSectionProps, Param } from "../../models";

interface SoftSkillsSectionProps<F extends FieldValues>
  extends DynamicSectionProps<F> {
  habilidadesBlandas: Param[];
  dropdownWithSearch: boolean;
}

export function SoftSkillsSection<F extends FieldValues>({
  control,
  errors,
  habilidadesBlandas,
  dropdownWithSearch,
  shouldShowEmptyForm = true,
  shouldAddElements = true,
}: SoftSkillsSectionProps<F>) {
  const { setValue } = useFormContext<F>();
  const { fields, append, remove } = useFieldArray<F, ArrayPath<F>>({
    control,
    name: "habilidadesBlandas" as ArrayPath<F>,
  });

  const [showSuggestions, setShowSuggestions] = useState<boolean[]>(
    fields.map(() => false),
  );

  const hasAppendedInitial = useRef(false);

  useEffect(() => {
    setShowSuggestions(fields.map(() => false));
  }, [fields.length, fields]);

  useEffect(() => {
    if (
      shouldShowEmptyForm &&
      fields.length === 0 &&
      !hasAppendedInitial.current
    ) {
      append({
        idHabilidad: 0,
        habilidad: "",
      } as any);
      hasAppendedInitial.current = true;
    }
  }, [shouldShowEmptyForm, fields.length, append]);

  // Función para actualizar idHabilidad automáticamente basado en el texto
  const updateIdHabilidadFromText = (text: string, index: number) => {
    const habilidadExistente = habilidadesBlandas.find(
      (h) => h.string1.toLowerCase() === text.toLowerCase(),
    );

    const idHabilidadPath =
      `habilidadesBlandas.${index}.idHabilidad` as Path<F>;

    if (habilidadExistente) {
      setValue(idHabilidadPath, habilidadExistente.num1 as any);
    } else {
      setValue(idHabilidadPath, 0 as any);
    }
  };

  return (
    <DynamicSection
      title="Habilidades blandas"
      onAdd={() => append({ idHabilidad: 0, habilidad: "" } as any)}
      onRemove={(index) => remove(index)}
      canRemoveFirst={!shouldShowEmptyForm}
      canAddSections={shouldAddElements}
    >
      {fields.map((field, index) => (
        <div className="flex flex-col my-2 relative" key={field.id}>
          <label
            htmlFor={`habilidadesBlandas.${index}.habilidad`}
            className="text-[#71717A] text-sm px-1"
          >
            Habilidad blanda<span className="text-red-400">*</span>
          </label>

          {dropdownWithSearch ? (
            <Controller
              name={`habilidadesBlandas.${index}.habilidad` as Path<F>}
              control={control}
              render={({ field }) => {
                const searchValue = (field.value as string) ?? "";
                const filteredOptions = habilidadesBlandas.filter((h) =>
                  h.string1.toLowerCase().includes(searchValue.toLowerCase()),
                );

                return (
                  <div className="relative">
                    <input
                      {...field}
                      autoComplete="off"
                      value={searchValue}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        field.onChange(newValue);
                        // Actualizar idHabilidad automáticamente
                        updateIdHabilidadFromText(newValue, index);

                        setShowSuggestions((prev) => {
                          const arr = [...prev];
                          arr[index] = true;
                          return arr;
                        });
                      }}
                      onFocus={() =>
                        setShowSuggestions((prev) => {
                          const arr = [...prev];
                          arr[index] = true;
                          return arr;
                        })
                      }
                      onBlur={() => {
                        // Asegurar idHabilidad al perder foco
                        updateIdHabilidadFromText(searchValue, index);

                        setTimeout(() => {
                          setShowSuggestions((prev) => {
                            const arr = [...prev];
                            arr[index] = false;
                            return arr;
                          });
                        }, 150);
                      }}
                      placeholder="Escribe para buscar..."
                      className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] w-full"
                      aria-expanded={showSuggestions[index]}
                    />

                    {showSuggestions[index] && searchValue && (
                      <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto z-20">
                        {filteredOptions.map((habilidad) => (
                          <li
                            key={habilidad.idParametro}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              field.onChange(habilidad.string1);
                              const idHabilidadPath =
                                `habilidadesBlandas.${index}.idHabilidad` as Path<F>;
                              setValue(idHabilidadPath, habilidad.num1 as any);

                              setShowSuggestions((prev) => {
                                const arr = [...prev];
                                arr[index] = false;
                                return arr;
                              });
                            }}
                          >
                            {habilidad.string1}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              }}
            />
          ) : (
            <Controller
              name={`habilidadesBlandas.${index}.idHabilidad` as Path<F>}
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  value={field.value ?? 0}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    field.onChange(newValue);

                    // También actualizar el campo habilidad con el texto seleccionado
                    const selectedHabilidad = habilidadesBlandas.find(
                      (h) => h.num1 === newValue,
                    );
                    if (selectedHabilidad) {
                      const habilidadPath =
                        `habilidadesBlandas.${index}.habilidad` as Path<F>;
                      setValue(habilidadPath, selectedHabilidad.string1 as any);
                    }
                  }}
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] w-full"
                >
                  <option value={0}>Seleccione una habilidad</option>
                  {habilidadesBlandas.map((habilidad) => (
                    <option key={habilidad.idParametro} value={habilidad.num1}>
                      {habilidad.string1}
                    </option>
                  ))}
                </select>
              )}
            />
          )}

          {(errors as any).habilidadesBlandas?.[index]?.idHabilidad && (
            <p className="text-red-400 text-sm">
              {(errors as any).habilidadesBlandas[index]?.idHabilidad?.message}
            </p>
          )}
          {(errors as any).habilidadesBlandas?.[index]?.habilidad && (
            <p className="text-red-400 text-sm">
              {(errors as any).habilidadesBlandas[index]?.habilidad?.message}
            </p>
          )}
        </div>
      ))}
    </DynamicSection>
  );
}
