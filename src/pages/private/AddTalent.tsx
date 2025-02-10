import { useNavigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { useState } from "react";
import { DynamicSection } from "../../core/components";
import { EducationType, ExperienceType, LanguageType, SoftSkillType, TechnicalSkillType } from "../../core/models/interfaces/AddTalentPage";

export const AddTalent = () => {
    const navigate = useNavigate();
    const [technicalSkills, setTechnicalSkills] = useState<TechnicalSkillType[]>([{ techSkill: '', skillYears: '' }]);
    const [softSkills, setSoftSkills] = useState<SoftSkillType[]>([{ name: '' }]);
    const [experiences, setExperiences] = useState<ExperienceType[]>([{ entityName: '', area: '', description: '', startYear: '', endYear: '' }]);
    const [educations, setEducations] = useState<EducationType[]>([{ entityName: '', carrer: '', degree: '', startYear: '', endYear: '' }])
    const [languages, setLanguages] = useState<LanguageType[]>([{ language: 0, level: 0 }])

    const onGoBackClick = () => navigate(-1);

    // Tech skills
    const handleAddSkill = () => {
        setTechnicalSkills([...technicalSkills, { techSkill: '', skillYears: '' }]);
    };

    const handleRemoveSkill = (index: number) => {
        const newSkills = technicalSkills.filter((_, i) => i !== index);
        setTechnicalSkills(newSkills);
    };

    const handleSkillChange = (index: number, field: keyof TechnicalSkillType, value: string) => {
        const newSkills = [...technicalSkills];
        newSkills[index][field] = value;
        setTechnicalSkills(newSkills);
    };

    // Soft skills
    const handleAddSoftSkill = () => {
        setSoftSkills([...softSkills, { name: '' }]);
    };

    const handleRemoveSoftSkill = (index: number) => {
        const newSkills = softSkills.filter((_, i) => i !== index);
        setSoftSkills(newSkills);
    };

    const handleSoftSkillChange = (index: number, field: keyof SoftSkillType, value: string) => {
        const newSkills = [...softSkills];
        newSkills[index][field] = value;
        setSoftSkills(newSkills);
    };

    // Experiences
    const handleAddExperience = () => {
        setExperiences([...experiences, { entityName: '', area: '', description: '', startYear: '', endYear: '' }]);
    };

    const handleRemoveExperience = (index: number) => {
        const newExperiences = experiences.filter((_, i) => i !== index);
        setExperiences(newExperiences);
    };

    const handleExperienceChange = (index: number, field: keyof ExperienceType, value: string) => {
        const newExperiences = [...experiences];
        newExperiences[index][field] = value;
        setExperiences(newExperiences);
    };

    // Education
    const handleAddEducation = () => {
        setEducations([...educations, { entityName: '', carrer: '', degree: '', startYear: '', endYear: '' }]);
    };

    const handleRemoveEducation = (index: number) => {
        const newEducations = educations.filter((_, i) => i !== index);
        setEducations(newEducations);
    };

    const handleEducationChange = (index: number, field: keyof EducationType, value: string) => {
        const newEducations = [...educations];
        newEducations[index][field] = value;
        setEducations(newEducations);
    };

    // Language
    const handleAddLanguage = () => {
        setLanguages([...languages, { language: 0, level: 0 }]);
    };

    const handleRemoveLanguage = (index: number) => {
        const newLanguage = languages.filter((_, i) => i !== index);
        setLanguages(newLanguage);
    };

    const handleLanguageChange = (index: number, field: keyof LanguageType, value: number) => {
        const newLanguage = [...languages];
        newLanguage[index][field] = value;
        setLanguages(newLanguage);
    };

    return (
        <>
            <Dashboard>
                {/* main container */}
                <div className="p-8 flex justify-center max-h-screen">
                    {/* form container */}
                    <div className="rounded-lg border flex flex-col shadow-lg w-[40rem] h-[50rem] overflow-y-auto relative">
                        {/* title */}
                        <div className="flex p-4 bg-white fixed w-[39.9rem] z-10 border-b rounded-lg border-gray-50 shadow-sm">
                            <div className="flex flex-col gap-4 text-[#3f3f46] w-1/2">
                                <h2 className="font-semibold text-xl">Nuevo Talento</h2>
                                <h3 className="text-sm">Ingresa datos del talento.</h3>
                            </div>
                            <div className="flex justify-end gap-3 *:py-3 *:px-4 *:h-fit w-1/2">
                                <button
                                    type="button"
                                    onClick={onGoBackClick}
                                    className="rounded-lg text-base text-[#3b82f6] bg-transparent border border-[#3b82f6] hover:bg-[#f5f9ff]">
                                    Volver
                                </button>
                                <button
                                    type="button"
                                    className="rounded-lg text-white text-base bg-[#009695] hover:bg-[#2d8d8d]">
                                    Guardar
                                </button>
                            </div>
                        </div>
                        {/* form */}
                        <form className="px-8 mt-28">
                            {/* files */}
                            <div>
                                <h3 className="text-[#3f3f46] text-lg">Curriculum Vitae</h3>
                                <div className="rounded-lg overflow-hidden max-w-xl my-4">
                                    <div className="w-full">
                                        <div className="relative h-32 rounded-lg bg-gray-100 flex justify-center items-center hover:bg-gray-200">
                                            <div className="absolute flex flex-col items-center">
                                                <img
                                                    alt="File Icon"
                                                    className="mb-3 w-8 h-8"
                                                    src="/assets/ic_upload.svg"
                                                />
                                                <span className="block text-[#0b85c3] font-normal mt-1">
                                                    Sube un archivo
                                                </span>
                                            </div>

                                            <input
                                                type="file"
                                                name="cert-file"
                                                accept=".pdf"
                                                className="h-full w-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-[#3f3f46] text-lg">Foto de perfil</h3>
                                <div className="rounded-lg overflow-hidden max-w-xl my-4">
                                    <div className="w-full">
                                        <div className="relative h-32 rounded-lg bg-gray-100 flex justify-center items-center hover:bg-gray-200">
                                            <div className="absolute flex flex-col items-center">
                                                <img
                                                    alt="File Icon"
                                                    className="mb-3 w-8 h-8"
                                                    src="/assets/ic_upload.svg"
                                                />
                                                <span className="block text-[#0b85c3] font-normal mt-1">
                                                    Sube un archivo
                                                </span>
                                            </div>

                                            <input
                                                type="file"
                                                name="cert-file"
                                                accept=".pdf"
                                                className="h-full w-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Data */}
                            <div className="*:mb-4">
                                <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Datos</h3>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="name" className="text-[#636d7c] text-sm px-1">Nombres</label>
                                    <input type="text" name="name" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Nombres" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="lastname-f" className="text-[#636d7c] text-sm px-1">Apellido paterno</label>
                                    <input type="text" name="lastname-f" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Apellido paterno" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="lastname-s" className="text-[#636d7c] text-sm px-1">Apellido materno</label>
                                    <input type="text" name="lastname-s" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Apellido materno" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="phone" className="text-[#636d7c] text-sm px-1">Número de Celular</label>
                                    <select name="country" id="country" className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                                        <option value={0}>PERÚ</option>
                                        <option value={1}>BOLIVIA</option>
                                    </select>
                                    <div className="flex">
                                        <p className="rounded-l-lg border-l border-t border-b p-3 border-gray-300 bg-gray-100 flex items-center">+51</p>
                                        <input type="text" name="phone" className="p-3 border-gray-300 border rounded-r-lg w-full focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-[#636d7c] text-sm px-1">Correo electrónico</label>
                                    <input type="email" name="email" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Correo electrónico" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="description" className="text-[#636d7c] text-sm px-1">Descripción</label>
                                    <textarea name="description" className="border p-3 resize-none h-24 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Descripción"></textarea>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="area" className="text-[#636d7c] text-sm px-1">Puesto actual</label>
                                    <input type="text" name="area" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Puesto actual" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="availability" className="text-[#636d7c] text-sm px-1">Disponibilidad</label>
                                    <input type="text" name="availability" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Disponibilidad" />
                                </div>
                            </div>
                            {/* Location */}
                            <div className="*:mb-4">
                                <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Locación</h3>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="phone" className="text-[#636d7c] text-sm px-1">País</label>
                                    <select name="country" id="country" className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none cursor-pointer">
                                        <option value={0}>PERÚ</option>
                                        <option value={1}>BOLIVIA</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="phone" className="text-[#636d7c] text-sm px-1">Ciudad</label>
                                    <select name="country" id="country" className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                                        <option value={0}>Lima</option>
                                        <option value={1}>Arequipa</option>
                                    </select>
                                </div>
                            </div>
                            {/* Salary */}
                            <div className="*:mb-4">
                                <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Banda salarial</h3>
                                <select name="country" id="country" className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                                    <option value={0}>Nuevo Sol</option>
                                    <option value={1}>Dólar Americano</option>
                                </select>
                                <h4 className="text-[#636d7c] text-base font-semibold px-1">Recibo por honorarios</h4>
                                <div className="flex w-full gap-8">
                                    <div className="flex flex-col w-1/2">
                                        <label htmlFor="initRxH" className="text-[#71717A] text-sm px-1">Monto inicial</label>
                                        <input type="number" name="initRxH" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                    <div className="flex flex-col w-1/2">
                                        <label htmlFor="endRxH" className="text-[#71717A] text-sm px-1">Monto final</label>
                                        <input type="number" name="endtRxH" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                </div>
                                <h4 className="text-[#636d7c] text-base font-semibold px-1">Planilla</h4>
                                <div className="flex w-full gap-8">
                                    <div className="flex flex-col w-1/2">
                                        <label htmlFor="initPlanilla" className="text-[#71717A] text-sm px-1">Monto inicial</label>
                                        <input type="number" name="initPlanilla" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                    <div className="flex flex-col w-1/2">
                                        <label htmlFor="endPlanilla" className="text-[#71717A] text-sm px-1">Monto final</label>
                                        <input type="number" name="endPlanilla" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                </div>
                            </div>
                            {/* Tech skills */}
                            <DynamicSection title="Habilidades técnicas" onAdd={handleAddSkill} onRemove={handleRemoveSkill}>
                                {technicalSkills.map((skill, index) => (
                                    <div key={index}>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="techSkill" className="text-[#71717A] text-sm px-1">Habilidad técnica</label>
                                            <input
                                                type="text"
                                                name="techSkill"
                                                value={skill.techSkill}
                                                onChange={(e) => handleSkillChange(index, 'techSkill', e.target.value)}
                                                placeholder="Ingrese su habilidad técnica"
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                        </div>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="skillYears" className="text-[#71717A] text-sm px-1">Años de experiencia</label>
                                            <input
                                                type="text"
                                                name="skillYears"
                                                value={skill.skillYears}
                                                onChange={(e) => handleSkillChange(index, 'skillYears', e.target.value)}
                                                placeholder="Nro. años"
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                        </div>
                                    </div>
                                ))}
                            </DynamicSection>
                            {/* Soft skills */}
                            <DynamicSection title="Habilidades blandas" onAdd={handleAddSoftSkill} onRemove={handleRemoveSoftSkill}>
                                {softSkills.map((skill, index) => (
                                    <div className="flex flex-col my-2" key={index}>
                                        <label htmlFor="softSkill" className="text-[#71717A] text-sm px-1">Habilidad blanda</label>
                                        <input
                                            type="text"
                                            name="softSkill"
                                            value={skill.name}
                                            onChange={(e) => handleSoftSkillChange(index, 'name', e.target.value)}
                                            placeholder="Ingrese su habilidad blanda"
                                            className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                ))}
                            </DynamicSection>
                            {/* Experience */}
                            <DynamicSection title="Experiencias laborales" onAdd={handleAddExperience} onRemove={handleRemoveExperience}>
                                {experiences.map((experience, index) => (
                                    <div key={index}>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="companyName" className="text-[#71717A] text-sm px-1">Empresa</label>
                                            <input
                                                type="text"
                                                id="companyName"
                                                name="companyName"
                                                value={experience.entityName}
                                                onChange={(e) => handleExperienceChange(index, 'entityName', e.target.value)}
                                                placeholder="Nombre de la empresa"
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />

                                            <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                                <input type="checkbox" name="currentCompany" id="currentCompany" className="accent-[#4F46E5] h-4 w-4 cursor-pointer" />
                                                <label htmlFor="currentCompany" className="cursor-pointer text-[#3f3f46] text-sm">Aquí en Fractal</label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="area" className="text-[#71717A] text-sm px-1">Puesto</label>
                                            <input
                                                type="text"
                                                id="area"
                                                name="area"
                                                placeholder="Puesto"
                                                value={experience.area}
                                                onChange={(e) => handleExperienceChange(index, 'area', e.target.value)}
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col w-1/2">
                                                <label htmlFor="initDate" className="text-[#71717A] text-sm px-1">Mes y año de inicio</label>
                                                <input
                                                    id="initDate"
                                                    type="month"
                                                    name="initDate"
                                                    value={experience.startYear}
                                                    onChange={(e) => handleExperienceChange(index, 'startYear', e.target.value)}
                                                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                                    <input type="checkbox" name="currentDate" id="currentDate" className="accent-[#4F46E5] h-4 w-4 cursor-pointer" />
                                                    <label htmlFor="currentDate" className="cursor-pointer text-[#3f3f46] text-sm">Hasta la actualidad</label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col w-1/2">
                                                <label htmlFor="endDate" className="text-[#71717A] text-sm px-1">Mes y año de fin</label>
                                                <input
                                                    id="endDate"
                                                    type="month"
                                                    name="endDate"
                                                    value={experience.endYear}
                                                    onChange={(e) => handleExperienceChange(index, 'endYear', e.target.value)}
                                                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="job" className="text-[#71717A] text-sm px-1">Funciones</label>
                                            <textarea
                                                id="job"
                                                name="job"
                                                value={experience.description}
                                                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                                placeholder="Digitar funciones"
                                                className="h-24 p-3 resize-none border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                                            </textarea>
                                        </div>
                                    </div>
                                ))}
                            </DynamicSection>
                            {/* Education */}
                            <DynamicSection title="Experiencias educativas" onAdd={handleAddEducation} onRemove={handleRemoveEducation}>
                                {educations.map((education, index) => (
                                    <div key={index}>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="entity" className="text-[#71717A] text-sm px-1">Institución</label>
                                            <input
                                                type="text"
                                                id="entity"
                                                name="entity"
                                                value={education.entityName}
                                                onChange={(e) => handleEducationChange(index, 'entityName', e.target.value)}
                                                placeholder="Nombre de la institución"
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                            <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                                <input type="checkbox" name="currentEntity" id="currentEntity" className="accent-[#4F46E5] h-4 w-4 cursor-pointer" />
                                                <label htmlFor="currentEntity" className="cursor-pointer text-[#3f3f46] text-sm">Aquí en Fractal</label>
                                            </div>
                                        </div>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="major" className="text-[#71717A] text-sm px-1">Carrera</label>
                                            <input
                                                id="major"
                                                type="text"
                                                name="major"
                                                value={education.carrer}
                                                onChange={(e) => handleEducationChange(index, 'carrer', e.target.value)}
                                                placeholder="Carrera"
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                        </div>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="degree" className="text-[#71717A] text-sm px-1">Grado</label>
                                            <input
                                                id="degree"
                                                type="text"
                                                name="degree"
                                                value={education.degree}
                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                placeholder="Grado"
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex flex-col w-1/2">
                                                <label htmlFor="initDateEducation" className="text-[#71717A] text-sm px-1">Mes y año de inicio</label>
                                                <input
                                                    type="month"
                                                    id="initDateEducation"
                                                    value={education.startYear}
                                                    onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                                                    name="initDateEducation"
                                                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                                <div className="px-1 flex items-center gap-2 mt-2 w-fit">
                                                    <input type="checkbox" name="currentDate" id="currentDate" className="accent-[#4F46E5] h-4 w-4 cursor-pointer" />
                                                    <label htmlFor="currentDate" className="cursor-pointer text-[#3f3f46] text-sm">Hasta la actualidad</label>
                                                </div>
                                            </div>
                                            <div className="flex flex-col w-1/2">
                                                <label htmlFor="endDateEducation" className="text-[#71717A] text-sm px-1">Mes y año de fin</label>
                                                <input
                                                    type="month"
                                                    id="endDateEducation"
                                                    value={education.endYear}
                                                    onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                                                    name="endDateEducation"
                                                    className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </DynamicSection>
                            {/* Languages */}
                            <DynamicSection title="Idiomas" onAdd={handleAddLanguage} onRemove={handleRemoveLanguage}>
                                {languages.map((language, index) => (
                                    <div key={index}>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="language" className="text-[#71717A] text-sm px-1">Idioma</label>
                                            <select
                                                id="language"
                                                name="language"
                                                value={language.language}
                                                onChange={(e) => handleLanguageChange(index, 'language', Number(e.target.value))}
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                                                <option value={0}>Nombre del idioma</option>
                                                <option value={1}>Español</option>
                                                <option value={2}>Inglés</option>
                                                <option value={3}>Francés</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col my-2">
                                            <label htmlFor="proficiency" className="text-[#71717A] text-sm px-1">Nivel</label>
                                            <select
                                                id="proficiency"
                                                name="proficiency"
                                                value={language.level}
                                                onChange={(e) => handleLanguageChange(index, 'level', Number(e.target.value))}
                                                className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]">
                                                <option value={0}>Nivel del idioma</option>
                                                <option value={1}>Básico</option>
                                                <option value={2}>Intermedio</option>
                                                <option value={3}>Avanzado</option>
                                                <option value={4}>Nativo</option>
                                            </select>
                                        </div>
                                        <div id="rating-container" className="flex items-center my-6 gap-2 *:cursor-pointer">
                                            <div className="star" data-index="1">
                                                <img src="/assets/ic_outline_star.svg" alt="Star 1" className="star-icon w-6 h-6" />
                                            </div>
                                            <div className="star" data-index="2">
                                                <img src="/assets/ic_outline_star.svg" alt="Star 2" className="star-icon w-6 h-6" />
                                            </div>
                                            <div className="star" data-index="3">
                                                <img src="/assets/ic_outline_star.svg" alt="Star 3" className="star-icon w-6 h-6" />
                                            </div>
                                            <div className="star" data-index="4">
                                                <img src="/assets/ic_outline_star.svg" alt="Star 4" className="star-icon w-6 h-6" />
                                            </div>
                                            <div className="star" data-index="5">
                                                <img src="/assets/ic_outline_star.svg" alt="Star 5" className="star-icon w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </DynamicSection>
                            {/* Social media */}
                            <div className="*:mb-4">
                                <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Medios sociales</h3>
                                <div className="flex flex-col my-2">
                                    <label htmlFor="linkedin" className="text-[#71717A] text-sm px-1">LinkedIn</label>
                                    <input type="text" name="linkedin" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                </div>
                                <div className="flex flex-col my-2">
                                    <label htmlFor="github" className="text-[#71717A] text-sm px-1">Github</label>
                                    <input type="text" name="github" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </Dashboard>
        </>
    );
}