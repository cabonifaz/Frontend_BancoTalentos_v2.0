import { useState } from "react";
import { AddEducation, DynamicSectionProps } from "../../models";
import { DynamicSection } from "./DynamicSection";
import { FieldValues } from "react-hook-form";

interface EducationsSectionProps<F extends FieldValues> extends DynamicSectionProps<F, AddEducation> {
    handleChange: (index: number, field: keyof AddEducation, value: string | boolean) => void;
}

export const EducationsSection = <F extends FieldValues,>({ register, errors, fields, onAdd, onRemove, handleChange }: EducationsSectionProps<F>) => {
    const [currentDates, setCurrentDates] = useState<{ [key: number]: boolean }>({});

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
        <DynamicSection title="Experiencias educativas" onAdd={onAdd} onRemove={onRemove}>
            {fields.map((education, index) => (
                <div key={index}>
                    <div className="flex flex-col my-2">
                        <label htmlFor={`institucion-${index}`} className="text-[#71717A] text-sm px-1">Institución<span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            id={`institucion-${index}`}
                            {...register(`educaciones.${index}.institucion` as any)}
                            value={education.institucion}
                            onChange={(e) => handleChange(index, 'institucion', e.target.value)}
                            placeholder="Nombre de la institución"
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                        {(errors as any).educaciones?.[index]?.institucion && (
                            <p className="text-red-400 text-sm">{(errors as any).educaciones[index]?.institucion?.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col my-2">
                        <label htmlFor={`carrera-${index}`} className="text-[#71717A] text-sm px-1">Carrera / Curso / Diplomado<span className="text-red-400">*</span></label>
                        <input
                            id={`carrera-${index}`}
                            type="text"
                            {...register(`educaciones.${index}.carrera` as any)}
                            value={education.carrera}
                            onChange={(e) => handleChange(index, 'carrera', e.target.value)}
                            placeholder="Carrera"
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                        {(errors as any).educaciones?.[index]?.carrera && (
                            <p className="text-red-400 text-sm">{(errors as any).educaciones[index]?.carrera?.message}</p>
                        )}

                    </div>
                    <div className="flex flex-col my-2">
                        <label htmlFor={`grado-${index}`} className="text-[#71717A] text-sm px-1">Grado<span className="text-red-400">*</span></label>
                        <input
                            id={`grado-${index}`}
                            type="text"
                            {...register(`educaciones.${index}.grado` as any)}
                            value={education.grado}
                            onChange={(e) => handleChange(index, 'grado', e.target.value)}
                            placeholder="Grado"
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                        {(errors as any).educaciones?.[index]?.grado && (
                            <p className="text-red-400 text-sm">{(errors as any).educaciones[index]?.grado?.message}</p>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex flex-col w-1/2">
                            <label htmlFor={`initDateEducation-${index}`} className="text-[#71717A] text-sm px-1">Mes y año de inicio<span className="text-red-400">*</span></label>
                            <input
                                type="date"
                                id={`initDateEducation-${index}`}
                                {...register(`educaciones.${index}.fechaInicio` as any)}
                                value={education.fechaInicio}
                                onChange={(e) => handleChange(index, 'fechaInicio', e.target.value)}
                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                            {(errors as any).educaciones?.[index]?.fechaInicio && (
                                <p className="text-red-400 text-sm">{(errors as any).educaciones[index]?.fechaInicio?.message}</p>
                            )}

                            <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                <input
                                    type="checkbox"
                                    id={`currentDate-${index}`}
                                    {...register(`educaciones.${index}.flActualidad` as any)}
                                    checked={currentDates[index] || false}
                                    onChange={(e) => handleEndDateChange(e, index)}
                                    className="accent-[#4F46E5] h-4 w-4 cursor-pointer" />
                                <label htmlFor={`currentDate-${index}`} className="cursor-pointer text-[#3f3f46] text-sm">Hasta la actualidad</label>
                            </div>
                        </div>
                        <div className="flex flex-col w-1/2">
                            <label htmlFor={`endDateEducation-${index}`} className="text-[#71717A] text-sm px-1">Mes y año de fin</label>
                            <input
                                type="date"
                                id={`endDateEducation-${index}`}
                                disabled={currentDates[index]}
                                {...register(`educaciones.${index}.fechaFin` as any)}
                                value={education.fechaFin}
                                onChange={(e) => handleChange(index, 'fechaFin', e.target.value)}
                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                            {(errors as any).educaciones?.[index]?.fechaFin && (
                                <p className="text-red-400 text-sm">{(errors as any).educaciones[index]?.fechaFin?.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </DynamicSection>
    );
};