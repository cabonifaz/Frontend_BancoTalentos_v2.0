import { useNavigate } from "react-router-dom";
import { Dashboard } from "./Dashboard";
import { useState, useEffect, useRef } from "react";
import { EducationsSection, ExperiencesSection, FileInput, LanguagesSection, Loading, SoftSkillsSection, TechSkillsSection } from "../../core/components";
import {
    AddEducation,
    AddExperience,
    AddLanguage,
    AddSoftSkill,
    AddTalentParams,
    AddTechSkill,
    BaseResponse,
    initialEducation,
    initialExperience,
    initialLanguage,
    initialSoftSkill,
    initialTechnicalSkill,
} from "../../core/models";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useParamContext } from "../../core/context/ParamsContext";
import { AddTalentSchema, AddTalentType } from "../../core/models/schemas/AddTalentSchema";
import { Utils } from "../../core/utilities/utils";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../core/hooks/useApi";
import { handleError, handleResponse } from "../../core/utilities/errorHandler";
import { addTalent } from "../../core/services/apiService";
import { ARCHIVO_IMAGEN, ARCHIVO_PDF, DOCUMENTO_CV, DOCUMENTO_FOTO_PERFIL } from "../../core/utilities/constants";

export const AddTalent = () => {
    const navigate = useNavigate();
    const { paramsByMaestro } = useParamContext();
    const countryCode = useRef<HTMLParagraphElement>(null);

    const [technicalSkills, setTechnicalSkills] = useState<AddTechSkill[]>([{ ...initialTechnicalSkill }]);
    const [softSkills, setSoftSkills] = useState<AddSoftSkill[]>([{ ...initialSoftSkill }]);
    const [experiences, setExperiences] = useState<AddExperience[]>([{ ...initialExperience }]);
    const [educations, setEducations] = useState<AddEducation[]>([{ ...initialEducation }]);
    const [languages, setLanguages] = useState<AddLanguage[]>([{ ...initialLanguage }]);

    const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [selectedCountryPhone, setSelectedCountryPhone] = useState<number | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [cvFileErrors, setCvFileErrors] = useState("");
    const [fotoFileErrors, setFotoFileErrors] = useState("");

    const paises = paramsByMaestro[12] || [];
    const ciudades = paramsByMaestro[13] || [];
    const monedas = paramsByMaestro[2] || [];
    const habilidadesTecnicas = paramsByMaestro[19] || [];
    const habilidadesBlandas = paramsByMaestro[20] || [];
    const idiomas = paramsByMaestro[15] || [];
    const nivelesIdioma = paramsByMaestro[16] || [];

    const ciudadesFiltradas = selectedCountry
        ? ciudades.filter((ciudad) => ciudad.num2 === selectedCountry)
        : [];

    const {
        loading: loadingAddTalent,
        fetch: postTalent,
    } = useApi<BaseResponse, AddTalentParams>(addTalent, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse(response, enqueueSnackbar),
    });

    const onGoBackClick = () => navigate(-1);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<AddTalentType>({
        resolver: zodResolver(AddTalentSchema),
        mode: "onChange",
    });

    const onSubmit: SubmitHandler<AddTalentType> = async (data) => {
        setCvFileErrors("");
        setFotoFileErrors("");

        // Validación manual
        if (!data.cv[0] || !(data.cv[0] instanceof File)) {
            setCvFileErrors("El CV es requerido");
            return;
        }
        if (!data.cv[0].name.endsWith(".pdf")) {
            setCvFileErrors("El CV debe ser un archivo PDF");
            return;
        }

        // Validación manual
        if (!data.foto[0] || !(data.foto[0] instanceof File)) {
            setFotoFileErrors("La foto es requerida");
            return;
        }
        if (!data.foto[0].name.endsWith(".png") && !data.foto[0].name.endsWith(".jpeg")) {
            setFotoFileErrors("La foto debe ser un archivo PNG o JPEG");
            return;
        }

        const { codigoPais, telefono, experiencias, educaciones, cv, foto, ...filterData } = data;
        const phone = countryCode.current?.textContent + ' ' + telefono.trim();

        const cleanExperiencias = experiencias.map((exp) => ({
            ...exp,
            flActualidad: exp.flActualidad ? 1 : 0,
        }));

        const cleanEducaciones = educaciones.map((edu) => ({
            ...edu,
            flActualidad: edu.flActualidad ? 1 : 0,
        }));

        try {
            const cvBase64 = await Utils.fileToBase64(cvFile!);
            const fotoBase64 = await Utils.fileToBase64(fotoFile!);

            const cleanData: AddTalentParams = {
                telefono: phone,
                ...filterData,
                experiencias: cleanExperiencias,
                educaciones: cleanEducaciones,
                cvArchivo: {
                    stringB64: cvBase64,
                    nombreArchivo: Utils.getFileNameWithoutExtension(cvFile?.name),
                    extensionArchivo: "pdf",
                    idTipoArchivo: ARCHIVO_PDF,
                    idTipoDocumento: DOCUMENTO_CV,
                },
                fotoArchivo: {
                    stringB64: fotoBase64,
                    nombreArchivo: Utils.getFileNameWithoutExtension(fotoFile?.name),
                    extensionArchivo: Utils.detectarFormatoDesdeBase64(fotoBase64),
                    idTipoArchivo: ARCHIVO_IMAGEN,
                    idTipoDocumento: DOCUMENTO_FOTO_PERFIL,
                },
            };

            postTalent(cleanData);
        } catch (error) {
            enqueueSnackbar("error al cargar archivos", { variant: 'warning' });
        }
    };

    // Tech skills
    const handleAddSkill = () => {
        setTechnicalSkills([...technicalSkills, { ...initialTechnicalSkill }]);
    };

    const handleRemoveSkill = (index: number) => {
        const newSkills = technicalSkills.filter((_, i) => i !== index);
        setTechnicalSkills(newSkills);
    };

    const handleSkillChange = (index: number, field: keyof AddTechSkill, value: number) => {
        const newSkills = [...technicalSkills];
        newSkills[index][field] = value;
        setTechnicalSkills(newSkills);
    };

    // Soft skills
    const handleAddSoftSkill = () => {
        setSoftSkills([...softSkills, { ...initialSoftSkill }]);
    };

    const handleRemoveSoftSkill = (index: number) => {
        const newSkills = softSkills.filter((_, i) => i !== index);
        setSoftSkills(newSkills);
    };

    const handleSoftSkillChange = (index: number, field: keyof AddSoftSkill, value: number) => {
        const newSkills = [...softSkills];
        newSkills[index][field] = value;
        setSoftSkills(newSkills);
    };

    // Experiences
    const handleAddExperience = () => {
        setExperiences([...experiences, { ...initialExperience }]);
    };

    const handleRemoveExperience = (index: number) => {
        const newExperiences = experiences.filter((_, i) => i !== index);
        setExperiences(newExperiences);
    };

    const handleExperienceChange = (index: number, field: keyof AddExperience, value: string | boolean) => {
        const newExperiences = [...experiences];

        if (field === 'empresa' || field === 'puesto' || field === 'funciones' || field === 'fechaInicio' || field === 'fechaFin') {
            if (typeof value === 'string') {
                newExperiences[index][field] = value;
            }
        } else if (field === 'flActualidad') {
            if (typeof value === 'boolean') {
                newExperiences[index][field] = value;
            }
        }

        setExperiences(newExperiences);
    };

    // Education
    const handleAddEducation = () => {
        setEducations([...educations, { ...initialEducation }]);
    };

    const handleRemoveEducation = (index: number) => {
        const newEducations = educations.filter((_, i) => i !== index);
        setEducations(newEducations);
    };

    const handleEducationChange = (index: number, field: keyof AddEducation, value: string | boolean) => {
        const newEducations = [...educations];

        if (field === 'institucion' || field === 'carrera' || field === 'grado' || field === 'fechaInicio' || field === 'fechaFin') {
            if (typeof value === 'string') {
                newEducations[index][field] = value;
            }
        } else if (field === 'flActualidad') {
            if (typeof value === 'boolean') {
                newEducations[index][field] = value;
            }
        }

        setEducations(newEducations);
    };

    // Language
    const handleAddLanguage = () => {
        setLanguages([...languages, { ...initialLanguage }]);
    };

    const handleRemoveLanguage = (index: number) => {
        const newLanguage = languages.filter((_, i) => i !== index);
        setLanguages(newLanguage);
    };

    const handleLanguageChange = (index: number, field: keyof AddLanguage, value: number) => {
        const newLanguage = [...languages];
        newLanguage[index][field] = value;
        setLanguages(newLanguage);
    };

    const handleStarChange = (index: number, star: number) => {
        const newLanguages = [...languages];

        if (newLanguages[index].estrellas === star) {
            newLanguages[index].estrellas = 0;
        } else {
            newLanguages[index].estrellas = star;
        }

        setLanguages(newLanguages);
    };

    useEffect(() => {
        setValue("idiomas", languages);
    }, [languages, setValue]);

    // file
    const handleFileChange = (field: keyof AddTalentType, file: File | null) => {
        if (field === "cv") {
            setCvFile(file);
        } else if (field === "foto") {
            setFotoFile(file);
        }
    };

    return (
        <>
            <Dashboard>
                {loadingAddTalent && (<Loading opacity="opacity-50" />)}
                {/* main container */}
                <div className="p-8 flex justify-center max-h-screen">
                    {/* form container */}
                    <div className="rounded-lg border flex flex-col shadow-lg w-[40rem] h-[50rem] overflow-y-auto relative">
                        {/* form */}
                        <form className="relative" onSubmit={handleSubmit(onSubmit)}>
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
                                        type="submit"
                                        className="rounded-lg text-white text-base bg-[#009695] hover:bg-[#2d8d8d]">
                                        Guardar
                                    </button>
                                </div>
                            </div>
                            <div className="px-8 mt-28">
                                {/* files */}
                                <div>
                                    <h3 className="text-[#3f3f46] text-lg">Curriculum Vitae</h3>
                                    <FileInput
                                        register={register}
                                        errors={errors}
                                        name="cv"
                                        initialText="Sube un archivo"
                                        acceptedTypes=".pdf"
                                        onChange={(file) => handleFileChange("cv", file)}
                                    />
                                    {cvFileErrors !== "" && (<p className="text-red-400 text-sm">{cvFileErrors}</p>)}
                                    <h3 className="text-[#3f3f46] text-lg">Foto de perfil</h3>
                                    <FileInput
                                        register={register}
                                        errors={errors}
                                        name="foto"
                                        initialText="Sube una foto"
                                        acceptedTypes=".png, .jpeg"
                                        onChange={(file) => handleFileChange("foto", file)}
                                    />
                                    {fotoFileErrors !== "" && (<p className="text-red-400 text-sm">{fotoFileErrors}</p>)}
                                </div>
                                {/* Data */}
                                <div className="*:mb-4">
                                    <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Datos</h3>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="name" className="text-[#636d7c] text-sm px-1">Nombres</label>
                                        <input {...register("nombres")} id="name" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Nombres" />
                                        {errors.nombres && <p className="text-red-400 text-sm">{errors.nombres.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="lastname-f" className="text-[#636d7c] text-sm px-1">Apellido paterno</label>
                                        <input {...register("apellidoPaterno")} id="lastname-f" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Apellido paterno" />
                                        {errors.apellidoPaterno && <p className="text-red-400 text-sm">{errors.apellidoPaterno.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="lastname-s" className="text-[#636d7c] text-sm px-1">Apellido materno</label>
                                        <input {...register("apellidoMaterno")} id="lastname-s" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Apellido materno" />
                                        {errors.apellidoMaterno && <p className="text-red-400 text-sm">{errors.apellidoMaterno.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="countrycode" className="text-[#636d7c] text-sm px-1">Número de Celular</label>
                                        <select
                                            id="countrycode"
                                            value={selectedCountryPhone || ""}
                                            {...register("codigoPais", { valueAsNumber: true })}
                                            onChange={(e) => setSelectedCountryPhone(Number(e.target.value))}
                                            className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                                            <option value={0}>Seleccione un país</option>
                                            {paises.map((pais) => (
                                                <option key={pais.idParametro} value={pais.num1}>
                                                    {pais.string1}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.codigoPais && <p className="text-red-400 text-sm">{errors.codigoPais.message}</p>}
                                        <div className="flex">
                                            <p ref={countryCode} className="rounded-l-lg border-l border-t border-b p-3 border-gray-300 bg-gray-100 flex items-center">
                                                {selectedCountryPhone ? `${paises.find((p) => p.num1 === selectedCountryPhone)?.string3 || "00"}` : "+00"}
                                            </p>
                                            <input {...register("telefono")} id="phone" type="text" className="p-3 border-gray-300 border rounded-r-lg w-full focus:outline-none focus:border-[#4F46E5]" />
                                        </div>
                                        {errors.telefono && <p className="text-red-400 text-sm">{errors.telefono.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="email" className="text-[#636d7c] text-sm px-1">Correo electrónico</label>
                                        <input {...register("email")} type="email" id="email" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Correo electrónico" />
                                        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="description" className="text-[#636d7c] text-sm px-1">Descripción</label>
                                        <textarea {...register("descripcion")} id="description" className="border p-3 resize-none h-24 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Descripción"></textarea>
                                        {errors.descripcion && <p className="text-red-400 text-sm">{errors.descripcion.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="puestoAnt" className="text-[#636d7c] text-sm px-1">Puesto actual</label>
                                        <input {...register("puesto")} id="puestoAnt" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Puesto actual" />
                                        {errors.puesto && <p className="text-red-400 text-sm">{errors.puesto.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="availability" className="text-[#636d7c] text-sm px-1">Disponibilidad</label>
                                        <input {...register("disponibilidad")} id="availability" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Disponibilidad" />
                                        {errors.disponibilidad && <p className="text-red-400 text-sm">{errors.disponibilidad.message}</p>}
                                    </div>
                                </div>
                                {/* Location */}
                                <div className="*:mb-4">
                                    <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Locación</h3>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="country" className="text-[#636d7c] text-sm px-1">País</label>
                                        <select
                                            id="country"
                                            value={selectedCountry || ""}
                                            {...register("idPais", { valueAsNumber: true })}
                                            onChange={(e) => setSelectedCountry(Number(e.target.value))}
                                            className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none cursor-pointer">
                                            <option value={0}>Seleccione un país</option>
                                            {paises.map((pais) => (
                                                <option key={pais.idParametro} value={pais.num1}>
                                                    {pais.string1}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.idPais && <p className="text-red-400 text-sm">{errors.idPais.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="city" className="text-[#636d7c] text-sm px-1">Ciudad</label>
                                        <select
                                            id="city"
                                            value={selectedCity || ""}
                                            {...register("idCiudad", { valueAsNumber: true })}
                                            onChange={(e) => setSelectedCity(Number(e.target.value))}
                                            className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                                            <option value={0}>Seleccione una ciudad</option>
                                            {ciudadesFiltradas.map((ciudad) => (
                                                <option key={ciudad.idParametro} value={ciudad.num1}>
                                                    {ciudad.string1}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.idCiudad && <p className="text-red-400 text-sm">{errors.idCiudad.message}</p>}
                                    </div>
                                </div>
                                {/* Salary */}
                                <div className="*:mb-4">
                                    <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Banda salarial</h3>
                                    <select
                                        id="currency"
                                        {...register("idMoneda", { valueAsNumber: true })}
                                        className="text-[#3f3f46] p-3 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                                        <option value={0}>Seleccione una moneda</option>
                                        {monedas.map((moneda) => (
                                            <option key={moneda.idParametro} value={moneda.num1}>
                                                {moneda.string1}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.idMoneda && <p className="text-red-400 text-sm">{errors.idMoneda.message}</p>}
                                    <h4 className="text-[#636d7c] text-base font-semibold px-1">Recibo por honorarios</h4>
                                    <div className="flex w-full gap-8">
                                        <div className="flex flex-col w-1/2">
                                            <label htmlFor="initRxH" className="text-[#71717A] text-sm px-1">Monto inicial</label>
                                            <input {...register("montoInicialRxH", { valueAsNumber: true })} id="initRxH" type="number" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                            {errors.montoInicialRxH && <p className="text-red-400 text-sm">{errors.montoInicialRxH.message}</p>}
                                        </div>
                                        <div className="flex flex-col w-1/2">
                                            <label htmlFor="endRxH" className="text-[#71717A] text-sm px-1">Monto final</label>
                                            <input {...register("montoFinalRxH", { valueAsNumber: true })} id="endRxH" type="number" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                            {errors.montoFinalRxH && <p className="text-red-400 text-sm">{errors.montoFinalRxH.message}</p>}
                                        </div>
                                    </div>
                                    <h4 className="text-[#636d7c] text-base font-semibold px-1">Planilla</h4>
                                    <div className="flex w-full gap-8">
                                        <div className="flex flex-col w-1/2">
                                            <label htmlFor="initPlanilla" className="text-[#71717A] text-sm px-1">Monto inicial</label>
                                            <input {...register("montoInicialPlanilla", { valueAsNumber: true })} id="initPlanilla" type="tenumberxt" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                            {errors.montoInicialPlanilla && <p className="text-red-400 text-sm">{errors.montoInicialPlanilla.message}</p>}
                                        </div>
                                        <div className="flex flex-col w-1/2">
                                            <label htmlFor="endPlanilla" className="text-[#71717A] text-sm px-1">Monto final</label>
                                            <input {...register("montoFinalPlanilla", { valueAsNumber: true })} id="endPlanilla" type="number" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                            {errors.montoFinalPlanilla && <p className="text-red-400 text-sm">{errors.montoFinalPlanilla.message}</p>}
                                        </div>
                                    </div>
                                </div>
                                {/* Tech skills */}
                                <TechSkillsSection
                                    register={register}
                                    errors={errors}
                                    fields={technicalSkills}
                                    habilidadesTecnicas={habilidadesTecnicas}
                                    onAdd={handleAddSkill}
                                    onRemove={handleRemoveSkill}
                                    handleChange={handleSkillChange}
                                />
                                {/* Soft skills */}
                                <SoftSkillsSection
                                    register={register}
                                    errors={errors}
                                    fields={softSkills}
                                    habilidadesBlandas={habilidadesBlandas}
                                    onAdd={handleAddSoftSkill}
                                    onRemove={handleRemoveSoftSkill}
                                    handleChange={handleSoftSkillChange}
                                />
                                {/* Experience */}
                                <ExperiencesSection
                                    register={register}
                                    errors={errors}
                                    fields={experiences}
                                    setValue={setValue}
                                    onAdd={handleAddExperience}
                                    onRemove={handleRemoveExperience}
                                    handleChange={handleExperienceChange}
                                />
                                {/* Education */}
                                <EducationsSection
                                    register={register}
                                    errors={errors}
                                    fields={educations}
                                    setValue={setValue}
                                    onAdd={handleAddEducation}
                                    onRemove={handleRemoveEducation}
                                    handleChange={handleEducationChange}
                                />
                                {/* Languages */}
                                <LanguagesSection
                                    register={register}
                                    errors={errors}
                                    fields={languages}
                                    onAdd={handleAddLanguage}
                                    onRemove={handleRemoveLanguage}
                                    handleChange={handleLanguageChange}
                                    handleStarChange={handleStarChange}
                                    idiomas={idiomas}
                                    nivelesIdioma={nivelesIdioma}
                                />
                                {/* Social media */}
                                <div className="*:mb-4">
                                    <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Medios sociales</h3>
                                    <div className="flex flex-col my-2">
                                        <label htmlFor="linkedin" className="text-[#71717A] text-sm px-1">LinkedIn</label>
                                        <input {...register("linkedin")} id="linkedin" type="text" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                        {errors.linkedin && <p className="text-red-400 text-sm">{errors.linkedin.message}</p>}
                                    </div>
                                    <div className="flex flex-col my-2">
                                        <label htmlFor="github" className="text-[#71717A] text-sm px-1">Github</label>
                                        <input {...register("github")} id="github" type="text" className="h-12 p-3 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]" />
                                        {errors.github && <p className="text-red-400 text-sm">{errors.github.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </Dashboard>
        </>
    );
}