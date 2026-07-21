import {
  ArrowLeft,
  Github,
  Linkedin,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Angry,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { Dashboard } from "./Dashboard";
import { Utils } from "../../core/utilities/utils";
import React, { useEffect, useRef, useState } from "react";
import { useModal } from "../../core/context/ModalContext";
import { useNavigate } from "react-router-dom";
import {
  getTalent,
  getTalents,
} from "../../core/services/apiService";
import { useSnackbar } from "notistack";
import {
  handleError,
  handleResponse,
} from "../../core/utilities/errorHandler";
import { useApi } from "../../core/hooks/useApi";
import {
  Education,
  Experience,
  Feedback,
  Language,
  Talent,
  TalentParams,
  TalentResponse,
  TalentsResponse,
} from "../../core/models";
import {
  Pagination,
  TalentCard,
  FeedbackCard,
  LanguageCard,
  OptionsButton,
  EducationCard,
  FileCard,
  FilterDropDown,
  ExperienceCard,
  ModalsForTalentsPage,
  FavouriteButton,
  SkeletonCard,
  Loading,
  TalentDetailsSkeleton,
} from "../../core/components";
import { CustomFilterDropDown } from "../../core/components/ui/CustomFilterDropDown";
import { SearchableSelect } from "../../core/components/ui/SearchableSelect";
import { useParams } from "../../core/context/ParamsContext";
import { useFavouritesContext } from "../../core/context/FavouritesContext";
import {
  MODAL_FRACTAL_CV,
  MODAL_UPDATE_WITH_CV,
} from "../../core/utilities/modalsIds";
import { useRemoveSkill } from "../../core/hooks/talents/useRemoveSkills";
import { useDownloadTalentFile } from "../../core/hooks/talents/useDownloadTalentFile";
import {
  ModalAddToBlacklist,
  MODAL_ADD_TO_BLACKLIST,
} from "../../core/components/modals/ModalAddToBlacklist";
import { useTalentBlacklistStatus } from "../../core/hooks/blacklist/useTalentBlacklistStatus";

export const Talents = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const [currentPage, setCurrentPage] = useState(1);
  const [talent, setTalent] = useState<Talent | null>(null);
  const [isTalentPanelVisible, setTalentPanelVisible] =
    useState(true);
  const [openDropdown, setOpenDropdown] = useState<number | null>(
    null,
  );
  const [yearsExperience, setYearsExperience] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [educationName, setEducationName] = useState("");
  const [selectedAcademicGrade, setSelectedAcademicGrade] = useState<
    number | null
  >(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const experienceRef = useRef<Experience | null>(null);
  const educationRef = useRef<Education | null>(null);
  const languageRef = useRef<Language | null>(null);
  const feedbackRef = useRef<Feedback | null>(null);

  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [selectedEnglishLevel, setSelectedEnglishLevel] = useState<
    number | null
  >(null);
  const [selectedFavourites, setSelectedFavourites] = useState<
    number | null
  >(null);

  const { paramsByMaestro, loading: loadingParams } = useParams();

  const skillOptions = paramsByMaestro[19] || [];
  const englishLevels = paramsByMaestro[16] || [];
  const academicGrades = paramsByMaestro[38] || [];

  const { favourites: favouritesData, fetchFavourites } =
    useFavouritesContext();
  const [cvLang, setCvLang] = useState<"ES" | "EN">("ES");

  const {
    loading: loadingTalents,
    data: talentsData,
    setData: setTalentsData,
    fetch: fetchTalents,
  } = useApi<TalentsResponse, TalentParams>(getTalents, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: false,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  const {
    loading: loadingTalentDets,
    data: talentDets,
    fetch: fetchTalentDets,
  } = useApi<TalentResponse, number>(getTalent, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: false,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  const { isLoading, removeTechnicalSkill, removeSoftSkill } =
    useRemoveSkill();

  // Estado de lista negra del talento abierto: pinta el icono y lista los
  // clientes de los que está restringido (global o específicos).
  const { isBlacklisted, restrictedClients, checkBlacklisted } =
    useTalentBlacklistStatus();

  const { downloadingId, downloadFile } = useDownloadTalentFile();

  const buildTalentParams = (
    nPag: number,
    overrides?: {
      englishLevel?: number | null;
      favourites?: number | null;
    },
  ): TalentParams => {
    const searchValue = searchInputRef.current?.value.trim() || "";

    const finalEnglishLevel =
      overrides?.englishLevel !== undefined
        ? overrides.englishLevel
        : selectedEnglishLevel;
    const finalFavourites =
      overrides?.favourites !== undefined
        ? overrides.favourites
        : selectedFavourites;

    return {
      nPag,
      search: searchValue || undefined,
      techAbilities: selectedSkills.length
        ? selectedSkills.join(",")
        : undefined,
      idEnglishLevel: finalEnglishLevel || undefined,
      idTalentCollection: finalFavourites || undefined,
      yearsExperience: yearsExperience
        ? Number(yearsExperience)
        : undefined,
      jobPosition: jobPosition || undefined,
      educationName: educationName.trim() || undefined,
      idAcademicGrade: selectedAcademicGrade || undefined,
    };
  };

  const fetchTalentPage = (
    page: number,
    overrides?: {
      englishLevel?: number | null;
      favourites?: number | null;
    },
  ) => {
    setCurrentPage(page);
    fetchTalents(buildTalentParams(page, overrides));
  };

  const handlePaginate = (page: number) => fetchTalentPage(page);

  const handleTalentSelection = (talent: Talent) => {
    setTalent(talent);
    if (window.innerWidth > 678) return;
    setTalentPanelVisible((prev) => !prev);
  };

  const handleSearch = (
    englishLevel?: number | null,
    favourites?: number | null,
  ) => {
    fetchTalentPage(1, {
      englishLevel,
      favourites,
    });
  };

  // update local data on success tanlent update
  // when data doesn't come in fetchTalent
  // updates in details and list
  const handleTalentUpdate = (
    id: number,
    fields: Partial<Talent>,
  ) => {
    if (!talentsData) return;

    // Talents list validated to avoid null errors
    const updatedTalents = talentsData?.talents?.map((talento) =>
      talento.idTalento === id ? { ...talento, ...fields } : talento,
    );

    setTalentsData({
      ...talentsData,
      talents: updatedTalents,
    });

    setTalent(
      updatedTalents.find((talento) => talento.idTalento === id) ||
        null,
    );
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
    const id = talent?.idTalento;

    if (id) {
      fetchTalentDets(id);
      checkBlacklisted(id);
    }
  }, [fetchTalentDets, checkBlacklisted, talent]);

  const handleOpenModal = <T,>(
    modalId: string,
    ref: React.MutableRefObject<T | null>,
    itemToEdit?: T,
  ) => {
    ref.current = itemToEdit || null;
    openModal(modalId);
  };

  const handleEnglishLevelChangeFilter = (
    selectedValues: string[],
  ) => {
    const newValue = selectedValues[0]
      ? Number(selectedValues[0])
      : null;
    setSelectedEnglishLevel(newValue);
    handleSearch(newValue, undefined);
  };

  const handleFavouritesChangeFilter = (selectedValues: string[]) => {
    const newValue = selectedValues[0]
      ? Number(selectedValues[0])
      : null;
    setSelectedFavourites(newValue);
    handleSearch(undefined, newValue);
  };

  const formatUrl = (url: string) => {
    if (!url || url.trim() === "") return null;
    // Remover protocolo existente si está presente
    const cleanUrl = url.replace(/^https?:\/\//, "");
    return `https://${cleanUrl}`;
  };

  const handleRemoveTechnicalSkill = async (
    technicalId: number,
    talentId: number,
  ) => {
    const rs = await removeTechnicalSkill(technicalId);

    if (!rs) {
      enqueueSnackbar({
        variant: "error",
        message: "No se obtuvo respuesta del servidor",
      });
      return;
    }

    const messageId = rs.idMensaje;
    const variant = messageId !== 2 ? "error" : "success";

    enqueueSnackbar({ variant: variant, message: rs?.mensaje });

    if (messageId === 2) fetchTalentDets(talentId);
  };

  const handleRemoveSoftSkill = async (
    targetId: number,
    talentId: number,
  ) => {
    const rs = await removeSoftSkill(targetId);

    if (!rs) {
      enqueueSnackbar({
        variant: "error",
        message: "No se obtuvo respuesta del servidor",
      });
      return;
    }

    const messageId = rs.idMensaje;
    const variant = messageId !== 2 ? "error" : "success";

    enqueueSnackbar({ variant: variant, message: rs?.mensaje });

    if (messageId === 2) fetchTalentDets(talentId);
  };

  const openFractalCVModal = (lang: "ES" | "EN") => {
    setCvLang(lang);
    openModal(MODAL_FRACTAL_CV);
  };

  useEffect(() => {
    Promise.all([fetchFavourites(), fetchTalents({ nPag: 1 })]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      {isLoading && <Loading opacity="opacity-70" />}
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
          cvLang={cvLang}
        />
        <ModalAddToBlacklist
          talent={talent}
          onRestricted={() =>
            talent && checkBlacklisted(talent.idTalento)
          }
        />
        <div className="flex h-full flex-col overflow-x-hidden">
          {/* Options section */}
          <div className="flex flex-col-reverse sm:flex-row w-full 2xl:min-h-12 items-center sm:justify-between gap-4">
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate("/dashboard/nuevo-talento")}
                className="flex-1 sm:flex-none xl:w-fit flex items-center whitespace-nowrap gap-1 btn btn-outline-blue"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Talento</span>
              </button>
              <p className="text-sm text-[#71717A] hidden xl:block whitespace-nowrap">{`${
                talentsData?.total || 0
              } resultados encontrados`}</p>
            </div>
            <div className="flex 2xl:flex-row flex-col-reverse items-center w-full flex-1 min-w-0 gap-4 2xl:gap-6">
              {/* Filters */}
              <div className="flex flex-row flex-wrap flex-grow justify-center gap-2 2xl:flex-nowrap 2xl:justify-around 2xl:gap-4 items-center w-full">
                <FilterDropDown
                  name="habilidades"
                  label="Habilidades"
                  options={
                    skillOptions.map((skill) => ({
                      label: skill.string1,
                      value: skill.num1.toString(),
                    })) || []
                  }
                  optionsType="checkbox"
                  optionsPanelSize="w-72"
                  inputPosition="left"
                  isOpen={openDropdown === 0}
                  searchable
                  onToggle={() =>
                    setOpenDropdown(openDropdown === 0 ? null : 0)
                  }
                  selectedValues={selectedSkills.map(String)}
                  onChange={(selectedValues) =>
                    setSelectedSkills(selectedValues.map(Number))
                  }
                />

                  <CustomFilterDropDown
                    label="Experiencia"
                    isOpen={openDropdown === 1}
                    onToggle={() =>
                      setOpenDropdown(openDropdown === 1 ? null : 1)
                    }
                    active={!!jobPosition || !!yearsExperience}
                    onClear={() => {
                      setJobPosition("");
                      setYearsExperience("");
                    }}
                  >
                    <div className="flex flex-col gap-4">

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                          Puesto
                        </label>

                        <input
                          type="text"
                          placeholder="Ej: Frontend Developer"
                          value={jobPosition}
                          onChange={(e) =>
                            setJobPosition(e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                          Años de experiencia
                        </label>

                        <input
                          type="number"
                          placeholder="Ej: 3"
                          value={yearsExperience}
                          onChange={(e) =>
                            setYearsExperience(e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                    </div>
                  </CustomFilterDropDown>

                  <CustomFilterDropDown
                    label="Educacion"
                    isOpen={openDropdown === 4}
                    onToggle={() =>
                      setOpenDropdown(openDropdown === 4 ? null : 4)
                    }
                    active={!!educationName || !!selectedAcademicGrade}
                    onClear={() => {
                      setEducationName("");
                      setSelectedAcademicGrade(null);
                    }}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                          Curso / Carrera / Diplomado
                        </label>

                        <input
                          type="text"
                          placeholder="Ej: Ingeniería de Sistemas"
                          value={educationName}
                          onChange={(e) =>
                            setEducationName(e.target.value)
                          }
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                          Grado académico
                        </label>

                        <SearchableSelect
                          placeholder="Selecciona un grado"
                          options={academicGrades.map((grade) => ({
                            label: grade.string1,
                            value: grade.num1,
                          }))}
                          value={selectedAcademicGrade ?? ""}
                          onChange={(value) =>
                            setSelectedAcademicGrade(
                              value === "" ? null : Number(value),
                            )
                          }
                        />
                      </div>
                    </div>
                  </CustomFilterDropDown>

                <FilterDropDown
                  name="nivelIngles"
                  label="Nivel de inglés"
                  options={
                    englishLevels.map((level) => ({
                      label: level.string1,
                      value: level.num1.toString(),
                    })) || []
                  }
                  optionsType="radio"
                  optionsPanelSize="w-36"
                  inputPosition="right"
                  isOpen={openDropdown === 2}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === 2 ? null : 2)
                  }
                  selectedValues={
                    selectedEnglishLevel
                      ? [selectedEnglishLevel.toString()]
                      : []
                  }
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
                  isOpen={openDropdown === 3}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === 3 ? null : 3)
                  }
                  selectedValues={
                    selectedFavourites
                      ? [selectedFavourites.toString()]
                      : []
                  }
                  onChange={handleFavouritesChangeFilter}
                />
              </div>
              {/* Search */}
              <div className="flex items-center justify-between w-full 2xl:w-[360px] 2xl:flex-shrink-0 gap-4">
                <div className="flex relative h-10 flex-1 min-w-0">
                  <Search className="absolute top-2 left-3" size={20} />

                  <input
                    type="text"
                    name="search"
                    ref={searchInputRef}
                    placeholder="Buscar por talento o puesto"
                    className="input-search-container"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="btn btn-primary flex-shrink-0"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
          <div className="flex mt-4 min-h-0 flex-1 gap-4">
            {/* Talents list */}
            <div className="flex flex-col w-full md:w-[340px] xl:w-[370px] flex-shrink-0 min-h-0">
              <div className="*:mb-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden border rounded-lg md:border-none">
                {loadingTalents
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <SkeletonCard key={index} />
                    ))
                  : (talentsData?.talents || []).map(
                      (talent, index) => (
                        <TalentCard
                          key={index}
                          talent={talent}
                          selectTalent={() =>
                            handleTalentSelection(talent)
                          }
                        />
                      ),
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
            <div
              className={`border-2 shadow-xl rounded-lg overflow-hidden flex-1 min-h-0 absolute top-0 left-0 z-[41] md:z-auto w-full bg-white md:relative md:top-auto md:left-auto ${
                !isTalentPanelVisible ? "hidden" : ""
              }`}
            >
              {loadingTalentDets ? (
                <TalentDetailsSkeleton />
              ) : (
                <div className="h-full">
                  {talent && (
                    <div className="flex flex-col px-4 pt-4 overflow-y-auto overflow-x-hidden h-screen md:h-full">
                      <button
                        type="button"
                        onClick={() => setTalentPanelVisible(false)}
                        className="w-fit px-4 py-2 rounded-xl bg-[#e4e4e7] flex gap-4 md:hidden justify-end items-center my-4"
                      >
                        <ArrowLeft className="h-4 w-4 md:h-6 md:w-6" />
                        <p className="text-[#2e2e2e]">Volver</p>
                      </button>
                      {/* Talent main info */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start w-full justify-between">
                        <div className="flex gap-10 sm:h-28">
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                            {talentDets?.photoUrl ||
                            talent.photoUrl ? (
                              <img
                                src={
                                  talentDets?.photoUrl ||
                                  talent.photoUrl
                                }
                                alt={`Foto de ${talent.nombres}`}
                                className="h-24 w-24 rounded-full border"
                              />
                            ) : (
                              <UserRound className="h-24 w-24 rounded-full border p-5 text-gray-300" />
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                openModal("modalEditPhoto")
                              }
                              className="absolute bottom-4 -right-2 h-9 w-9 bg-white shadow-lg rounded-full p-2 hover:bg-zinc-50"
                            >
                              <Pencil className="w-5 h-5 opacity-40 hover:opacity-100" />
                            </button>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                openModal("modalEditPersonal")
                              }
                              className="text-[var(--color-blue)]"
                            >
                              Editar perfil
                            </button>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex gap-2 items-center w-fit">
                              <p className="text-base text-wrap">{`ID: ${talent.idTalento} - ${talent.nombres} ${talent.apellidoPaterno} ${talent.apellidoMaterno}`}</p>
                              <FavouriteButton
                                idTalento={talent.idTalento}
                                isFavourited={talent.esFavorito}
                                onToggleFavorito={handleTalentUpdate}
                                idTalentoColecciones={
                                  talentDets?.idColeccion || []
                                }
                              />
                              <button
                                type="button"
                                title={
                                  isBlacklisted
                                    ? "Talento en lista negra"
                                    : "Agregar a lista negra"
                                }
                                onClick={() =>
                                  openModal(MODAL_ADD_TO_BLACKLIST)
                                }
                                className="p-1 bg-white rounded-full hover:shadow-lg transition-all duration-200 flex-shrink-0"
                              >
                                <Angry
                                  className={`h-5 w-5 ${
                                    isBlacklisted
                                      ? "fill-red-500 text-red-700"
                                      : "text-gray-500 hover:text-gray-800"
                                  }`}
                                />
                              </button>

                              {/* Clientes de los que está restringido; si son
                                  muchos, el tooltip nativo los muestra todos. */}
                              {restrictedClients.length > 0 && (
                                <div
                                  className="flex flex-wrap items-center gap-1"
                                  title={restrictedClients
                                    .map((c) => c.cliente)
                                    .join(", ")}
                                >
                                  {restrictedClients
                                    .slice(0, 3)
                                    .map((c) => (
                                      <span
                                        key={c.idCliente}
                                        className="max-w-[120px] truncate rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                                      >
                                        {c.cliente}
                                      </span>
                                    ))}
                                  {restrictedClients.length > 3 && (
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                      +{restrictedClients.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-[#71717A] flex items-end my-1 w-fit">
                              <MapPin className="h-5 w-5" />
                              {`${talent.pais}, ${talent.ciudad}`}
                            </p>
                            <p className="text-sm text-[#71717A] my-1 w-fit">
                              Procedencia:{" "}
                              <span className="text-[#3f3f46]">
                                {talentDets?.procedencia || "—"}
                              </span>
                            </p>
                            <div className="text-sm text-[#71717A] flex items-center gap-2 my-2 xl:m-0">
                              <div className="flex flex-col xl:flex-row xl:flex-wrap xl:gap-1 w-fit">
                                <p>
                                  {`RxH ${
                                    Utils.formatCoinByNum1(
                                      talent.idMonedaRxh,
                                    ).string3
                                  } `}
                                  {talent.montoInicialRxH.toFixed(2)}{" "}
                                  -{" "}
                                  {talent.montoInicialRxH.toFixed(2)}
                                </p>
                                <p>
                                  {`Planilla ${
                                    Utils.formatCoinByNum1(
                                      talent.idMonedaPlan,
                                    ).string3
                                  } `}
                                  {talent.montoInicialPlanilla.toFixed(
                                    2,
                                  )}{" "}
                                  -{" "}
                                  {talent.montoFinalPlanilla.toFixed(
                                    2,
                                  )}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  openModal("modalSalary")
                                }
                                className="hover:rounded-full hover:shadow-inner px-2 flex-shrink-0"
                              >
                                <Pencil className="h-4 w-4 mb-1 opacity-40 hover:opacity-80" />
                              </button>
                            </div>
                            <div className="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
                              <div className="flex gap-2 my-2">
                                {Utils.getStars(talent.estrellas)}
                              </div>
                              {talent.estrellas <= 0 && (
                                <p className="text-sm text-[#71717A] hidden lg:block">
                                  0 feedbacks
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col xl:flex-row gap-24 sm:gap-2 xl:gap-10 justify-self-end my-4 sm:my-0">
                          {/* CV */}
                          <OptionsButton
                            options={[
                              "CV",
                              "CV Fractal ESP",
                              "CV Fractal ENG",
                            ]}
                            onSelect={(value) => {
                              if (value === "CV") {
                                openModal("modalCv");
                              } else if (value === "CV Fractal ESP") {
                                openFractalCVModal("ES");
                              } else {
                                openFractalCVModal("EN");
                              }
                            }}
                            buttonLabel="Ver CVs"
                            buttonStyle="btn btn-text w-50"
                          />

                          {/* Contact */}
                          <div className="flex flex-col gap-4">
                            {/* Social networks */}
                            <div className="flex gap-4 justify-center items-end">
                              <div
                                className={`${
                                  !talentDets?.linkedin
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }`}
                              >
                                <a
                                  href={
                                    formatUrl(
                                      talentDets?.linkedin || "",
                                    ) || "#"
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) =>
                                    !talentDets?.linkedin &&
                                    e.preventDefault()
                                  }
                                >
                                  <Linkedin className="h-7 w-7 opacity-40 hover:opacity-80" />
                                </a>
                              </div>

                              <div
                                className={`${
                                  !talentDets?.github
                                    ? "pointer-events-none opacity-50"
                                    : ""
                                }`}
                              >
                                <a
                                  href={
                                    formatUrl(
                                      talentDets?.github || "",
                                    ) || "#"
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) =>
                                    !talentDets?.github &&
                                    e.preventDefault()
                                  }
                                >
                                  <Github className="h-5 w-5 mb-1 opacity-40 hover:opacity-80" />
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  openModal("modalSocialMedia")
                                }
                              >
                                <Pencil className="h-5 w-5 mb-1 opacity-40 hover:opacity-80" />
                              </button>
                            </div>

                            {/* Contactar */}
                            <button
                              type="button"
                              onClick={() =>
                                openModal("modalContact")
                              }
                              className="flex items-center w-36 bg-[#009695] hover:bg-[#2d8d8d] rounded-lg focus:outline-none text-white px-4 py-2 gap-2"
                            >
                              <Phone className="h-5 w-5" />
                              Contactar
                            </button>

                            {/* Actualizar Talento con IA */}
                            <button
                              type="button"
                              onClick={() =>
                                openModal(MODAL_UPDATE_WITH_CV)
                              }
                              className="flex items-center justify-center w-36 rounded-lg focus:outline-none text-white px-4 py-2 gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all duration-200"
                            >
                              <Sparkles className="h-5 w-5" />
                              Actualizar Talento con IA
                            </button>

                            {/* Sube un archivo del talento */}
                            <button
                              type="button"
                              onClick={() => openModal("modalUploadCert")}
                              className="flex items-center justify-center w-36 text-center rounded-lg focus:outline-none text-[var(--color-blue)] bg-gray-50 hover:bg-gray-100 px-4 py-2 gap-2"
                            >
                              <Upload className="h-5 w-5 shrink-0" />
                              Sube un archivo del talento
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Skills */}
                      <div className="flex flex-col sm:flex-row w-full">
                        {/* Technical */}
                        <div className="flex flex-col gap-4 sm:w-1/2 my-2 sm:my-0">
                          <div className="flex items-center gap-4 h-6">
                            <p className="text-[#52525B] font-semibold">
                              Habilidades Técnicas
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                openModal("modalTechSkills")
                              }
                              className="text-[#52525B] rounded-full p-1 hover:shadow-inner"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(
                              talentDets?.habilidadesTecnicas || []
                            ).map((item) => (
                              <div
                                key={item.idHabTec}
                                className="inline-flex items-center gap-1"
                              >
                                <p
                                  className="text-[var(--color-blue)] text-sm bg-[#f5f9ff] px-3 rounded-full font-semibold py-1"
                                >
                                  {`${item.nombreHabilidad} ${
                                    item?.aniosExperiencia
                                      ? ` - (${item.aniosExperiencia})`
                                      : ""
                                  }`}
                                </p>
                                <button
                                  type="button"
                                  title="Remover habilidad"
                                  className="shrink-0"
                                >
                                  <Trash2
                                    className="w-5 h-5"
                                    onClick={() =>
                                      handleRemoveTechnicalSkill(
                                        item.idHabTec,
                                        talent.idTalento,
                                      )
                                    }
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Soft */}
                        <div className="flex flex-col gap-4 sm:w-1/2 my-2 sm:my-0">
                          <div className="flex items-center gap-4 h-6">
                            <p className="text-[#52525B] font-semibold">
                              Habilidades Blandas
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                openModal("modalSoftSkills")
                              }
                              className="text-[#52525B] rounded-full p-1 hover:shadow-inner"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(
                              talentDets?.habilidadesBlandas || []
                            ).map((item) => (
                              <div
                                key={item.id}
                                className="inline-flex items-center gap-1"
                              >
                                <p
                                  className="text-[#c11574] text-sm bg-[#fef6fa] px-3 rounded-full font-semibold py-1"
                                >
                                  {item.nombreHabilidad}
                                </p>
                                <button
                                  type="button"
                                  title="Remover habilidad"
                                  className="shrink-0"
                                >
                                  <Trash2
                                    className="w-5 h-5"
                                    onClick={() =>
                                      handleRemoveSoftSkill(
                                        item.id,
                                        talent.idTalento,
                                      )
                                    }
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Description */}
                      <div className="flex flex-col py-8 w-full gap-4">
                        <h2 className="text-[#52525B] font-semibold my-2">
                          Resumen profesional
                        </h2>
                        <div className="flex gap-4 items-center">
                          <p className="text-justify text-[#71717A] text-sm w-fit">
                            {talentDets?.descripcion}
                          </p>
                          <button
                            type="button"
                            onClick={() => openModal("modalSummary")}
                            className="bg-white hover:shadow-lg hover:rounded-full hover:bg-zinc-50 w-5"
                          >
                            <Pencil className="w-5 h-5 opacity-40 hover:opacity-100" />
                          </button>
                        </div>
                      </div>
                      {/* Availability */}
                      <div className="flex flex-col pb-8 justify-center">
                        <h2 className="text-[#52525B] font-semibold my-2">
                          Disponibilidad
                        </h2>
                        <p className="text-[#71717A] text-sm flex gap-2 items-center">
                          {Utils.formatDisponibilidad(
                            talentDets?.disponibilidad,
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              openModal("modalAvailability")
                            }
                            className="bg-white hover:shadow-lg hover:rounded-full hover:bg-zinc-50 w-5"
                          >
                            <Pencil className="w-5 h-5 opacity-40 hover:opacity-100" />
                          </button>
                        </p>
                      </div>
                      {/* Experience */}
                      <div className="flex flex-col">
                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                          Experiencia
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenModal(
                                "modalExperience",
                                experienceRef,
                              )
                            }
                            className="text-[#52525B] rounded-full p-1 hover:shadow-inner"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </h2>
                        <div className="flex flex-col">
                          {(talentDets?.experiencias || []).map(
                            (item, index) => (
                              <ExperienceCard
                                key={index}
                                data={item}
                                onEdit={() =>
                                  handleOpenModal(
                                    "modalExperience",
                                    experienceRef,
                                    item,
                                  )
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>
                      {/* Education */}
                      <div className="flex flex-col">
                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                          Educación
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenModal(
                                "modalEducation",
                                educationRef,
                              )
                            }
                            className="text-[#52525B] rounded-full p-1 hover:shadow-inner"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </h2>
                        <div className="flex flex-col">
                          {(talentDets?.educaciones || []).map(
                            (item, index) => (
                              <EducationCard
                                key={index}
                                data={item}
                                onEdit={() =>
                                  handleOpenModal(
                                    "modalEducation",
                                    educationRef,
                                    item,
                                  )
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>
                      {/* Files */}
                      <div className="flex flex-col pb-8">
                        <h2 className="text-[#52525B] font-semibold my-2">
                          Archivos
                        </h2>
                        <div className="flex flex-col">
                          {talentDets?.files &&
                          talentDets.files.length > 0 ? (
                            talentDets.files.map((file) => (
                              <FileCard
                                key={file.idArchivo}
                                data={file}
                                downloading={
                                  downloadingId === file.idArchivo
                                }
                                onDownload={() =>
                                  downloadFile(file.idArchivo)
                                }
                              />
                            ))
                          ) : (
                            <p className="text-[#71717A] text-sm">
                              Este talento aún no tiene archivos
                              registrados.
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Language */}
                      <div className="flex flex-col">
                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full">
                          Idiomas
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenModal(
                                "modalLanguage",
                                languageRef,
                              )
                            }
                            className="text-[#52525B] rounded-full p-1 hover:shadow-inner"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </h2>
                        <div className="flex flex-col">
                          {(talentDets?.idiomas || []).map(
                            (item, index) => (
                              <LanguageCard
                                key={index}
                                data={item}
                                onEdit={() =>
                                  handleOpenModal(
                                    "modalLanguage",
                                    languageRef,
                                    item,
                                  )
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>
                      {/* Feedback */}
                      <div className="flex flex-col">
                        <h2 className="text-[#52525B] font-semibold my-2">
                          Feedback
                        </h2>
                        <div className="flex flex-col">
                          {(talentDets?.feedback || []).map(
                            (item, index) => (
                              <FeedbackCard
                                key={index}
                                data={item}
                                onEdit={() =>
                                  handleOpenModal(
                                    "modalFeedback",
                                    feedbackRef,
                                    item,
                                  )
                                }
                              />
                            ),
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenModal(
                              "modalFeedback",
                              feedbackRef,
                            )
                          }
                          className="text-[#52525B] text-sm rounded-lg my-2 p-2 hover:text-[#27272A] hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.05)] flex items-center gap-2 w-fit"
                        >
                          <Plus className="w-5 h-5" />
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
};
