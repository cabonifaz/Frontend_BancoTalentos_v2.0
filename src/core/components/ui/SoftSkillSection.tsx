import { FieldValues } from "react-hook-form";
import { DynamicSection } from "..";
import { AddSoftSkill, DynamicSectionProps, Param } from "../../models";
import { ChangeEvent, useState } from "react";

interface SoftSkillsSectionProps<F extends FieldValues>
  extends DynamicSectionProps<F, AddSoftSkill> {
  habilidadesBlandas: Param[];
  handleChange: (
    index: number,
    field: keyof AddSoftSkill,
    value: number | string,
  ) => void;
  dropdownWithSearch: boolean;
}

export function SoftSkillsSection<F extends FieldValues>({
  register,
  errors,
  fields,
  habilidadesBlandas,
  onAdd,
  onRemove,
  handleChange,
  dropdownWithSearch,
}: SoftSkillsSectionProps<F>) {
  const [searchValues, setSearchValues] = useState<string[]>(
    fields.map(() => ""),
  );

  const [showSuggestions, setShowSuggestions] = useState<boolean[]>(
    fields.map(() => false),
  );

  const handleSearchChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    setSearchValues((prev) => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });
    // Al escribir, mostramos sugerencias
    setShowSuggestions((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleSelectSuggestion = (index: number, habilidad: Param) => {
    setSearchValues((prev) => {
      const newValues = [...prev];
      newValues[index] = habilidad.string1;
      return newValues;
    });

    // Le decimos al padre el id seleccionado (el padre debe sincronizar react-hook-form con setValue)
    handleChange(index, "idHabilidad", habilidad.num1);

    // Ocultamos sugerencias
    setShowSuggestions((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  };

  const handleAddNewSkill = (index: number, habilidadNombre: string) => {
    setSearchValues((prev) => {
      const newValues = [...prev];
      newValues[index] = habilidadNombre;
      return newValues;
    });

    // Indicamos que es nueva (id = 0) y enviamos también el nombre
    handleChange(index, "idHabilidad", 0);
    handleChange(index, "habilidad", habilidadNombre);

    // Ocultamos sugerencias
    setShowSuggestions((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  };

  return (
    <DynamicSection
      title="Habilidades blandas"
      onAdd={onAdd}
      onRemove={onRemove}
    >
      {fields.map((skill, index) => {
        const filteredOptions = habilidadesBlandas.filter((h) =>
          h.string1
            .toLowerCase()
            .includes(searchValues[index]?.toLowerCase() || ""),
        );

        const existsExact = habilidadesBlandas.some(
          (h) => h.string1.toLowerCase() === searchValues[index]?.toLowerCase(),
        );

        return (
          <div className="flex flex-col my-2" key={index}>
            <label
              htmlFor={`softSkill-${index}`}
              className="text-[#71717A] text-sm px-1"
            >
              Habilidad blanda<span className="text-red-400">*</span>
            </label>

            {dropdownWithSearch ? (
              <div className="relative">
                <input
                  id={`softSkill-${index}`}
                  type="text"
                  value={searchValues[index]}
                  onChange={(e) => handleSearchChange(e, index)}
                  placeholder="Escribe para buscar..."
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5] w-full"
                />

                {showSuggestions[index] && searchValues[index] && (
                  <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                    {filteredOptions.length > 0 &&
                      filteredOptions.map((habilidad) => (
                        <li
                          key={habilidad.idParametro}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() =>
                            handleSelectSuggestion(index, habilidad)
                          }
                        >
                          {habilidad.string1}
                        </li>
                      ))}

                    {/* Opción para agregar si no hay coincidencia exacta */}
                    {!existsExact && searchValues[index] && (
                      <li
                        className="p-2 hover:bg-gray-100 cursor-pointer text-blue-600"
                        onClick={() =>
                          handleAddNewSkill(index, searchValues[index])
                        }
                      >
                        ➕ Agregar "{searchValues[index]}"
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ) : (
              <select
                id={`softSkill-${index}`}
                {...register(`habilidadesBlandas.${index}.idHabilidad` as any, {
                  valueAsNumber: true,
                })}
                value={skill.idHabilidad}
                onChange={(e) =>
                  handleChange(index, "idHabilidad", Number(e.target.value))
                }
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

            {(errors as any).habilidadesBlandas?.[index]?.idHabilidad && (
              <p className="text-red-400 text-sm">
                {
                  (errors as any).habilidadesBlandas[index]?.idHabilidad
                    ?.message
                }
              </p>
            )}
          </div>
        );
      })}
    </DynamicSection>
  );
}
