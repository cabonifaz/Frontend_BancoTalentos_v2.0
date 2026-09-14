import {
  ArrowLeft,
  FileText,
  Github,
  Linkedin,
  Pencil,
  Phone,
  Plus,
  Search,
  Angry,
  Sparkles,
  Trash2,
  TriangleAlert,
  Upload,
  UserRound,
} from "lucide-react";
import { Dashboard } from "@/pages/private/Dashboard";
import { Utils } from "@/core/utilities/utils";
import React, { useEffect, useRef, useState } from "react";
import { useModal } from "@/core/context/ModalContext";
import { useNavigate } from "react-router-dom";
import { getTalent, getTalents } from "@/core/services/talents.service";
import { useSnackbar } from "notistack";
import {
  handleError,
  handleResponse,
} from "@/core/utilities/errorHandler";
import { useApi } from "@/core/hooks/useApi";
import {
  Education,
  Experience,
  Feedback,
  Language,
  Talent,
  TalentParams,
  TalentResponse,
  TalentsResponse,
} from "@/core/models";
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
} from "@/core/components";
import { CustomFilterDropDown } from "@/core/components/talentos/CustomFilterDropDown";
import { SearchableSelect } from "@/core/components/ui/SearchableSelect";
import { useParams } from "@/core/context/ParamsContext";
import { TIPO_MODALIDAD } from "@/core/utilities/constants";
import { nombreModalidad } from "@/core/utilities/riesgoTalento";
import { useFavouritesContext } from "@/core/context/FavouritesContext";
import {
  MODAL_FRACTAL_CV,
  MODAL_UPDATE_WITH_CV,
} from "@/core/utilities/modalsIds";
import { useRemoveSkill } from "@/core/hooks/talentos/useRemoveSkills";
import { useDownloadTalentFile } from "@/core/hooks/talentos/useDownloadTalentFile";
import {
  ModalAddToBlacklist,
  MODAL_ADD_TO_BLACKLIST,
} from "@/core/components/lista-negra/ModalAddToBlacklist";
import { useTalentBlacklistStatus } from "@/core/hooks/lista-negra/useTalentBlacklistStatus";
import { Button, buttonVariants } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/shadcn/popover";
import { Hint } from "@/core/components/ui/Hint";

