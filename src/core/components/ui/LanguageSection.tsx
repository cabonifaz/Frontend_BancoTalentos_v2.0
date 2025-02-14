import { AddLanguage, DynamicSectionProps, Param } from "../../models";
import { DynamicSection } from "./DynamicSection";

interface LanguagesSectionProps extends DynamicSectionProps<AddLanguage> {
    fields: AddLanguage[];
    idiomas: Param[];
    nivelesIdioma: Param[];
    handleChange: (index: number, field: keyof AddLanguage, value: number) => void;
    handleStarChange: (index: number, star: number) => void;
}

export const LanguagesSection = ({ register, errors, fields, idiomas, nivelesIdioma, onAdd, onRemove, handleChange, handleStarChange }: LanguagesSectionProps) => {

    return (
        <DynamicSection title="Idiomas" onAdd={onAdd} onRemove={onRemove}>
            {fields.map((language, index) => (
                <div key={index}>
                    <div className="flex flex-col my-2">
                        <label htmlFor="language" className="text-[#71717A] text-sm px-1">Idioma</label>
                        <select
                            id="language"
                            {...register(`idiomas.${index}.idIdioma`, { valueAsNumber: true })}
                            value={language.idIdioma}
                            onChange={(e) => handleChange(index, 'idIdioma', Number(e.target.value))}
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                            <option value={0}>Seleccione un idioma</option>
                            {idiomas.map((idioma) => (
                                <option key={idioma.idParametro} value={idioma.num1}>
                                    {idioma.string1}
                                </option>
                            ))}
                        </select>
                        {errors.idiomas?.[index]?.idIdioma && (
                            <p className="text-red-400 text-sm">{errors.idiomas[index]?.idIdioma?.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col my-2">
                        <label htmlFor="proficiency" className="text-[#71717A] text-sm px-1">Nivel</label>
                        <select
                            id="proficiency"
                            {...register(`idiomas.${index}.idNivel`, { valueAsNumber: true })}
                            value={language.idNivel}
                            onChange={(e) => handleChange(index, 'idNivel', Number(e.target.value))}
                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                            <option value={0}>Seleccione un nivel</option>
                            {nivelesIdioma.map((nivel) => (
                                <option key={nivel.idParametro} value={nivel.num1}>
                                    {nivel.string1}
                                </option>
                            ))}
                        </select>
                        {errors.idiomas?.[index]?.idNivel && (
                            <p className="text-red-400 text-sm">{errors.idiomas[index]?.idNivel?.message}</p>
                        )}
                    </div>
                    <div id="rating-container" className="flex items-center my-6 gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <div
                                key={star}
                                className="star cursor-pointer"
                                onClick={() => handleStarChange(index, star)}>
                                <img
                                    src={language.estrellas >= star ? "/assets/ic_fill_star.svg" : "/assets/ic_outline_star.svg"}
                                    alt={`Star ${star}`}
                                    className="star-icon w-6 h-6"
                                />
                            </div>
                        ))}

                        {errors.idiomas?.[index]?.estrellas && (
                            <p className="text-red-400 text-sm ms-4">{errors.idiomas[index]?.estrellas?.message}</p>
                        )}
                    </div>
                </div>
            ))}
        </DynamicSection>
    );
};