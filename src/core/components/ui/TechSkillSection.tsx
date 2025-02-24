import { DynamicSection } from "..";
import { AddTechSkill, DynamicSectionProps, Param } from "../../models";

interface TechSkillsSectionProps extends DynamicSectionProps<AddTechSkill> {
    fields: AddTechSkill[];
    habilidadesTecnicas: Param[];
    handleChange: (index: number, field: keyof AddTechSkill, value: number) => void;
}

export const TechSkillsSection = ({ register, errors, fields, habilidadesTecnicas, onAdd, onRemove, handleChange }: TechSkillsSectionProps) => {
    return (
        <DynamicSection title="Habilidades técnicas" onAdd={onAdd} onRemove={onRemove}>
            {fields.map((skill, index) => (
                <div key={index}>
                    <div className="flex flex-col my-2">
                        <label htmlFor="techSkill" className="text-[#71717A] text-sm px-1">Habilidad técnica</label>
                        <select
                            id="techSkill"
                            {...register(`habilidadesTecnicas.${index}.idHabilidad`, { valueAsNumber: true })}
                            value={skill.idHabilidad}
                            onChange={(e) => handleChange(index, 'idHabilidad', Number(e.target.value))}
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                            <option value={0}>Seleccione una habilidad</option>
                            {habilidadesTecnicas.map((habilidad) => (
                                <option key={habilidad.idParametro} value={habilidad.num1}>
                                    {habilidad.string1}
                                </option>
                            ))}
                        </select>

                        {errors.habilidadesTecnicas?.[index]?.idHabilidad && (
                            <p className="text-red-400 text-sm">{errors.habilidadesTecnicas[index]?.idHabilidad?.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col my-2">
                        <label htmlFor="skillYears" className="text-[#71717A] text-sm px-1">Años de experiencia</label>
                        <input
                            id="skillYears"
                            {...register(`habilidadesTecnicas.${index}.anios`, { valueAsNumber: true })}
                            type="text"
                            value={skill.anios}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleChange(index, 'anios', Number(e.target.value))}
                            placeholder="Nro. años"
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                        {errors.habilidadesTecnicas?.[index]?.anios && (
                            <p className="text-red-400 text-sm">{errors.habilidadesTecnicas[index]?.anios?.message}</p>
                        )}
                    </div>
                </div>
            ))}
        </DynamicSection>
    );
};