const filterInputClass =
  "border-gray-300 px-3 py-2 text-sm dark:border-slate-600";

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
  // Maestro 3: como se le factura al talento. Se resuelve a su nombre para la
  // ficha; se edita en el modal de banda salarial, que es donde se registra.
  const modalidadFacturacionTalento = nombreModalidad(
    talent?.idModalidadFacturacion,
    paramsByMaestro[TIPO_MODALIDAD] || [],
  );

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

  // Popover con los clientes restringidos que no caben en los chips visibles.
  // El cierre al pulsar fuera (o con Escape) lo hace el Popover de shadcn.
  const [showMoreRestricted, setShowMoreRestricted] = useState(false);

  // Al cambiar de talento se cierra el popover.
  useEffect(() => {
    setShowMoreRestricted(false);
  }, [restrictedClients]);

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
              <Button
                variant="outline-blue"
                onClick={() => navigate("/dashboard/nuevo-talento")}
                className="mx-1 flex-1 sm:flex-none xl:w-fit whitespace-nowrap gap-1"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Talento</span>
              </Button>
              <p className="text-sm text-[#71717A] hidden xl:block whitespace-nowrap dark:text-slate-400">{`${
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
                        <label
                          htmlFor="filtro-puesto"
                          className="text-sm font-medium text-gray-700 dark:text-slate-200"
                        >
                          Puesto
                        </label>

                        <Input
                          id="filtro-puesto"
                          type="text"
                          placeholder="Ej: Frontend Developer"
                          value={jobPosition}
                          onChange={(e) =>
                            setJobPosition(e.target.value)
                          }
                          className={filterInputClass}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="filtro-anios"
                          className="text-sm font-medium text-gray-700 dark:text-slate-200"
                        >
                          Años de experiencia
                        </label>

                        <Input
                          id="filtro-anios"
                          type="number"
                          placeholder="Ej: 3"
                          value={yearsExperience}
                          onChange={(e) =>
                            setYearsExperience(e.target.value)
                          }
                          className={filterInputClass}
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
                        <label
                          htmlFor="filtro-educacion"
                          className="text-sm font-medium text-gray-700 dark:text-slate-200"
                        >
                          Curso / Carrera / Diplomado
                        </label>

                        <Input
                          id="filtro-educacion"
                          type="text"
                          placeholder="Ej: Ingeniería de Sistemas"
                          value={educationName}
                          onChange={(e) =>
                            setEducationName(e.target.value)
                          }
                          className={filterInputClass}
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
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

                  <Input
                    type="text"
                    name="search"
                    ref={searchInputRef}
                    aria-label="Buscar por talento o puesto"
                    placeholder="Buscar por talento o puesto"
                    className="input-search-container h-full py-0"
                  />
                </div>
                <Button
                  onClick={() => handleSearch()}
                  className="mx-1 flex-shrink-0"
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>
          <div className="flex mt-4 min-h-0 flex-1 gap-4">
            {/* Talents list */}
            <div className="flex flex-col w-full md:w-[340px] xl:w-[370px] flex-shrink-0 min-h-0">
              <div className="*:mb-1 flex-1 min-h-0 overflow-y-auto overflow-x-hidden border rounded-lg md:border-none dark:border-slate-700">
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
              className={`border-2 shadow-xl rounded-lg overflow-hidden flex-1 min-h-0 absolute top-0 left-0 z-[41] md:z-auto w-full bg-white md:relative md:top-auto md:left-auto dark:bg-slate-800 dark:border-slate-700 ${
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
                        className="w-fit px-4 py-2 rounded-xl bg-[#e4e4e7] flex gap-4 md:hidden justify-end items-center my-4 dark:bg-slate-700"
                      >
                        <ArrowLeft className="h-4 w-4 md:h-6 md:w-6" />
                        <p className="text-[#2e2e2e] dark:text-slate-100">Volver</p>
                      </button>
                      {/* Talent main info */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start w-full justify-between">
                        {/* Sin alto fijo: con procedencia, banda salarial y
                            estrellas el bloque pasaba de 112 px y se montaba
                            sobre la barra de acciones. */}
                        <div className="flex gap-10">
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
                                className="h-24 w-24 rounded-full border dark:border-slate-700"
                              />
                            ) : (
                              <UserRound className="h-24 w-24 rounded-full border p-5 text-gray-300 dark:border-slate-700 dark:text-slate-600" />
                            )}

                            <button
                              type="button"
                              aria-label="Editar foto de perfil"
                              onClick={() =>
                                openModal("modalEditPhoto")
                              }
                              className="absolute bottom-4 -right-2 h-9 w-9 bg-white shadow-lg rounded-full p-2 hover:bg-zinc-50 dark:bg-slate-800 dark:hover:bg-slate-700"
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
                              <Hint
                                label={
                                  isBlacklisted
                                    ? "Talento en lista negra"
                                    : "Agregar a lista negra"
                                }
                              >
                                <button
                                  type="button"
                                  aria-label={
                                    isBlacklisted
                                      ? "Talento en lista negra"
                                      : "Agregar a lista negra"
                                  }
                                  onClick={() =>
                                    openModal(MODAL_ADD_TO_BLACKLIST)
                                  }
                                  className="p-1 bg-white rounded-full hover:shadow-lg transition-all duration-200 flex-shrink-0 dark:bg-slate-800"
                                >
                                  <Angry
                                    className={`h-5 w-5 ${
                                      isBlacklisted
                                        ? "fill-red-500 text-red-700 dark:text-red-300"
                                        : "text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-100"
                                    }`}
                                  />
                                </button>
                              </Hint>

                              {/* Clientes de los que está restringido; los que
                                  no caben se despliegan al pulsar el "+N". */}
                              {restrictedClients.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  {restrictedClients
                                    .slice(0, 3)
                                    .map((c) => (
                                      <span
                                        key={c.idCliente}
                                        className={`rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 ${
                                          c.idCliente === 0
                                            ? "whitespace-nowrap"
                                            : "max-w-[120px] truncate"
                                        }`}
                                      >
                                        {c.cliente}
                                      </span>
                                    ))}
                                  {restrictedClients.length > 3 && (
                                    <Popover
                                      open={showMoreRestricted}
                                      onOpenChange={setShowMoreRestricted}
                                    >
                                      <PopoverTrigger asChild>
                                        <button
                                          type="button"
                                          aria-label={`Ver ${restrictedClients.length - 3} clientes restringidos más`}
                                          className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors dark:bg-red-500/15 dark:text-red-300"
                                        >
                                          +{restrictedClients.length - 3}
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        align="start"
                                        sideOffset={4}
                                        className="max-h-48 w-max min-w-[140px] max-w-[240px] overflow-y-auto border-red-200 bg-white p-1 shadow-lg dark:border-red-500/30 dark:bg-slate-800"
                                      >
                                        {restrictedClients
                                          .slice(3)
                                          .map((c) => (
                                            <div
                                              key={c.idCliente}
                                              className="truncate rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                                            >
                                              {c.cliente}
                                            </div>
                                          ))}
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Mismo formato "Etiqueta: valor" que Procedencia. */}
                            <p className="text-sm text-[#71717A] my-1 w-fit dark:text-slate-400">
                              Residencia:{" "}
                              <span className="font-medium text-[#3f3f46] dark:text-slate-200">
                                {[talent.pais, talent.ciudad]
                                  .filter(Boolean)
                                  .join(", ") || "—"}
                              </span>
                            </p>
                            <p className="text-sm text-[#71717A] my-1 w-fit dark:text-slate-400">
                              Procedencia:{" "}
                              <span className="font-medium text-[#3f3f46] dark:text-slate-200">
                                {talentDets?.procedencia || "—"}
                              </span>
                            </p>
                            {/* Expectativa salarial: una pastilla por régimen
                                con su rango y la modalidad de facturación
                                aparte (antes todo iba en una sola línea de
                                texto gris, difícil de leer). */}
                            <div className="my-1.5 flex flex-wrap items-center gap-2 text-sm">
                              <span className="text-[#71717A] dark:text-slate-400">
                                Expectativa salarial:
                              </span>
                              {[
                                {
                                  label: "RxH",
                                  currency: Utils.formatCoinByNum1(talent.idMonedaRxh).string3,
                                  min: talent.montoInicialRxH,
                                  // Antes repetía el monto inicial como final.
                                  max: talent.montoFinalRxH,
                                },
                                {
                                  label: "Planilla",
                                  currency: Utils.formatCoinByNum1(talent.idMonedaPlan).string3,
                                  min: talent.montoInicialPlanilla,
                                  max: talent.montoFinalPlanilla,
                                },
                              ].map(({ label, currency, min, max }) => (
                                <span
                                  key={label}
                                  className="inline-flex items-baseline gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-slate-600 dark:bg-slate-700/60"
                                >
                                  <span className="text-xs font-semibold uppercase tracking-wide text-[#71717A] dark:text-slate-400">
                                    {label}
                                  </span>
                                  <span className="font-medium tabular-nums text-[#3f3f46] dark:text-slate-100">
                                    {`${currency} ${[min, max]
                                      .map((n) =>
                                        Number(n || 0).toLocaleString("es-PE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }),
                                      )
                                      .join(" – ")}`}
                                  </span>
                                </span>
                              ))}
                              {modalidadFacturacionTalento ? (
                                <Hint label="Modalidad de facturación">
                                  <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-xs font-medium text-[var(--color-blue)] dark:bg-sky-400/10 dark:text-sky-300">
                                    {modalidadFacturacionTalento}
                                  </span>
                                </Hint>
                              ) : (
                                // Sin este dato el cálculo de riesgo no puede
                                // saber si aplicar cargas patronales, así que
                                // su ausencia se muestra, no se esconde.
                                <Hint label="Sin modalidad, el cálculo de riesgo no sabe si aplicar cargas patronales">
                                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                                    <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
                                    Modalidad sin definir
                                  </span>
                                </Hint>
                              )}
                              <Hint label="Editar expectativa salarial">
                                <button
                                  type="button"
                                  aria-label="Editar banda salarial"
                                  onClick={() => openModal("modalSalary")}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                >
                                  <Pencil className="h-4 w-4" aria-hidden />
                                </button>
                              </Hint>
                            </div>
                            <div className="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
                              <div className="flex gap-2 my-2">
                                {Utils.getStars(talent.estrellas)}
                              </div>
                              {talent.estrellas <= 0 && (
                                <p className="text-sm text-[#71717A] hidden lg:block dark:text-slate-400">
                                  0 feedbacks
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Redes, arriba a la derecha: son datos del perfil,
                            no acciones. */}
                        <div className="mt-3 flex shrink-0 items-center gap-1 sm:mt-0">
                          {[
                            { label: "LinkedIn", url: talentDets?.linkedin, Icon: Linkedin },
                            { label: "GitHub", url: talentDets?.github, Icon: Github },
                          ].map(({ label, url, Icon }) => (
                            <Hint
                              key={label}
                              label={url ? `Abrir ${label}` : `Sin ${label} registrado`}
                            >
                              <a
                                aria-label={label}
                                aria-disabled={!url}
                                href={formatUrl(url || "") || "#"}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => !url && e.preventDefault()}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                                  url
                                    ? "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                    : "cursor-default text-gray-300 dark:text-slate-600"
                                }`}
                              >
                                <Icon className="h-5 w-5" aria-hidden />
                              </a>
                            </Hint>
                          ))}
                          <Hint label="Editar redes">
                            <button
                              type="button"
                              aria-label="Editar medios sociales"
                              onClick={() => openModal("modalSocialMedia")}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </button>
                          </Hint>
                        </div>
                      </div>
                      {/* Acciones del talento: barra propia bajo la cabecera,
                          ordenadas por importancia y todas del mismo alto.
                          Antes iban apiladas junto a la foto, con anchos
                          fijos que partían los textos en dos líneas. */}
                      <div className="mb-6 mt-5 flex flex-wrap items-center gap-3 border-y border-gray-200 py-4 dark:border-slate-700">
                        <Button
                          onClick={() => openModal("modalContact")}
                          className="h-10 text-sm font-medium"
                        >
                          <Phone className="h-4 w-4" aria-hidden />
                          Contactar
                        </Button>

                        <Hint label="Sube un CV y la IA propone solo lo nuevo o mejorado">
                          <button
                            type="button"
                            onClick={() => openModal(MODAL_UPDATE_WITH_CV)}
                            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 text-sm font-medium text-white transition-all duration-200 hover:from-teal-600 hover:to-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <Sparkles className="h-4 w-4" aria-hidden />
                            Actualizar con IA
                          </button>
                        </Hint>

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
                          icon={<FileText className="h-4 w-4" aria-hidden />}
                          chevronClassName="h-4 w-4"
                          buttonStyle={buttonVariants({
                            variant: "outline",
                            className: "h-10 gap-2 text-sm font-medium",
                          })}
                        />

                        <Hint label="Sube un archivo del talento (certificados, constancias…)">
                          <Button
                            variant="outline"
                            onClick={() => openModal("modalUploadCert")}
                            className="h-10 text-sm font-medium"
                          >
                            <Upload className="h-4 w-4" aria-hidden />
                            Subir archivo
                          </Button>
                        </Hint>
                      </div>
                      {/* Skills: técnicas y blandas una debajo de otra, cada
                          una a todo el ancho (las listas largas ya no se
                          comprimen en media columna). */}
                      <div className="flex flex-col gap-6 w-full">
                        {/* Technical */}
                        <div className="flex flex-col gap-4 w-full">
                          <div className="flex items-center gap-4 h-6">
                            <p className="text-[#52525B] font-semibold dark:text-slate-300">
                              Habilidades Técnicas
                            </p>
                            <button
                              type="button"
                              aria-label="Agregar habilidad técnica"
                              onClick={() =>
                                openModal("modalTechSkills")
                              }
                              className="text-[#52525B] rounded-full p-1 hover:shadow-inner dark:text-slate-300"
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
                                  className="text-[var(--color-blue)] text-sm bg-[#f5f9ff] px-3 rounded-full font-semibold py-1 dark:bg-sky-500/10"
                                >
                                  {`${item.nombreHabilidad} ${
                                    item?.aniosExperiencia
                                      ? ` - (${item.aniosExperiencia})`
                                      : ""
                                  }`}
                                </p>
                                {/* El onClick pasa del icono al botón: antes
                                    el teclado (Enter/Espacio) no lo disparaba. */}
                                <Hint label="Remover habilidad">
                                  <button
                                    type="button"
                                    aria-label={`Remover ${item.nombreHabilidad}`}
                                    className="shrink-0"
                                    onClick={() =>
                                      handleRemoveTechnicalSkill(
                                        item.idHabTec,
                                        talent.idTalento,
                                      )
                                    }
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </Hint>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Soft */}
                        <div className="flex flex-col gap-4 w-full">
                          <div className="flex items-center gap-4 h-6">
                            <p className="text-[#52525B] font-semibold dark:text-slate-300">
                              Habilidades Blandas
                            </p>
                            <button
                              type="button"
                              aria-label="Agregar habilidad blanda"
                              onClick={() =>
                                openModal("modalSoftSkills")
                              }
                              className="text-[#52525B] rounded-full p-1 hover:shadow-inner dark:text-slate-300"
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
                                  className="text-[#c11574] text-sm bg-[#fef6fa] px-3 rounded-full font-semibold py-1 dark:text-pink-300 dark:bg-pink-500/10"
                                >
                                  {item.nombreHabilidad}
                                </p>
                                <Hint label="Remover habilidad">
                                  <button
                                    type="button"
                                    aria-label={`Remover ${item.nombreHabilidad}`}
                                    className="shrink-0"
                                    onClick={() =>
                                      handleRemoveSoftSkill(
                                        item.id,
                                        talent.idTalento,
                                      )
                                    }
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </Hint>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Description */}
                      <div className="flex flex-col py-8 w-full gap-4">
                        <h2 className="text-[#52525B] font-semibold my-2 dark:text-slate-300">
                          Resumen profesional
                        </h2>
                        <div className="flex gap-4 items-center">
                          <p className="text-justify text-[#71717A] text-sm w-fit dark:text-slate-400">
                            {talentDets?.descripcion}
                          </p>
                          <button
                            type="button"
                            aria-label="Editar resumen profesional"
                            onClick={() => openModal("modalSummary")}
                            className="bg-white hover:shadow-lg hover:rounded-full hover:bg-zinc-50 w-5 dark:bg-slate-800 dark:hover:bg-slate-700"
                          >
                            <Pencil className="w-5 h-5 opacity-40 hover:opacity-100" />
                          </button>
                        </div>
                      </div>
                      {/* Availability */}
                      <div className="flex flex-col pb-8 justify-center">
                        <h2 className="text-[#52525B] font-semibold my-2 dark:text-slate-300">
                          Disponibilidad
                        </h2>
                        <p className="text-[#71717A] text-sm flex gap-2 items-center dark:text-slate-400">
                          {Utils.formatDisponibilidad(
                            talentDets?.disponibilidad,
                          )}
                          <button
                            type="button"
                            aria-label="Editar disponibilidad"
                            onClick={() =>
                              openModal("modalAvailability")
                            }
                            className="bg-white hover:shadow-lg hover:rounded-full hover:bg-zinc-50 w-5 dark:bg-slate-800 dark:hover:bg-slate-700"
                          >
                            <Pencil className="w-5 h-5 opacity-40 hover:opacity-100" />
                          </button>
                        </p>
                      </div>
                      {/* Experience */}
                      <div className="flex flex-col">
                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full dark:text-slate-300">
                          Experiencia
                          <button
                            type="button"
                            aria-label="Agregar experiencia"
                            onClick={() =>
                              handleOpenModal(
                                "modalExperience",
                                experienceRef,
                              )
                            }
                            className="text-[#52525B] rounded-full p-1 hover:shadow-inner dark:text-slate-300"
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
                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full dark:text-slate-300">
                          Educación
                          <button
                            type="button"
                            aria-label="Agregar educación"
                            onClick={() =>
                              handleOpenModal(
                                "modalEducation",
                                educationRef,
                              )
                            }
                            className="text-[#52525B] rounded-full p-1 hover:shadow-inner dark:text-slate-300"
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
                        <h2 className="text-[#52525B] font-semibold my-2 dark:text-slate-300">
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
                            <p className="text-[#71717A] text-sm dark:text-slate-400">
                              Este talento aún no tiene archivos
                              registrados.
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Language */}
                      <div className="flex flex-col">
                        <h2 className="text-[#52525B] font-semibold my-2 flex item justify-between w-full dark:text-slate-300">
                          Idiomas
                          <button
                            type="button"
                            aria-label="Agregar idioma"
                            onClick={() =>
                              handleOpenModal(
                                "modalLanguage",
                                languageRef,
                              )
                            }
                            className="text-[#52525B] rounded-full p-1 hover:shadow-inner dark:text-slate-300"
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
                        <h2 className="text-[#52525B] font-semibold my-2 dark:text-slate-300">
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
                          className="text-[#52525B] text-sm rounded-lg my-2 p-2 hover:text-[#27272A] hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.05)] flex items-center gap-2 w-fit dark:text-slate-300 dark:hover:text-slate-100"
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
