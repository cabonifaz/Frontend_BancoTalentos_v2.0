import {
  FieldValues,
  Controller,
  Path,
  ArrayPath,
  useFieldArray,
  useFormContext,
} from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { DynamicSection } from "@/core/components";
import { DynamicSectionProps, Param } from "@/core/models";
import { Input } from "@/core/components/ui/shadcn/input";
import { AppSelect } from "@/core/components/ui/AppSelect";

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
  itemVariant = "plain",
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
      itemVariant={itemVariant}
    >
      {fields.map((field, index) => (
        <div className="flex flex-col my-2 relative" key={field.id}>
          <label
            htmlFor={`habilidadesBlandas.${index}.habilidad`}
            className="text-[#71717A] text-sm px-1 dark:text-slate-400"
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
                    <Input
                      {...field}
                      id={`habilidadesBlandas.${index}.habilidad`}
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
                      role="combobox"
                      placeholder="Escribe para buscar..."
                      className="h-12 border-gray-300 dark:border-slate-600"
                      aria-expanded={showSuggestions[index]}
                    />

                    {showSuggestions[index] && searchValue && (
                      <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto z-20 dark:bg-slate-800 dark:border-slate-600">
                        {filteredOptions.map((habilidad) => (
                          <li
                            key={habilidad.idParametro}
                            className="p-2 hover:bg-gray-100 cursor-pointer dark:hover:bg-slate-700"
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
                <AppSelect
                  ref={field.ref}
                  id={`habilidadesBlandas.${index}.habilidad`}
                  name={field.name}
                  onBlur={field.onBlur}
                  value={field.value ?? 0}
                  onChange={(v) => {
                    const newValue = v === "" ? 0 : Number(v);
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
                  options={habilidadesBlandas.map((habilidad) => ({
                    value: habilidad.num1,
                    label: habilidad.string1,
                  }))}
                  placeholder="Seleccione una habilidad"
                  className="h-12 border-gray-300 p-3 dark:border-slate-600"
                />
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
