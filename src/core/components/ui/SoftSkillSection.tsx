import { FieldValues } from "react-hook-form";
import { DynamicSection } from "..";
import { AddSoftSkill, DynamicSectionProps, Param } from "../../models";

interface SoftSkillsSectionProps<F extends FieldValues> extends DynamicSectionProps<F, AddSoftSkill> {
    habilidadesBlandas: Param[];
    handleChange: (index: number, field: keyof AddSoftSkill, value: number) => void;
}

export function SoftSkillsSection<F extends FieldValues>({
    register,
    errors,
    fields,
    habilidadesBlandas,
    onAdd,
    onRemove,
    handleChange
}: SoftSkillsSectionProps<F>) {
    return (
        <DynamicSection title="Habilidades blandas" onAdd={onAdd} onRemove={onRemove}>
            {fields.map((skill, index) => (
                <div className="flex flex-col my-2" key={index}>
                    <label htmlFor="softSkill" className="text-[#71717A] text-sm px-1">Habilidad blanda<span className="text-red-400">*</span></label>
                    <select
                        id="softSkill"
                        {...register(`habilidadesBlandas.${index}.idHabilidad` as any, { valueAsNumber: true })}
                        value={skill.idHabilidad}
                        onChange={(e) => handleChange(index, 'idHabilidad', Number(e.target.value))}
                        className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                        <option value={0}>Seleccione una habilidad</option>
                        {habilidadesBlandas.map((habilidad) => (
                            <option key={habilidad.idParametro} value={habilidad.num1}>
                                {habilidad.string1}
                            </option>
                        ))}
                    </select>
                    {(errors as any).habilidadesBlandas?.[index]?.idHabilidad && (
                        <p className="text-red-400 text-sm">{(errors as any).habilidadesBlandas[index]?.idHabilidad?.message}</p>
                    )}
                </div>
            ))}
        </DynamicSection>
    );
}