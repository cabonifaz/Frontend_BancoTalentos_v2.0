import { FieldValues } from "react-hook-form";
import { DynamicSection } from "..";
import { AddTechSkill, DynamicSectionProps, Param } from "../../models";
import { ChangeEvent, useState } from "react";

interface TechSkillsSectionProps<F extends FieldValues>
  extends DynamicSectionProps<F, AddTechSkill> {
  habilidadesTecnicas: Param[];
  handleChange: (
    index: number,
    field: keyof AddTechSkill,
    value: number | string,
  ) => void;
  dropdownWithSearch: boolean;
}

export const TechSkillsSection = <F extends FieldValues>({
  register,
  errors,
  fields,
  habilidadesTecnicas,
  onAdd,
  onRemove,
  handleChange,
  dropdownWithSearch,
}: TechSkillsSectionProps<F>) => {
  const [searchValues, setSearchValues] = useState<string[]>(
    fields.map(() => ""),
  );
  const [showSuggestions, setShowSuggestions] = useState<boolean[]>(
    fields.map(() => false),
  );

  const handleYearsChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const inputValue = e.target.value;
    const sanitizedValue = inputValue.replace(/\D/g, "");
    if (sanitizedValue === "" || /^\d+$/.test(sanitizedValue)) {
      handleChange(
        index,
        "anios",
        sanitizedValue === "" ? 0 : Number(sanitizedValue),
      );
    }
  };

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
    handleChange(index, "idHabilidad", habilidad.num1);
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
    handleChange(index, "idHabilidad", 0);
    handleChange(index, "habilidad", habilidadNombre);
    setShowSuggestions((prev) => {
      const newState = [...prev];
      newState[index] = false;
      return newState;
    });
  };

  return (
    <DynamicSection
      title="Habilidades técnicas"
      onAdd={onAdd}
      onRemove={onRemove}
    >
      {fields.map((skill, index) => {
        const filteredOptions = habilidadesTecnicas.filter((h) =>
          h.string1
            .toLowerCase()
            .includes(searchValues[index]?.toLowerCase() || ""),
        );
        const existsExact = habilidadesTecnicas.some(
          (h) => h.string1.toLowerCase() === searchValues[index]?.toLowerCase(),
        );

        return (
          <div key={index}>
            <div className="flex flex-col my-2 relative">
              <label className="text-[#71717A] text-sm px-1">
                Habilidad técnica<span className="text-red-400">*</span>
              </label>

              {dropdownWithSearch ? (
                <>
                  <input
                    type="text"
                    value={searchValues[index]}
                    onChange={(e) => handleSearchChange(e, index)}
                    placeholder="Escribe para buscar..."
                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
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
                </>
              ) : (
                <select
                  {...register(
                    `habilidadesTecnicas.${index}.idHabilidad` as any,
                    {
                      valueAsNumber: true,
                    },
                  )}
                  value={skill.idHabilidad}
                  onChange={(e) =>
                    handleChange(index, "idHabilidad", Number(e.target.value))
                  }
                  className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value={0}>Seleccione una habilidad</option>
                  {habilidadesTecnicas.map((habilidad) => (
                    <option key={habilidad.idParametro} value={habilidad.num1}>
                      {habilidad.string1}
                    </option>
                  ))}
                </select>
              )}

              {(errors as any).habilidadesTecnicas?.[index]?.idHabilidad && (
                <p className="text-red-400 text-sm">
                  {
                    (errors as any).habilidadesTecnicas[index]?.idHabilidad
                      ?.message
                  }
                </p>
              )}
            </div>

            {/* Campo de años de experiencia */}
            <div className="flex flex-col my-2">
              <label className="text-[#71717A] text-sm px-1">
                Años de experiencia<span className="text-red-400">*</span>
              </label>
              <input
                {...register(`habilidadesTecnicas.${index}.anios` as any, {
                  valueAsNumber: true,
                })}
                type="text"
                value={skill.anios || ""}
                onChange={(e) => handleYearsChange(e, index)}
                onFocus={(e) => e.target.select()}
                onWheel={(e) => e.currentTarget.blur()}
                inputMode="numeric"
                placeholder="Nro. años"
                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
              />
              {(errors as any).habilidadesTecnicas?.[index]?.anios && (
                <p className="text-red-400 text-sm">
                  {(errors as any).habilidadesTecnicas[index]?.anios?.message}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </DynamicSection>
  );
};
