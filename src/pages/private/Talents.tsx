import { Dashboard } from "./Dashboard";
import { Utils } from "../../core/utils";
import { useEffect, useRef, useState } from "react";
import { useModal } from "../../core/context/ModalContext";
import { Education, Experience, Feedback, Language, Talent } from "../../core/models";
import { Pagination, TalentCard, FeedbackCard, LanguageCard, OptionsButton, EducationCard, FilterDropDown, ExperienceCard, ModalsForTalentsPage } from '../../core/components';

export const Talents = () => {
    const { openModal } = useModal();
    const favouriteRef = useRef<HTMLDivElement>(null);
    const [talent, setTalent] = useState<Talent | null>(null);
    const [isFavouriteVisible, setFavouriteVisible] = useState(false);
    const [isTalentPanelVisible, setTalentPanelVisible] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    const handleDropdownToggle = (index: number) => {
        setOpenDropdown((prev) => (prev === index ? null : index));
    };

    const handleFavouriteToggle = () => {
        setFavouriteVisible((prev) => !prev);
    }

    const handleTalentSelection = (talent: Talent) => {
        setTalent(talent);

        if (window.innerWidth <= 678) {
            setTalentPanelVisible((prev) => !prev);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 678) {
                setTalentPanelVisible(true);
            } else {
                setTalentPanelVisible(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (favouriteRef.current && !favouriteRef.current.contains(event.target as Node)) {
                setFavouriteVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const talents: Talent[] = [
        {
            name: 'Kelvin Huanca Arcos',
            profession: 'UX/UI Designer',
            location: 'Lima, Perú',
            salaryRxHInit: 5000,
            salaryRxHEnd: 8000,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 7000,
            rating: 0, // 0 to 5 stars
            image: '',
        },
        {
            name: 'Mariana Torres',
            profession: 'Frontend Developer',
            location: 'Buenos Aires, Argentina',
            salaryRxHInit: 0,
            salaryRxHEnd: 10000,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 9000,
            rating: 4, // 0 to 5 stars
            image: '',
        },
        {
            name: 'Jorge Ramirez',
            profession: 'Backend Developer',
            location: 'Santiago, Chile',
            salaryRxHInit: 0,
            salaryRxHEnd: 12000,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 11000,
            rating: 5, // 0 to 5 stars
            image: '',
        },
        {
            name: 'Carlos Pérez',
            profession: 'Backend Developer',
            location: 'Mexico City, Mexico',
            salaryRxHInit: 0,
            salaryRxHEnd: 12000,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 11000,
            rating: 4.5, // 0 to 5 stars
            image: '',
        },
        {
            name: 'Lucia González',
            profession: 'UI/UX Designer',
            location: 'Madrid, Spain',
            salaryRxHInit: 0,
            salaryRxHEnd: 9500,
            salaryPlanillaInit: 0,
            salaryPlanillaEnd: 8500,
            rating: 4.8, // 0 to 5 stars
            image: '',
        }
    ];

    const dropdowns: {
        name: string;
        label: string;
        options: string[];
        optionsType: "checkbox" | "radio";
        optionsPanelSize: string;
        inputPosition: "left" | "right";
    }[] = [
            {
                name: "habilidades",
                label: "Habilidades",
                options: ["Frontend", "Backend", "Asistente de marketing/Intérprete"],
                optionsType: "checkbox",
                optionsPanelSize: "w-72",
                inputPosition: "left",
            },
            {
                name: "nivelIngles",
                label: "Nivel de inglés",
                options: ["Básico", "Intermedio", "Avanzado"],
                optionsType: "radio",
                optionsPanelSize: "w-32",
                inputPosition: "right",
            },
            {
                name: "favoritos",
                label: "Favoritos",
                options: ["Favoritos", "Seniors"],
                optionsType: "radio",
                optionsPanelSize: "w-32",
                inputPosition: "right",
            },
        ];

    const educationData: Education =
    {
        idEducation: 1,
        image: '',
        entityName: 'University of XYZ',
        description: 'Bachelor of Science in Computer Science',
        startYear: 2015,
        endYear: 2019,
    };

    const experienceData: Experience =
    {
        idExperience: 1,
        image: '',
        entityName: 'University of XYZ',
        description: 'Bachelor of Science in Computer Science',
        startYear: 2015,
        endYear: 2019,
    };

    const languageData: Language = {
        idLanguage: 1,
        languageName: 'English',
        languageCode: 'EN',
        idProficiency: 3,
        proficiency: 'Advanced',
        starCount: 3,
    };

    const feedbackData: Feedback = {
        image: '',
        user: 'John Doe',
        feedback: 'This is a fantastic product! I am really satisfied with the quality and performance.',
        stars: 4,
    };

    return (
        <div className="relative">
            <Dashboard>
                <ModalsForTalentsPage />
                <div className="py-3 px-4 2xl:px-[155px] overflow-x-hidden">
                    {/* Options section */}
                    <div className="flex flex-col-reverse sm:flex-row w-full lg:h-12 items-center sm:justify-between gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-7 w-full sm:w-1/3">
                            <button
                                type="button"
                                className="w-full xl:w-fit flex items-center whitespace-nowrap gap-1 py-2 px-3 border border-[#3b82f6] hover:bg-blue-50 text-sm font-normal text-[#3b82f6] text-center rounded-lg">
                                <img src="/assets/ic_add.svg" alt="add talent icon" />
                                <span>Nuevo Talento</span>
                            </button>
                            <p className="text-sm text-[#71717A] hidden xl:block">{`${talents.length} resultados encontrados`}</p>
                        </div>
                        <div className="flex lg:flex-row flex-col-reverse items-center w-full sm:w-2/3 gap-4 lg:gap-12 lg:h-12">
                            {/* Filters */}
                            <div className="flex flex-row flex-grow justify-between lg:justify-around lg:gap-4 items-center w-full">
                                {dropdowns.map((dropdown, index) => (
                                    <FilterDropDown
                                        key={index}
                                        {...dropdown}
                                        isOpen={openDropdown === index}
                                        onToggle={() => handleDropdownToggle(index)}
                                    />
                                ))}
                            </div>
                            {/* Search */}
                            <div className="flex items-center justify-between w-full gap-4">
                                <div className="flex relative h-10 w-11/12">
                                    <img src="/assets/ic_search.svg" alt="search icon" className="absolute top-2 left-3" />
                                    <input type="text" placeholder="Buscar por talento o puesto" className="text-sm w-full rounded-full ps-10 pe-4 border-2 focus:outline-none focus:border-[#4F46E5]" />
                                </div>
                                <button type="button" className="bg-[#009695] hover:bg-[#2d8d8d] rounded-lg focus:outline-none text-white py-2 px-4 font-normal text-normal">Buscar</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex mt-4 gap-4 h-[calc(100vh-250px)] lg:h-[calc(100vh-200px)]">
                        {/* Talents list */}
                        <div className="flex flex-col w-full md:w-1/3">
                            <div className="*:mb-2 h-[calc(100vh-230px)] overflow-y-auto overflow-x-hidden border rounded-lg md:border-none">
                                {talents.map((talent, index) => (
                                    <TalentCard
                                        key={index}
                                        talent={talent}
                                        selectTalent={() => handleTalentSelection(talent)} />
                                ))}
                            </div>
                            {/* Pagination */}
                            <div>
                                <Pagination
                                    totalItems={talents.length + 25}
                                    itemsPerPage={5}
                                    onPaginate={() => { }}
                                />
                            </div>
                        </div>
                        {/* Talent details */}
                        <div className={`border-2 shadow-xl rounded-lg md:w-2/3 absolute top-0 left-0 z-10 w-full bg-white md:relative md:top-auto md:left-auto ${!isTalentPanelVisible ? "hidden" : ""}`}>
                            {talent && (
                                <div className="flex flex-col px-8 md:pt-8 overflow-y-scroll overflow-x-hidden h-full lg:h-[calc(100vh-205px)]">
                                    <button type="button" onClick={() => setTalentPanelVisible(false)} className="w-fit px-4 py-2 rounded-xl bg-[#e4e4e7] flex gap-4 md:hidden justify-end items-center my-4">
                                        <img src="/assets/ic_go_back.svg" alt="icon close" className="h-6 w-6" />
                                        <p className="text-[#2e2e2e]">Volver</p>
                                    </button>
                                    {/* Talent main info */}
                                    <div className="flex flex-col sm:flex-row items-center w-full justify-between">
                                        <div className="flex gap-10 sm:h-28">
                                            <div className="relative">
                                                <img src={talent.image ? talent.image : "/assets/ic_no_image.svg"} alt="Foto Perfil Talento" className="h-24 w-24 rounded-full border" />
                                                <button
                                                    type="button"
                                                    onClick={() => openModal("modalEditPhoto")}
                                                    className="absolute bottom-4 -right-2 h-9 w-9 bg-white shadow-lg rounded-full p-2 hover:bg-zinc-50">
                                                    <img src="/assets/ic_edit.svg" alt="edit icon" className="opacity-40 hover:opacity-100" />
                                                </button>
                                            </div>
                                            <div>
                                                <div className="flex gap-2 items-center h-5">
                                                    <p className="text-base">{talent.name}</p>
                                                    <button
                                                        type="button"
                                                        onClick={handleFavouriteToggle}
                                                        className="p-1 bg-white rounded-full hover:shadow-lg transition-all duration-200 relative">
                                                        <img src="/assets/ic_outline_heart.svg" alt="icon favourite" className="h-5 w-5" />
                                                        {/* Favourite panel */}
                                                        <div
                                                            ref={favouriteRef}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`w-72 absolute p-5 flex-col gap-2 border border-gray-50 shadow-lg bg-white rounded-lg left-5 z-20 ${isFavouriteVisible ? "flex" : "hidden"}`}>
                                                            <input type="text" className="text-[#3f3f46] p-2 border-gray-300 border rounded-lg w-full focus:outline-none focus:border-[#4F46E5]" />
                                                            <button type="button" className="p-2 text-white bg-[#009695] hover:bg-[#2d8d8d] rounded-lg w-full focus:outline-none">Crear Favorito</button>
                                                            <select name="favs" id="favs" className="text-[#3f3f46] p-2 w-full border boder-gray-300 rounded-lg focus:outline-none cursor-pointer">
                                                                <option value="0">Elegir favorito</option>
                                                                <option value="fav-1">Favs</option>
                                                            </select>
                                                        </div>
                                                    </button>

                                                </div>
                                                <p className="text-sm text-[#71717A] flex items-end my-1 h-5">
                                                    <img src="/assets/ic_location.svg" alt="location icon" className="h-5 w-5" />
                                                    {talent.location}
                                                </p>
                                                <div className="text-sm text-[#71717A] flex items-center gap-2 h-5 mt-4 mb-2 xl:m-0">
                                                    <div className="flex flex-col xl:flex-row xl:flex-wrap xl:gap-1">
                                                        <p>
                                                            {`RxH S/. ${talent.salaryRxHInit} - ${talent.salaryRxHEnd}`}
                                                        </p>
                                                        <p className="hidden xl:block">|</p>
                                                        <p>{`Planilla S/. ${talent.salaryPlanillaInit} - ${talent.salaryPlanillaEnd}`}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal("modalSalary")}
                                                        className="hover:rounded-full hover:shadow-inner px-2">
                                                        <img src="/assets/ic_edit.svg" alt="icon edit" className="h-4 w-4 mb-1 opacity-40 hover:opacity-80" />
                                                    </button>
                                                </div>
                                                <div className="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
                                                    <div className="flex gap-2 my-2">
                                                        {Utils.getStars(talent.rating)}
                                                    </div>
                                                    {talent.rating <= 0 && (<p className="text-sm text-[#71717A]">Ningún feedback Registrado</p>)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col xl:flex-row gap-24 sm:gap-2 xl:gap-10 justify-self-end sm:h-28 my-4 sm:my-0">
                                            {/* CV */}
                                            <OptionsButton
                                                options={["CV", "CV Fractal"]}
                                                onSelect={() => openModal('modalCv')}
                                                buttonLabel="Ver CV"
                                                buttonStyle="w-36 py-2 px-4 bg-white text-[#3b82f6] rounded-lg focus:outline-none hover:bg-[#f5f9ff]"
                                            />
                                            {/* Contact */}
                                            <div className="flex flex-col gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => openModal('modalContact')}
                                                    className="flex items-center w-36 bg-[#009695] hover:bg-[#2d8d8d] rounded-lg focus:outline-none text-white px-4 py-2 gap-2">
                                                    <img src="/assets/ic_phone.svg" alt="icon contact" className="h-5 w-5" />
                                                    Contactar
                                                </button>
                                                <div className="flex gap-4 justify-center items-end">
                                                    <a href="/#">
                                                        <img src="/assets/ic_github.svg" alt="icon github" className="h-6 w-6 mb-1 opacity-40 hover:opacity-80" />
                                                    </a>
                                                    <a href="/#">
                                                        <img src="/assets/ic_linkedin.svg" alt="icon linkedin" className="h-8 w-8 opacity-40 hover:opacity-80" />
                                                    </a>
                                                    <button type="button" onClick={() => openModal("modalSocialMedia")}>
                                                        <img src="/assets/ic_edit.svg" alt="icon edit" className="h-6 w-6 mb-1 opacity-40 hover:opacity-80" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* File upload */}
                                    <div className="flex flex-col sm:flex-row items-center w-full justify-between gap-4">
                                        <p className="text-[#609af8] text-justify"> Sube tu certificado, diploma o algún archivo que respalde tus aptitudes. </p>
                                        <div className="rounded-lg overflow-hidden max-w-xl my-4 sm:my-0">
                                            <div className="w-full sm:py-12">
                                                <div className="relative h-32 rounded-lg bg-gray-50 flex justify-center items-center hover:bg-gray-100">
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
                                    {/* Skills */}
                                    <div className="flex flex-col sm:flex-row w-full">
                                        {/* Technical */}
                                        <div className="flex flex-col gap-4 sm:w-1/2 my-2 sm:my-0">
                                            <div className="flex items-center gap-4 h-6">
                                                <p className="text-[#52525B] font-semibold">Habilidades Técnicas</p>
                                                <button
                                                    type="button"
                                                    onClick={() => openModal("modalTechSkills")}
                                                    className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                    <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5"
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <p className="text-[#0b85c3] text-sm bg-[#f5f9ff] px-3 rounded-full font-semibold py-1">UX/UI</p>
                                            </div>
                                        </div>
                                        {/* Soft */}
                                        <div className="flex flex-col gap-4 sm:w-1/2 my-2 sm:my-0">
                                            <div className="flex items-center gap-4 h-6">
                                                <p className="text-[#52525B] font-semibold">Habilidades Blandas</p>
                                                <button
                                                    type="button"
                                                    onClick={() => openModal("modalSoftSkills")}
                                                    className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                    <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5"
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <p className="text-[#c11574] text-sm bg-[#fef6fa] px-3 rounded-full font-semibold py-1">Responsabilidad</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Description */}
                                    <div className="flex flex-col py-8 w-full gap-4">
                                        <h2 className="text-[#52525B] font-semibold my-2">Resumen profesional</h2>
                                        <div className="flex gap-4 items-center">
                                            <p className="text-justify text-[#71717A] text-sm w-fit">
                                                Soy un Ingeniero de Sistemas titulado y colegiado, actualmente finalizando una maestría en Negocios
                                                Digitales con un enfoque en el diseño y análisis de arquitecturas híbridas y en la nube, particularmente
                                                en plataformas como AWS, Azure y GCP. Mi orientación está fuertemente dirigida hacia la optimización
                                                de costos(FinOps), y poseo un conocimiento amplio en la administración de la mayoría de los servicios
                                                de AWS. Además, cuento con habilidades blandas significativas para liderar equipos de administración
                                                de infraestructura, aplicando eficientemente la metodología SCRUM y Kanban sobre herramientas Jira y
                                                Azure DevOps.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalSummary")}
                                                className="bg-white hover:shadow-lg hover:rounded-full hover:bg-zinc-50 w-5">
                                                <img src="/assets/ic_edit.svg" alt="edit icon" className="opacity-40 hover:opacity-100" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Availability */}
                                    <div className="flex flex-col pb-8 justify-center">
                                        <h2 className="text-[#52525B] font-semibold my-2">Dispinobilidad</h2>
                                        <p className="text-[#71717A] text-sm flex gap-2 items-center">
                                            Inmediata
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalAvailability")}
                                                className="bg-white hover:shadow-lg hover:rounded-full hover:bg-zinc-50 w-5">
                                                <img src="/assets/ic_edit.svg" alt="edit icon" className="opacity-40 hover:opacity-100" />
                                            </button>
                                        </p>
                                    </div>
                                    {/* Experience */}
                                    <div className="flex flex-col">
                                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                                            Experiencia
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalExperience")}
                                                className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                <img src="/assets/ic_add_dark.svg" alt="add exp tech" className="w-5 h-5" />
                                            </button>
                                        </h2>
                                        <div className="flex flex-col">
                                            <ExperienceCard data={experienceData} />
                                            <ExperienceCard data={experienceData} />
                                            <ExperienceCard data={experienceData} />
                                        </div>
                                    </div>
                                    {/* Education */}
                                    <div className="flex flex-col">
                                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                                            Educación
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalEducation")}
                                                className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                            </button>
                                        </h2>
                                        <div className="flex flex-col">
                                            <EducationCard data={educationData} />
                                            <EducationCard data={educationData} />
                                            <EducationCard data={educationData} />
                                        </div>
                                    </div>
                                    {/* Language */}
                                    <div className="flex flex-col">
                                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                                            Idiomas
                                            <button
                                                type="button"
                                                onClick={() => openModal("modalLanguage")}
                                                className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                            </button>
                                        </h2>
                                        <div className="flex flex-col">
                                            <LanguageCard data={languageData} />
                                            <LanguageCard data={languageData} />
                                            <LanguageCard data={languageData} />
                                        </div>
                                    </div>
                                    {/* Feedback */}
                                    <div className="flex flex-col">
                                        <h2 className="text-[#52525B] font-semibold my-2">
                                            Feedback
                                        </h2>
                                        <div className="flex flex-col">
                                            <FeedbackCard data={feedbackData} />
                                            <FeedbackCard data={feedbackData} />
                                            <FeedbackCard data={feedbackData} />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => openModal("modalFeedback")}
                                            className="text-[#52525B] text-sm rounded-lg my-2 p-2 hover:text-[#27272A] hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.05)] flex items-center gap-2 w-fit">
                                            <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                            Dar nuevo feedback
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Dashboard>
        </div>
    );
}