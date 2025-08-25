import {
  FieldValues,
  Controller,
  Path,
  ArrayPath,
  useFieldArray,
} from "react-hook-form";
import { DynamicSection } from "..";
import { DynamicSectionProps, Param } from "../../models";
import { useState, useEffect, useRef } from "react";

interface TechSkillsSectionProps<F extends FieldValues>
  extends DynamicSectionProps<F> {
  habilidadesTecnicas: Param[];
  dropdownWithSearch: boolean;
}

export const TechSkillsSection = <F extends FieldValues>({
  control,
  errors,
  habilidadesTecnicas,
  dropdownWithSearch,
  shouldShowEmptyForm = true,
}: TechSkillsSectionProps<F>) => {
  const { fields, append, remove } = useFieldArray<F, ArrayPath<F>>({
    control,
    name: "habilidadesTecnicas" as ArrayPath<F>,
  });

  const [showSuggestions, setShowSuggestions] = useState<boolean[]>(
    fields.map(() => false),
  );

  const hasAppendedInitial = useRef(false);

  useEffect(() => {
    setShowSuggestions(fields.map(() => false));
  }, [fields.length, fields]);

  const handleYearsSanitize = (value: string): number => {
    const sanitized = value.replace(/\D/g, "");
    return sanitized === "" ? 0 : Number(sanitized);
  };

  useEffect(() => {
    if (
      shouldShowEmptyForm &&
      fields.length === 0 &&
      !hasAppendedInitial.current
    ) {
      append({
        idHabilidad: 0,
        anios: 0,
        habilidad: "",
      } as any);
      hasAppendedInitial.current = true;
    }
  }, [shouldShowEmptyForm, fields.length, append]);

  return (
    <DynamicSection
      title="Habilidades técnicas"
      onAdd={() => append({ idHabilidad: 0, habilidad: "", anios: 0 } as any)}
      onRemove={(index) => remove(index)}
      canRemoveFirst={!shouldShowEmptyForm}
    >
      {fields.map((field, index) => (
        <div key={field.id}>
          {/* Skill */}
          <div className="flex flex-col my-2 relative">
            <label
              htmlFor={`habilidadesTecnicas.${index}.habilidad`}
              className="text-[#71717A] text-sm px-1"
            >
              Habilidad técnica<span className="text-red-400">*</span>
            </label>

            {dropdownWithSearch ? (
              <Controller
                name={`habilidadesTecnicas.${index}.habilidad` as Path<F>}
                control={control}
                render={({ field }) => {
                  const searchValue = (field.value as string) ?? "";
                  const filteredOptions = habilidadesTecnicas.filter((h) =>
                    h.string1.toLowerCase().includes(searchValue.toLowerCase()),
                  );
                  const existsExact = habilidadesTecnicas.some(
                    (h) =>
                      h.string1.toLowerCase() === searchValue.toLowerCase(),
                  );

                  return (
                    <div className="relative">
                      <input
                        {...field}
                        id={`habilidadesTecnicas.${index}.habilidad`}
                        name={field.name}
                        type="text"
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
                                  // set nombre visible y id seleccionado
                                  field.onChange(habilidad.string1);
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
                                // agregar nueva: id = 0, nombre = searchValue
                                field.onChange(searchValue);
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
                name={`habilidadesTecnicas.${index}.idHabilidad` as Path<F>}
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    id={`habilidadesTecnicas.${index}.idHabilidad`}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                  >
                    <option value={0}>Seleccione una habilidad</option>
                    {habilidadesTecnicas.map((habilidad) => (
                      <option
                        key={habilidad.idParametro}
                        value={habilidad.num1}
                      >
                        {habilidad.string1}
                      </option>
                    ))}
                  </select>
                )}
              />
            )}

            {(errors as any).habilidadesTecnicas?.[index]?.idHabilidad && (
              <p className="text-red-400 text-sm">
                {
                  (errors as any).habilidadesTecnicas[index]?.idHabilidad
                    ?.message
                }
              </p>
            )}

            {(errors as any).habilidadesTecnicas?.[index]?.habilidad && (
              <p className="text-red-400 text-sm">
                {(errors as any).habilidadesTecnicas[index]?.habilidad?.message}
              </p>
            )}
          </div>

          {/* Años */}
          <div className="flex flex-col my-2">
            <label
              htmlFor={`habilidadesTecnicas.${index}.anios`}
              className="text-[#71717A] text-sm px-1"
            >
              Años de experiencia<span className="text-red-400">*</span>
            </label>
            <Controller
              name={`habilidadesTecnicas.${index}.anios` as Path<F>}
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id={`habilidadesTecnicas.${index}.anios`}
                  type="text"
                  inputMode="numeric"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(handleYearsSanitize(e.target.value))
                  }
                  onFocus={(e) => e.target.select()}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Nro. años"
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                />
              )}
            />
            {(errors as any).habilidadesTecnicas?.[index]?.anios && (
              <p className="text-red-400 text-sm">
                {(errors as any).habilidadesTecnicas[index]?.anios?.message}
              </p>
            )}
          </div>
        </div>
      ))}
    </DynamicSection>
  );
};
