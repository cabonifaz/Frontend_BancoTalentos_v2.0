import { useParams } from "../../core/context/ParamsContext";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { isDirty, isValid } from "zod";
import { Loading, EducationsSection, ExperiencesSection, FileInput, LanguagesSection, SoftSkillsSection, TechSkillsSection } from "../../core/components";
import { useApi } from "../../core/hooks/useApi";
import { AddTechSkill, initialTechnicalSkill, AddSoftSkill, initialSoftSkill, AddExperience, initialExperience, AddEducation, initialEducation, AddLanguage, initialLanguage, AddTalentParams, BaseResponseFMI, AddPostulanteParams, InsertUpdateResponse, AddPostulanteSchema, AddPostulanteType } from "../../core/models";
import { addPostulanteService, addTalent } from "../../core/services/apiService";
import { ARCHIVO_PDF, DOCUMENTO_CV, ARCHIVO_IMAGEN, DOCUMENTO_FOTO_PERFIL } from "../../core/utilities/constants";
import { handleError, handleResponse } from "../../core/utilities/errorHandler";
import { Utils } from "../../core/utilities/utils";

export const FormPostulante = () => {
    const registerRef = useRef(false);
    const { paramsByMaestro, loading: loadingParams } = useParams("12, 13, 15, 16, 19, 20");
    const countryCode = useRef<HTMLParagraphElement>(null);

    const [technicalSkills, setTechnicalSkills] = useState<AddTechSkill[]>([{ ...initialTechnicalSkill }]);
    const [softSkills, setSoftSkills] = useState<AddSoftSkill[]>([{ ...initialSoftSkill }]);
    const [educations, setEducations] = useState<AddEducation[]>([{ ...initialEducation }]);
    const [experiences, setExperiences] = useState<AddExperience[]>([]);
    const [languages, setLanguages] = useState<AddLanguage[]>([]);

    const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [selectedCountryPhone, setSelectedCountryPhone] = useState<number | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [cvFileErrors, setCvFileErrors] = useState("");
    const [fotoFileErrors, setFotoFileErrors] = useState("");

    const paises = paramsByMaestro[12] || [];
    const ciudades = paramsByMaestro[13] || [];
    const idiomas = paramsByMaestro[15] || [];
    const nivelesIdioma = paramsByMaestro[16] || [];
    const habilidadesTecnicas = paramsByMaestro[19] || [];
    const habilidadesBlandas = paramsByMaestro[20] || [];

    const ciudadesFiltradas = selectedCountry
        ? ciudades.filter((ciudad) => ciudad.num2 === selectedCountry)
        : [];

    const { loading: loadingAddPostulante, fetch: addPostulante, } = useApi<BaseResponseFMI, AddPostulanteParams>(addPostulanteService, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const {
        loading: loadingAddTalent,
        fetch: postTalent,
    } = useApi<InsertUpdateResponse, AddTalentParams>(addTalent, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: false, enqueueSnackbar: enqueueSnackbar })
    },
    );

    const { register, handleSubmit, setValue, control, clearErrors, formState: { errors }, reset } = useForm<AddPostulanteType>({
        resolver: zodResolver(AddPostulanteSchema),
        mode: "onChange",
        defaultValues: {
            montoInicialPlanilla: 0,
            montoFinalPlanilla: 0,
            montoInicialRxH: 0,
            montoFinalRxH: 0,
            idMoneda: 0,
        }
    });

    const onSubmit: SubmitHandler<AddPostulanteType> = async (data) => {
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

        const { codigoPais, telefono, experiencias, educaciones, cv, foto, idMoneda, ...filterData } = data;
        const phone = countryCode.current?.textContent + ' ' + telefono.trim();

        const cleanExperiencias = experiencias.map((exp) => ({
            ...exp,
            flActualidad: exp.flActualidad ? 1 : 0,
            fechaFin: exp.flActualidad ? null : exp.fechaFin,
        }));

        const cleanEducaciones = educaciones.map((edu) => ({
            ...edu,
            flActualidad: edu.flActualidad ? 1 : 0,
            fechaFin: edu.flActualidad ? null : edu.fechaFin,
        }));

        try {
            const cvBase64 = await Utils.fileToBase64(cvFile!);
            const fotoBase64 = await Utils.fileToBase64(fotoFile!);

            const cleanData: AddTalentParams = {
                telefono: phone,
                idMoneda: (data.idMoneda === 0 || data.idMoneda === undefined) ? null : data.idMoneda,
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

            // Save talent data in BDT
            postTalent(cleanData).then((response) => {
                // on success register postulante in FMI
                if (response.data.idMensaje === 2) {
                    const idTalent = response.data.idNuevo;
                    const ubicacion = `${paises.find((item) => item.num1 === data.idPais)?.string1}, ${ciudades.find((item) => item.num1 === data.idCiudad)?.string1}`;

                    if (idTalent) {
                        addPostulante({
                            idTalento: idTalent,
                            nombres: data.nombres,
                            apellidoPaterno: data.apellidoPaterno,
                            apellidoMaterno: data?.apellidoMaterno || "",
                            telefono: data.telefono,
                            dni: data?.dni || "",
                            email: data.email,
                            tiempoContrato: null,
                            idTiempoContrato: null,
                            fechaInicioLabores: null,
                            cargo: data.puesto,
                            remuneracion: null,
                            idMoneda: (data.idMoneda === 0 || data.idMoneda === undefined) ? null : data.idMoneda,
                            idModalidad: null,
                            ubicacion: ubicacion,
                        }).then((response) => {
                            if (response.data.idTipoMensaje === 2) {
                                localStorage.removeItem("tempToken");
                                localStorage.removeItem("authToken");
                                registerRef.current = true;
                                reset();

                                // Restablecer las secciones dinámicas
                                setTechnicalSkills([{ ...initialTechnicalSkill }]);
                                setSoftSkills([{ ...initialSoftSkill }]);
                                setExperiences([{ ...initialExperience }]);
                                setEducations([]);
                                setLanguages([]);

                                // Restablecer los archivos
                                setCvFile(null);
                                setFotoFile(null);

                                // Restablecer los países y ciudades seleccionados
                                setSelectedCountry(0);
                                setSelectedCity(0);
                                setSelectedCountryPhone(0);
                            }
                        });
                    }
                }
            });
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
        setValue(`experiencias`, newExperiences);
        clearErrors(`experiencias`);
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
    const handleFileChange = (field: keyof AddPostulanteType, file: File | null) => {
        if (field === "cv") {
            setCvFile(file);
        } else if (field === "foto") {
            setFotoFile(file);
        }
    };

    return (
        <>
            {(loadingAddPostulante || loadingAddTalent || loadingParams) && <Loading opacity="opacity-60" />}
            <div className="relative min-h-screen p-4 bg-gray-50 overflow-hidden flex items-center justify-center">
                {/* Background geometric elements */}
                <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-[#FAAB34]/10"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#0B85C3]/10 rounded-lg rotate-12"></div>
                <div className="absolute top-1/4 -right-16 w-32 h-32 bg-[#FAAB34]/10 rotate-45"></div>

                <div className="relative max-w-3xl w-full mx-auto">
                    {/* Form container with integrated bottom border */}
                    <div className="relative pb-2">
                        <div className="border border-gray-200 border-b-0 rounded-t-lg shadow-sm p-8 bg-white relative z-10">
                            <div className="flex justify-center">
                                <img src="/assets/fractal-logo-BDT.png" alt="fractal logo" />
                            </div>
                            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
                                Registro de Postulante
                                <span className="block mx-auto mt-2 w-24 h-1 bg-[#0B85C3] rounded-full"></span>
                            </h2>

                            <p className="text-center text-gray-600 mb-8">Complete sus datos personales para postular</p>

                            <form className="" onSubmit={handleSubmit(onSubmit)}>
                                <div className="px-8 overflow-y-auto w-full md:h-[70vh]">
                                    {/* files */}
                                    <div>
                                        <h3 className="text-[#3f3f46] text-lg">Curriculum Vitae</h3>
                                        <FileInput<AddPostulanteType>
                                            register={register}
                                            errors={errors}
                                            name="cv"
                                            initialText="Sube un archivo"
                                            acceptedTypes=".pdf"
                                            onChange={(file) => handleFileChange("cv", file)}
                                        />
                                        {cvFileErrors !== "" && (<p className="text-red-400 text-sm">{cvFileErrors}</p>)}
                                        <h3 className="text-[#3f3f46] text-lg">Foto de perfil</h3>
                                        <FileInput<AddPostulanteType>
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
                                            <label htmlFor="dni" className="text-[#636d7c] text-sm px-1">Doc. Identidad<span className="text-red-400">*</span></label>
                                            <input {...register("dni")} id="dni" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Documento de identidad" />
                                            {errors.dni && <p className="text-red-400 text-sm">{errors.dni.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="name" className="text-[#636d7c] text-sm px-1">Nombres<span className="text-red-400">*</span></label>
                                            <input {...register("nombres")} id="name" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Nombres" />
                                            {errors.nombres && <p className="text-red-400 text-sm">{errors.nombres.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="lastname-f" className="text-[#636d7c] text-sm px-1">Apellido paterno<span className="text-red-400">*</span></label>
                                            <input {...register("apellidoPaterno")} id="lastname-f" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Apellido paterno" />
                                            {errors.apellidoPaterno && <p className="text-red-400 text-sm">{errors.apellidoPaterno.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="lastname-s" className="text-[#636d7c] text-sm px-1">Apellido materno</label>
                                            <input {...register("apellidoMaterno")} id="lastname-s" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Apellido materno" />
                                            {errors.apellidoMaterno && <p className="text-red-400 text-sm">{errors.apellidoMaterno.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="countrycode" className="text-[#636d7c] text-sm px-1">Número de Celular<span className="text-red-400">*</span></label>
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
                                                <p ref={countryCode} className="rounded-l-lg border-l border-t border-b p-3 border-gray-300 bg-gray-100 flex items-center w-24">
                                                    {selectedCountryPhone ? `${paises.find((p) => p.num1 === selectedCountryPhone)?.string3 || "00"}` : "+00"}
                                                </p>
                                                <input {...register("telefono")} id="phone" type="text" className="p-3 border-gray-300 border rounded-r-lg w-full focus:outline-none focus:border-[#4F46E5]" />
                                            </div>
                                            {errors.telefono && <p className="text-red-400 text-sm">{errors.telefono.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="email" className="text-[#636d7c] text-sm px-1">Correo electrónico<span className="text-red-400">*</span></label>
                                            <input {...register("email")} type="email" id="email" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Correo electrónico" />
                                            {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="description" className="text-[#636d7c] text-sm px-1">Descripción<span className="text-red-400">*</span></label>
                                            <textarea {...register("descripcion")} id="description" className="border p-3 resize-none h-24 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Descripción"></textarea>
                                            {errors.descripcion && <p className="text-red-400 text-sm">{errors.descripcion.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="puestoAnt" className="text-[#636d7c] text-sm px-1">Puesto actual<span className="text-red-400">*</span></label>
                                            <input {...register("puesto")} id="puestoAnt" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Puesto actual" />
                                            {errors.puesto && <p className="text-red-400 text-sm">{errors.puesto.message}</p>}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="availability" className="text-[#636d7c] text-sm px-1">Disponibilidad<span className="text-red-400">*</span></label>
                                            <input {...register("disponibilidad")} id="availability" type="text" className="border p-3 rounded-lg focus:outline-none focus:border-[#4F46E5]" placeholder="Disponibilidad" />
                                            {errors.disponibilidad && <p className="text-red-400 text-sm">{errors.disponibilidad.message}</p>}
                                        </div>
                                    </div>
                                    {/* Location */}
                                    <div className="*:mb-4">
                                        <h3 className="text-[#3f3f46] text-lg my-5 font-semibold">Locación</h3>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="country" className="text-[#636d7c] text-sm px-1">País<span className="text-red-400">*</span></label>
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
                                            <label htmlFor="city" className="text-[#636d7c] text-sm px-1">Ciudad<span className="text-red-400">*</span></label>
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
                                    {/* Tech skills */}
                                    <TechSkillsSection<AddPostulanteType>
                                        register={register}
                                        errors={errors}
                                        fields={technicalSkills}
                                        habilidadesTecnicas={habilidadesTecnicas}
                                        onAdd={handleAddSkill}
                                        onRemove={handleRemoveSkill}
                                        handleChange={handleSkillChange}
                                    />
                                    {/* Soft skills */}
                                    <SoftSkillsSection<AddPostulanteType>
                                        register={register}
                                        errors={errors}
                                        fields={softSkills}
                                        habilidadesBlandas={habilidadesBlandas}
                                        onAdd={handleAddSoftSkill}
                                        onRemove={handleRemoveSoftSkill}
                                        handleChange={handleSoftSkillChange}
                                    />
                                    {/* Experience */}
                                    <ExperiencesSection<AddPostulanteType>
                                        register={register}
                                        errors={errors}
                                        fields={experiences}
                                        setValue={setValue}
                                        onAdd={handleAddExperience}
                                        onRemove={handleRemoveExperience}
                                        handleChange={handleExperienceChange}
                                    />
                                    {/* Education */}
                                    <EducationsSection<AddPostulanteType>
                                        register={register}
                                        errors={errors}
                                        fields={educations}
                                        setValue={setValue}
                                        onAdd={handleAddEducation}
                                        onRemove={handleRemoveEducation}
                                        handleChange={handleEducationChange}
                                    />
                                    {/* Languages */}
                                    <LanguagesSection<AddPostulanteType>
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

                                    <Controller
                                        name="tieneEquipo"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex flex-col gap-2 my-4">
                                                <label className="text-wrap max-w-[20rem]">
                                                    ¿Cuenta con equipo(PC o Laptop)? <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex items-center gap-6">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            className="form-radio h-4 w-4 text-[#0B85C3] focus:ring-[#0B85C3] cursor-pointer"
                                                            checked={field.value === true}
                                                            onChange={() => field.onChange(true)}
                                                        />
                                                        <span className="ml-2 text-gray-700">Sí</span>
                                                    </label>
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            className="form-radio h-4 w-4 text-[#0B85C3] focus:ring-[#0B85C3] cursor-pointer"
                                                            checked={field.value === false}
                                                            onChange={() => field.onChange(false)}
                                                        />
                                                        <span className="ml-2 text-gray-700">No</span>
                                                    </label>
                                                </div>
                                                {errors.tieneEquipo && (
                                                    <p className="text-sm text-red-600 mt-2">{errors.tieneEquipo.message}</p>
                                                )}
                                            </div>
                                        )}
                                    />

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={!isDirty || !isValid || registerRef.current}
                                            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-all duration-300
                                        ${(!isDirty || !isValid || registerRef.current)
                                                    ? 'btn-disabled'
                                                    : 'btn-blue'}`}
                                        >
                                            Registrarse
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Integrated bottom border */}
                        <div className="h-2 bg-gradient-to-r from-[#FAAB34] to-[#0B85C3] rounded-b-lg"></div>
                    </div>

                    {/* Additional geometric elements outside form */}
                    <div className="absolute -bottom-40 left-1/4 w-20 h-20 bg-[#0B85C3]/10 rounded-lg rotate-45"></div>
                    <div className="absolute top-1/3 -left-12 w-16 h-16 bg-[#FAAB34]/10 rotate-12"></div>
                </div>
            </div>
        </>
    );
}