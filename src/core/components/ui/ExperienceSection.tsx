import { useState } from "react";
import { AddExperience, DynamicSectionProps } from "../../models";
import { DynamicSection } from "./DynamicSection";
import { UseFormSetValue } from "react-hook-form";
import { AddTalentType } from "../../models/schemas/AddTalentSchema";

interface ExperiencesSectionProps extends DynamicSectionProps<AddExperience> {
    fields: AddExperience[];
    setValue: UseFormSetValue<AddTalentType>;
    handleChange: (index: number, field: keyof AddExperience, value: string | boolean) => void;
}

export const ExperiencesSection = ({ register, errors, fields, setValue, onAdd, onRemove, handleChange }: ExperiencesSectionProps) => {
    const [defaultCompanies, setDefaultCompanies] = useState<{ [key: number]: boolean }>({});
    const [currentDates, setCurrentDates] = useState<{ [key: number]: boolean }>({});

    const handleCurrentCompanyChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const isChecked = e.target.checked;

        setDefaultCompanies((prev) => ({
            ...prev,
            [index]: isChecked,
        }));

        if (isChecked) {
            handleChange(index, 'empresa', 'Fractal');
            setValue(`experiencias.${index}.empresa`, "Fractal");
            return;
        }
        setValue(`experiencias.${index}.empresa`, "");
        handleChange(index, 'empresa', '');
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const isChecked = e.target.checked;

        setCurrentDates((prev) => ({
            ...prev,
            [index]: isChecked,
        }));

        if (isChecked) {
            handleChange(index, 'fechaFin', '');
        }
    };

    return (
        <DynamicSection title="Experiencias laborales" onAdd={onAdd} onRemove={onRemove}>
            {fields.map((experience, index) => (
                <div key={index}>
                    <div className="flex flex-col my-2">
                        <label htmlFor={`companyName-${index}`} className="text-[#71717A] text-sm px-1">Empresa</label>
                        <input
                            type="text"
                            id={`companyName-${index}`}
                            {...register(`experiencias.${index}.empresa`)}
                            value={experience.empresa}
                            readOnly={defaultCompanies[index]}
                            onChange={(e) => handleChange(index, 'empresa', e.target.value)}
                            placeholder="Nombre de la empresa"
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                        {errors.experiencias?.[index]?.empresa && (
                            <p className="text-red-400 text-sm">{errors.experiencias[index]?.empresa?.message}</p>
                        )}

                        <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                            <input
                                type="checkbox"
                                id={`currentCompany-${index}`}
                                checked={defaultCompanies[index] || false}
                                onChange={(e) => handleCurrentCompanyChange(e, index)}
                                className="accent-[#4F46E5] h-4 w-4 cursor-pointer" />
                            <label htmlFor={`currentCompany-${index}`} className="cursor-pointer text-[#3f3f46] text-sm">Aquí en Fractal</label>
                        </div>
                    </div>
                    <div className="flex flex-col my-2">
                        <label htmlFor={`puesto-${index}`} className="text-[#71717A] text-sm px-1">Puesto</label>
                        <input
                            type="text"
                            id={`puesto-${index}`}
                            {...register(`experiencias.${index}.puesto`)}
                            placeholder="Puesto"
                            value={experience.puesto}
                            onChange={(e) => handleChange(index, 'puesto', e.target.value)}
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                        {errors.experiencias?.[index]?.puesto && (
                            <p className="text-red-400 text-sm">{errors.experiencias[index]?.puesto?.message}</p>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor={`initDate-${index}`} className="text-[#71717A] text-sm px-1">Mes y año de inicio</label>
                            <input
                                id={`initDate-${index}`}
                                type="date"
                                {...register(`experiencias.${index}.fechaInicio`)}
                                value={experience.fechaInicio}
                                onChange={(e) => handleChange(index, 'fechaInicio', e.target.value)}
                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                            {errors.experiencias?.[index]?.fechaInicio && (
                                <p className="text-red-400 text-sm">{errors.experiencias[index]?.fechaInicio?.message}</p>
                            )}

                            <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                <input
                                    type="checkbox"
                                    id={`currentDateExp-${index}`}
                                    {...register(`experiencias.${index}.flActualidad`)}
                                    checked={currentDates[index] || false}
                                    onChange={(e) => handleEndDateChange(e, index)}
                                    className="accent-[#4F46E5] h-4 w-4 cursor-pointer" />
                                <label htmlFor={`currentDateExp-${index}`} className="cursor-pointer text-[#3f3f46] text-sm">Hasta la actualidad</label>
                            </div>
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor={`endDate-${index}`} className="text-[#71717A] text-sm px-1">Mes y año de fin</label>
                            <input
                                id={`endDate-${index}`}
                                type="date"
                                {...register(`experiencias.${index}.fechaFin`)}
                                value={experience.fechaFin}
                                disabled={currentDates[index]}
                                onChange={(e) => handleChange(index, 'fechaFin', e.target.value)}
                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                            {errors.experiencias?.[index]?.fechaFin && (
                                <p className="text-red-400 text-sm">{errors.experiencias[index]?.fechaFin?.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col my-2">
                        <label htmlFor={`funciones-${index}`} className="text-[#71717A] text-sm px-1">Funciones</label>
                        <textarea
                            id={`funciones-${index}`}
                            {...register(`experiencias.${index}.funciones`)}
                            value={experience.funciones}
                            onChange={(e) => handleChange(index, 'funciones', e.target.value)}
                            placeholder="Digitar funciones"
                            className="h-24 p-3 resize-none border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                        </textarea>

                        {errors.experiencias?.[index]?.funciones && (
                            <p className="text-red-400 text-sm">{errors.experiencias[index]?.funciones?.message}</p>
                        )}
                    </div>
                </div>
            ))}
        </DynamicSection>
    );
};