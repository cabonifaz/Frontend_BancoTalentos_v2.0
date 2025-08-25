import {
  FieldValues,
  Controller,
  Path,
  ArrayPath,
  useFieldArray,
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
}: SoftSkillsSectionProps<F>) {
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

  return (
    <DynamicSection
      title="Habilidades blandas"
      onAdd={() => append({ idHabilidad: 0, habilidad: "" } as any)}
      onRemove={(index) => remove(index)}
      canRemoveFirst={!shouldShowEmptyForm}
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
                const existsExact = habilidadesBlandas.some(
                  (h) => h.string1.toLowerCase() === searchValue.toLowerCase(),
                );

                return (
                  <div className="relative">
                    <input
                      {...field}
                      autoComplete="off"
                      value={searchValue}
                      onChange={(e) => {
                        field.onChange(e.target.value);
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
                      onBlur={() =>
                        setTimeout(() => {
                          setShowSuggestions((prev) => {
                            const arr = [...prev];
                            arr[index] = false;
                            return arr;
                          });
                        }, 150)
                      }
                      placeholder="Escribe para buscar..."
                      className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] w-full"
                      aria-expanded={showSuggestions[index]}
                    />

                    {showSuggestions[index] && searchValue && (
                      <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto z-20">
                        {filteredOptions.length > 0 &&
                          filteredOptions.map((habilidad) => (
                            <li
                              key={habilidad.idParametro}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                field.onChange(habilidad.string1);
                                // Cerrar las sugerencias al seleccionar
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

                        {!existsExact && (
                          <li
                            className="p-2 hover:bg-gray-100 cursor-pointer text-blue-600"
                            onClick={() => {
                              field.onChange(searchValue);
                              // Cerrar sugerencias al agregar nueva
                              setShowSuggestions((prev) => {
                                const arr = [...prev];
                                arr[index] = false;
                                return arr;
                              });
                            }}
                          >
                            ➕ Agregar "{searchValue}"
                          </li>
                        )}
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
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
