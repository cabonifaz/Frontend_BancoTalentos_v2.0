import { Dashboard } from "./Dashboard";
import { Utils } from "../../core/utilities/utils";
import { useEffect, useRef, useState } from "react";
import { useModal } from "../../core/context/ModalContext";
import { useNavigate } from "react-router-dom";
import { getTalent, getTalents } from "../../core/services/apiService";
import { useSnackbar } from "notistack";
import { handleError, handleResponse } from "../../core/utilities/errorHandler";
import { useApi } from "../../core/hooks/useApi";
import { Education, Experience, Feedback, Language, Talent, TalentParams, TalentResponse, TalentsResponse } from "../../core/models";
import {
    Pagination,
    TalentCard,
    FeedbackCard,
    LanguageCard,
    OptionsButton,
    EducationCard,
    FilterDropDown,
    ExperienceCard,
    ModalsForTalentsPage,
    FavouriteButton,
    SkeletonCard,
    Loading,
    TalentDetailsSkeleton
} from '../../core/components';
import { useParams } from "../../core/context/ParamsContext";
import { useFavouritesContext } from "../../core/context/FavouritesContext";
import { MODALIDAD_RXH } from "../../core/utilities/constants";

export const Talents = () => {
    const navigate = useNavigate();
    const { openModal } = useModal();
    const { enqueueSnackbar } = useSnackbar();
    const [currentPage, setCurrentPage] = useState(1);
    const [talent, setTalent] = useState<Talent | null>(null);
    const [isTalentPanelVisible, setTalentPanelVisible] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const experienceRef = useRef<Experience | null>(null);
    const educationRef = useRef<Education | null>(null);
    const languageRef = useRef<Language | null>(null);
    const feedbackRef = useRef<Feedback | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
    const [selectedEnglishLevel, setSelectedEnglishLevel] = useState<number | null>(null);
    const [selectedFavourites, setSelectedFavourites] = useState<number | null>(null);

    const { paramsByMaestro, loading: loadingParams } = useParams("12,13,2,19,20,15,16,32");
    const { favourites: favouritesData, fetchFavourites } = useFavouritesContext();

    const {
        loading: loadingTalents,
        data: talentsData,
        setData: setTalentsData,
        fetch: fetchTalents,
    } = useApi<TalentsResponse, TalentParams>(getTalents, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: false, enqueueSnackbar: enqueueSnackbar }),
    });

    const {
        loading: loadingTalentDets,
        data: talentDets,
        fetch: fetchTalentDets,
    } = useApi<TalentResponse, number>(getTalent, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: false, enqueueSnackbar: enqueueSnackbar }),
    });

    const goToAddTalent = () => navigate("/dashboard/nuevo-talento");
    const handlePaginate = (page: number) => setCurrentPage(page);

    const handleTalentSelection = (talent: Talent) => {
        setTalent(talent);
        if (window.innerWidth > 678) return;
        setTalentPanelVisible((prev) => !prev);
    };

    const handleSearch = (englishLevel?: number | null, favourites?: number | null) => {
        const searchValue = searchInputRef.current?.value || "";

        const finalEnglishLevel = englishLevel !== undefined ? englishLevel : selectedEnglishLevel;
        const finalFavourites = favourites !== undefined ? favourites : selectedFavourites;

        fetchTalents({
            nPag: 1,
            search: searchValue,
            techAbilities: selectedSkills.join(","),
            idEnglishLevel: finalEnglishLevel || undefined,
            idTalentCollection: finalFavourites || undefined,
        });
    };

    // update local data on success tanlent update
    // when data doesn't come in fetchTalent
    // updates in details and list
    const handleTalentUpdate = (id: number, fields: Partial<Talent>) => {
        if (!talentsData) return;

        const updatedTalents = talentsData?.talents.map(talento =>
            talento.idTalento === id ? { ...talento, ...fields } : talento
        );

        setTalentsData({
            ...talentsData,
            talents: updatedTalents,
        });

        setTalent(updatedTalents.find(talento => talento.idTalento === id) || null);
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
        fetchFavourites();
    }, [fetchFavourites]);

    useEffect(() => {
        fetchTalents({ nPag: currentPage });
    }, [currentPage, fetchTalents]);

    useEffect(() => {
        const id = talent?.idTalento;

        if (id) {
            fetchTalentDets(id);
        }

    }, [fetchTalentDets, talent?.idTalento])

    const handleOpenModal = <T,>(modalId: string, ref: React.MutableRefObject<T | null>, itemToEdit?: T) => {
        ref.current = itemToEdit || null;
        openModal(modalId);
    };

    const handleEnglishLevelChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedEnglishLevel(newValue);
        handleSearch(newValue, undefined);
    };

    const handleFavouritesChangeFilter = (selectedValues: string[]) => {
        const newValue = selectedValues[0] ? Number(selectedValues[0]) : null;
        setSelectedFavourites(newValue);
        handleSearch(undefined, newValue);
    };

    if (loadingParams) return <Loading />;

    return (
        <div className="relative">
            <Dashboard>
                <ModalsForTalentsPage
                    talent={talent || undefined}
                    talentDet={talentDets || undefined}
                    experienceRef={experienceRef}
                    educationRef={educationRef}
                    languageRef={languageRef}
                    feedbackRef={feedbackRef}
                    fetchTalentDets={fetchTalentDets}
                    updateTalentList={handleTalentUpdate}
                />
                <div className="py-3 px-4 2xl:px-[155px] overflow-x-hidden">
                    {/* Options section */}
                    <div className="flex flex-col-reverse sm:flex-row w-full lg:h-12 items-center sm:justify-between gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-7 w-full sm:w-1/3">
                            <button
                                type="button"
                                onClick={goToAddTalent}
                                className="w-full xl:w-fit flex items-center whitespace-nowrap gap-1 btn btn-outline-blue">
                                <img src="/assets/ic_add.svg" alt="add talent icon" />
                                <span> Nuevo Talento</span>
                            </button>
                            <p className="text-sm text-[#71717A] hidden xl:block">{`${talentsData?.total || 0} resultados encontrados`}</p>
                        </div>
                        <div className="flex lg:flex-row flex-col-reverse items-center w-full sm:w-2/3 gap-4 lg:gap-12 lg:h-12">
                            {/* Filters */}
                            <div className="flex flex-row flex-grow justify-between lg:justify-around lg:gap-4 items-center w-full">
                                <FilterDropDown
                                    name="habilidades"
                                    label="Habilidades"
                                    options={
                                        paramsByMaestro[19]?.map((param) => ({
                                            label: param.string1,
                                            value: param.num1.toString(),
                                        })) || []
                                    }
                                    optionsType="checkbox"
                                    optionsPanelSize="w-72"
                                    inputPosition="left"
                                    isOpen={openDropdown === 0}
                                    onToggle={() => setOpenDropdown(openDropdown === 0 ? null : 0)}
                                    selectedValues={selectedSkills.map(String)}
                                    onChange={(selectedValues) => setSelectedSkills(selectedValues.map(Number))}
                                />

                                <FilterDropDown
                                    name="nivelIngles"
                                    label="Nivel de inglés"
                                    options={
                                        paramsByMaestro[16]?.map((param) => ({
                                            label: param.string1,
                                            value: param.num1.toString(),
                                        })) || []
                                    }
                                    optionsType="radio"
                                    optionsPanelSize="w-36"
                                    inputPosition="right"
                                    isOpen={openDropdown === 1}
                                    onToggle={() => setOpenDropdown(openDropdown === 1 ? null : 1)}
                                    selectedValues={selectedEnglishLevel ? [selectedEnglishLevel.toString()] : []}
                                    onChange={handleEnglishLevelChangeFilter}
                                />

                                <FilterDropDown
                                    name="favoritos"
                                    label="Favoritos"
                                    options={
                                        favouritesData?.map((favourite) => ({
                                            label: favourite.nombreColeccion,
                                            value: favourite.idColeccion.toString(),
                                        })) ?? []
                                    }
                                    optionsType="radio"
                                    optionsPanelSize="w-32"
                                    inputPosition="right"
                                    isOpen={openDropdown === 2}
                                    onToggle={() => setOpenDropdown(openDropdown === 2 ? null : 2)}
                                    selectedValues={selectedFavourites ? [selectedFavourites.toString()] : []}
                                    onChange={handleFavouritesChangeFilter}
                                />
                            </div>
                            {/* Search */}
                            <div className="flex items-center justify-between w-full gap-4">
                                <div className="flex relative h-10 w-11/12">
                                    <img src="/assets/ic_search.svg" alt="search icon" className="absolute top-2 left-1 rounded-lg" />

                                    <input type="text" name="search" ref={searchInputRef} placeholder="Buscar por talento o puesto" className="input-search-container" />
                                </div>
                                <button type="button" onClick={() => handleSearch()} className="btn btn-primary">Buscar</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex mt-4 gap-4 h-[calc(100vh-250px)] lg:h-[calc(100vh-200px)]">
                        {/* Talents list */}
                        <div className="flex flex-col w-full md:w-1/3">
                            <div className="*:mb-2 h-[calc(100vh-230px)] overflow-y-auto overflow-x-hidden border rounded-lg md:border-none">
                                {loadingTalents ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <SkeletonCard key={index} />
                                    ))
                                ) : (
                                    (talentsData?.talents || []).map((talent, index) => (
                                        <TalentCard
                                            key={index}
                                            talent={talent}
                                            selectTalent={() => handleTalentSelection(talent)}
                                        />
                                    ))
                                )}
                            </div>
                            {/* Pagination */}
                            <div className="mt-2">
                                <Pagination
                                    totalItems={talentsData?.total || 0}
                                    itemsPerPage={5}
                                    currentPage={currentPage}
                                    onPaginate={handlePaginate}
                                />
                            </div>
                        </div>
                        {/* Talent details */}
                        <div className={`border-2 shadow-xl rounded-lg md:w-2/3 absolute top-0 left-0 z-10 w-full bg-white md:relative md:top-auto md:left-auto ${!isTalentPanelVisible ? "hidden" : ""}`}>
                            {loadingTalentDets ? <TalentDetailsSkeleton /> : (
                                <div>
                                    {talent && (
                                        <div className="flex flex-col px-4 md:pt-8 overflow-y-scroll overflow-x-hidden h-screen lg:h-[calc(100vh-205px)]">
                                            <button type="button" onClick={() => setTalentPanelVisible(false)} className="w-fit px-4 py-2 rounded-xl bg-[#e4e4e7] flex gap-4 md:hidden justify-end items-center my-4">
                                                <img src="/assets/ic_go_back.svg" alt="icon close" className="h-4 w-4 md:h-6 md:w-6" />
                                                <p className="text-[#2e2e2e]">Volver</p>
                                            </button>
                                            {/* Talent main info */}
                                            <div className="flex flex-col sm:flex-row items-center w-full justify-between">
                                                <div className="flex gap-10 sm:h-28">
                                                    <div className="relative">
                                                        <img src={Utils.getImageSrc(talent.imagen)} alt="Foto Perfil Talento" className="h-24 w-24 rounded-full border" />
                                                        <button
                                                            type="button"
                                                            onClick={() => openModal("modalEditPhoto")}
                                                            className="absolute bottom-4 -right-2 h-9 w-9 bg-white shadow-lg rounded-full p-2 hover:bg-zinc-50">
                                                            <img src="/assets/ic_edit.svg" alt="edit icon" className="opacity-40 hover:opacity-100" />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex gap-2 items-center w-fit">
                                                            <p className="text-base text-wrap">{`${talent.nombres} ${talent.apellidoPaterno} ${talent.apellidoMaterno}`}</p>
                                                            <FavouriteButton
                                                                idTalento={talent.idTalento}
                                                                isFavourited={talent.esFavorito}
                                                                onToggleFavorito={handleTalentUpdate}
                                                                idTalentoColecciones={talentDets?.idColeccion || []}
                                                            />
                                                        </div>
                                                        <p className="text-sm text-[#71717A] flex items-end my-1 w-fit">
                                                            <img src="/assets/ic_location.svg" alt="location icon" className="h-5 w-5" />
                                                            {`${talent.pais}, ${talent.ciudad}`}
                                                        </p>
                                                        <div className="text-sm text-[#71717A] flex items-center gap-2 my-2 xl:m-0">
                                                            <div className="flex flex-col xl:flex-row xl:flex-wrap xl:gap-1 w-fit">
                                                                {talent.idModalidadFacturacion === MODALIDAD_RXH ? (
                                                                    <p>{`RxH ${talent?.moneda || ""} ${talent.montoInicialRxH} - ${talent.montoFinalRxH}`}</p>
                                                                ) : (
                                                                    <p>{`Planilla ${talent?.moneda || ""} ${talent.montoInicialPlanilla} - ${talent.montoFinalPlanilla}`}</p>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => openModal("modalSalary")}
                                                                className="hover:rounded-full hover:shadow-inner px-2 flex-shrink-0">
                                                                <img src="/assets/ic_edit.svg" alt="icon edit" className="h-4 w-4 mb-1 opacity-40 hover:opacity-80" />
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
                                                            <div className="flex gap-2 my-2">
                                                                {Utils.getStars(talent.estrellas)}
                                                            </div>
                                                            {talent.estrellas <= 0 && (<p className="text-sm text-[#71717A] hidden lg:block">0 feedbacks</p>)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row sm:flex-col xl:flex-row gap-24 sm:gap-2 xl:gap-10 justify-self-end sm:h-28 my-4 sm:my-0">
                                                    {/* CV */}
                                                    <OptionsButton
                                                        options={["CV"]}
                                                        onSelect={() => openModal('modalCv')}
                                                        buttonLabel="Ver CV"
                                                        buttonStyle="btn btn-text"
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
                                                            <div className={`${talentDets?.github === "" || talentDets?.github === undefined ? "pointer-events-none" : ""}`}>
                                                                <a href={talentDets?.github} target="_blank" rel="noreferrer">
                                                                    <img src="/assets/ic_github.svg" alt="icon github" className="h-6 w-6 mb-1 opacity-40 hover:opacity-80" />
                                                                </a>
                                                            </div>
                                                            <div className={`${talentDets?.linkedin === "" || talentDets?.linkedin === undefined ? "pointer-events-none" : ""}`}>
                                                                <a href={talentDets?.linkedin} target="_blank" rel="noreferrer">
                                                                    <img src="/assets/ic_linkedin.svg" alt="icon linkedin" className="h-8 w-8 opacity-40 hover:opacity-80" />
                                                                </a>
                                                            </div>
                                                            <button type="button" onClick={() => openModal("modalSocialMedia")}>
                                                                <img src="/assets/ic_edit.svg" alt="icon edit" className="h-6 w-6 mb-1 opacity-40 hover:opacity-80" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* File upload */}
                                            <div className="flex flex-col md:flex-row items-center w-full justify-between gap-4 my-8">
                                                <p className="text-[var(--color-blue)] text-justify flex-grow">Sube tu certificado o diploma que respalde tus aptitudes.</p>
                                                <button
                                                    type="button"
                                                    className="rounded-lg overflow-hidden my-8 py-6 px-8 sm:my-0 bg-gray-50 hover:bg-gray-100 flex-grow"
                                                    onClick={() => openModal("modalUploadCert")}
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <img
                                                            alt="File Icon"
                                                            className="mb-3 w-8 h-8"
                                                            src="/assets/ic_upload.svg"
                                                        />
                                                        <span className="block text-[var(--color-blue)] font-normal mt-1">
                                                            Sube un archivo
                                                        </span>
                                                    </div>
                                                </button>
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
                                                        {(talentDets?.habilidadesTecnicas || []).map((item, index) => (
                                                            <p key={index} className="text-[var(--color-blue)] text-sm bg-[#f5f9ff] px-3 rounded-full font-semibold py-1">
                                                                {`${item.nombreHabilidad} ${item?.aniosExperiencia ? ` - (${item.aniosExperiencia})` : ""}`}
                                                            </p>
                                                        ))}
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
                                                        {(talentDets?.habilidadesBlandas || []).map((item, index) => (
                                                            <p key={index} className="text-[#c11574] text-sm bg-[#fef6fa] px-3 rounded-full font-semibold py-1">{item.nombreHabilidad}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Description */}
                                            <div className="flex flex-col py-8 w-full gap-4">
                                                <h2 className="text-[#52525B] font-semibold my-2">Resumen profesional</h2>
                                                <div className="flex gap-4 items-center">
                                                    <p className="text-justify text-[#71717A] text-sm w-fit">
                                                        {talentDets?.descripcion}
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
                                                    {talentDets?.disponibilidad}
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
                                                        onClick={() => handleOpenModal("modalExperience", experienceRef)}
                                                        className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                        <img src="/assets/ic_add_dark.svg" alt="add exp tech" className="w-5 h-5" />
                                                    </button>
                                                </h2>
                                                <div className="flex flex-col">
                                                    {(talentDets?.experiencias || []).map((item, index) => (
                                                        <ExperienceCard key={index} data={item} onEdit={() => handleOpenModal("modalExperience", experienceRef, item)} />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Education */}
                                            <div className="flex flex-col">
                                                <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                                                    Educación
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal("modalEducation", educationRef)}
                                                        className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                        <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                                    </button>
                                                </h2>
                                                <div className="flex flex-col">
                                                    {(talentDets?.educaciones || []).map((item, index) => (
                                                        <EducationCard key={index} data={item} onEdit={() => handleOpenModal("modalEducation", educationRef, item)} />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Language */}
                                            <div className="flex flex-col">
                                                <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                                                    Idiomas
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal("modalLanguage", languageRef)}
                                                        className="text-[#52525B] rounded-full p-1 hover:shadow-inner">
                                                        <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                                    </button>
                                                </h2>
                                                <div className="flex flex-col">
                                                    {(talentDets?.idiomas || []).map((item, index) => (
                                                        <LanguageCard key={index} data={item} onEdit={() => handleOpenModal("modalLanguage", languageRef, item)} />
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Feedback */}
                                            <div className="flex flex-col">
                                                <h2 className="text-[#52525B] font-semibold my-2">
                                                    Feedback
                                                </h2>
                                                <div className="flex flex-col">
                                                    {(talentDets?.feedback || []).map((item, index) => (
                                                        <FeedbackCard key={index} data={item} onEdit={() => handleOpenModal("modalFeedback", feedbackRef, item)} />
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenModal("modalFeedback", feedbackRef)}
                                                    className="text-[#52525B] text-sm rounded-lg my-2 p-2 hover:text-[#27272A] hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.05)] flex items-center gap-2 w-fit">
                                                    <img src="/assets/ic_add_dark.svg" alt="add skill soft" className="w-5 h-5" />
                                                    Dar nuevo feedback
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Dashboard>
        </div>
    );
}