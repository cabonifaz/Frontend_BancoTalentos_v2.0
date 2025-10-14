import { useFieldArray, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "../../../../models/schemas/NewRQSchemaV1";
import { Utils } from "../../../../utilities/utils";
import { NumberInput } from "../../../ui/InputNumber";
import { useEffect, useState } from "react";
import { Tarifa } from "../../../../models/interfaces/Tarifa";
import {
  BaseSkillProps,
  TechSkillsModal,
} from "../../ModalAddTechSkill";
import { AddCareerModal, CareerProps } from "../../ModalAddCareer";
import { enqueueSnackbar } from "notistack";
import { useModal } from "../../../../context/ModalContext";
import {
  MODAL_ADD_CAREER,
  MODAL_ADD_TECH_SKILL,
} from "../../../../utilities/modalsIds";
import { HABILIDADES_TECNICAS } from "../../../../utilities/constants";

/** Validate rol */
const isRecruiter = (): boolean => {
  const token = localStorage.getItem("token");
  const roles = Utils.decodeJwt(token ?? "").roles as any[];
  return roles.includes("RECLUTADOR");
};

type SkillsPayload = BaseSkillProps & { idPerfil: number };

interface TabProps {
  tarifario: Tarifa[];
  techSkills: { id: number; label: string }[];
  availableDegrees: { id: number; label: string }[];
  refetchParams: (idMasters: string) => Promise<void>;
}

export const TabVacancies = ({
  tarifario,
  techSkills,
  availableDegrees,
  refetchParams,
}: TabProps) => {
  // @marker base states
  const [cantidadesVacantes, setCantidadesVacantes] = useState<
    number[]
  >([]);
  const { openModal, isModalOpen, closeModal } = useModal();

  /** Select skills for Vacante*/
  const [selectedTechSkills, setSelectedTechSkills] = useState<
    Record<number, SkillsPayload[]>
  >({});

  /**Select career for Vacante */
  const [selectedCareers, setSelectedCareers] = useState<
    Record<number, CareerProps[]>
  >({});

  const [careerProfile, setCareerProfile] = useState<number | null>(
    null
  );

  const [currentProfile, setCurrentProfile] = useState<number | null>(
    null
  );

  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
    control,
    watch,
  } = useFormContext<newRQSchemaType>();

  // Sincroniza selectedTechSkills con el form context - padre
  useEffect(() => {
    const lstVacanteSkills = Object.entries(
      selectedTechSkills
    ).flatMap(([idPerfilStr, skills]) => {
      const idPerfil = Number(idPerfilStr);
      return skills.map((skill) => ({
        idPerfil,
        idSkill: skill.id,
        anios: skill.years,
      }));
    });
    setValue("lstVacanteSkills", lstVacanteSkills, {
      shouldValidate: false,
    });
  }, [selectedTechSkills, setValue]);

  // Sincroniza selectedCareers con el form context - padre
  useEffect(() => {
    const lstCarreras = Object.entries(selectedCareers).flatMap(
      ([idPerfilStr, careers]) => {
        const idPerfil = Number(idPerfilStr);
        return careers.map((c) => ({
          idPerfil,
          carrera: c.label,
          idGrado: c.degreeId,
        }));
      }
    );
    setValue("lstCarreras", lstCarreras, {
      shouldValidate: false,
    });
  }, [selectedCareers, setValue]);

  const currentVacantes = watch("lstVacantes");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lstVacantes",
  });

  const handleAddVacante = () => {
    const clientId = getValues("idCliente");

    if (!clientId || clientId === 0) {
      enqueueSnackbar({
        message: "Primero selecciona un cliente",
        variant: "warning",
      });
      return;
    }

    append({ idPerfil: 0, cantidad: 1 });
    setCantidadesVacantes((prev) => [...prev, 1]);
    clearErrors("lstVacantes");
  };

  const handleRemoveVacante = (index: number) => {
    const idPerfil = getValues(`lstVacantes.${index}.idPerfil`);

    remove(index);
    setCantidadesVacantes((prev) =>
      prev.filter((_, i) => i !== index)
    );

    // Eliminar las habilidades usando el idPerfil
    if (idPerfil && idPerfil !== 0) {
      setSelectedTechSkills((prev) => {
        const newSkills = { ...prev };
        delete newSkills[idPerfil];
        return newSkills;
      });
      // Remove careers for vacancy
      setSelectedCareers((prev) => {
        const newCareers = { ...prev };
        delete newCareers[idPerfil];
        return newCareers;
      });
    }
  };

  const getAvailableProfiles = (currentIndex: number) => {
    if (getValues("idCliente") === 0) return [];

    const selectedProfiles = currentVacantes
      .filter((_, index) => index !== currentIndex)
      .map((v) => v.idPerfil)
      .filter((id) => id !== 0);

    return tarifario.filter(
      (perfil) => !selectedProfiles.includes(perfil.idPerfil)
    );
  };

  const handleProfileChange = (index: number, value: string) => {
    const idPerfilAnterior = getValues(
      `lstVacantes.${index}.idPerfil`
    );
    const idPerfil = Number(value);
    setValue(`lstVacantes.${index}.idPerfil`, idPerfil);

    const tarifa =
      tarifario
        .find((item) => item.idPerfil === idPerfil)
        ?.tarifa.toFixed(2) || "-";
    const moneda =
      tarifario.find((item) => item.idPerfil === idPerfil)?.moneda ||
      "S/.";

    setValue(
      `lstVacantes.${index}.tarifa`,
      `${moneda} ${Utils.formatCoin(Number(tarifa))}`
    );
    clearErrors(`lstVacantes.${index}.idPerfil`);

    // Si cambió el perfil, eliminar las habilidades del perfil anterior
    if (
      idPerfilAnterior &&
      idPerfilAnterior !== 0 &&
      idPerfilAnterior !== idPerfil
    ) {
      setSelectedTechSkills((prev) => {
        const newSkills = { ...prev };
        delete newSkills[idPerfilAnterior];
        return newSkills;
      });
    }
  };

  const openModalAddCareer = (careerProfile: number) => {
    setCareerProfile(careerProfile);
    if (!careerProfile || careerProfile === 0) {
      const msg = "Selecciona una vacante para continuar";
      enqueueSnackbar({ message: msg, variant: "warning" });
      return;
    }
    openModal(MODAL_ADD_CAREER);
  };

  const handleOpenModal = (profileId: number) => {
    if (!profileId || profileId === 0) {
      enqueueSnackbar({
        message:
          "Selecciona un perfil para agregar habilidades técnicas.",
        variant: "warning",
      });
      return;
    }
    setCurrentProfile(profileId);
    openModal(MODAL_ADD_TECH_SKILL);
  };

  const getTotalCareersForProfile = (profileId: number): number => {
    if (!profileId || profileId === 0) return 0;
    return selectedCareers[profileId]?.length || 0;
  };

  const getTotalSkillsForProfile = (profileId: number): number => {
    if (!profileId || profileId === 0) return 0;
    return selectedTechSkills[profileId]?.length || 0;
  };

  const handleCloseModalSkills = () => {
    setCurrentProfile(null);
    closeModal(MODAL_ADD_TECH_SKILL);
  };

  /** Handle save tech skills */
  const handleSaveTechSkills = (skills: BaseSkillProps[]) => {
    if (!currentProfile) return;
    const vacanteSkills: SkillsPayload[] = skills.map((skill) => ({
      idPerfil: currentProfile,
      id: skill.id,
      years: skill.years,
      label: skill?.label || "",
    }));
    setSelectedTechSkills((prev) => ({
      ...prev,
      [currentProfile]: vacanteSkills,
    }));
  };

  /**Get initial skills */
  const getInitialSkills = (profileId: number): SkillsPayload[] => {
    if (!profileId || profileId === 0) return [];
    const skills = selectedTechSkills[profileId] || [];

    return skills.map((skill) => ({
      idPerfil: profileId,
      id: skill.id,
      years: skill.years,
      label: skill?.label || "",
    }));
  };

  const closeModalAddCareer = () => {
    setCareerProfile(null);
    closeModal(MODAL_ADD_CAREER);
  };

  const handleSaveCarrers = (careers: CareerProps[]) => {
    if (!careerProfile) return;

    setSelectedCareers((prev) => ({
      ...prev,
      [careerProfile]: careers,
    }));
    setCareerProfile(null);
  };

  const getInialCareers = (careerProfile: number): CareerProps[] => {
    if (!careerProfile || careerProfile === 0) return [];

    return selectedCareers[careerProfile] || [];
  };

  return (
    <>
      {isModalOpen(MODAL_ADD_TECH_SKILL) && (
        <TechSkillsModal
          onClose={handleCloseModalSkills}
          availableSkills={techSkills}
          onSave={handleSaveTechSkills}
          initialSkills={getInitialSkills(currentProfile || 0)}
          refetchAvailableSkills={() =>
            refetchParams(`${HABILIDADES_TECNICAS}`)
          }
        />
      )}
      {isModalOpen(MODAL_ADD_CAREER) && (
        <AddCareerModal
          degreeOptions={availableDegrees}
          initialCareers={getInialCareers(careerProfile || 0)}
          onSave={handleSaveCarrers}
          onClose={closeModalAddCareer}
        />
      )}
      <div className="flex flex-col h-[calc(570px-120px)]">
        <div className="mb-1 text-end">
          <button
            type="button"
            className="btn btn-blue"
            onClick={handleAddVacante}
          >
            Agregar
          </button>
        </div>
        <div className="p-1 flex-1 overflow-y-auto">
          <div className="table-container">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr className="table-header">
                    <th scope="col" className="table-header-cell">
                      Perfil profesional
                    </th>
                    <th scope="col" className="table-header-cell">
                      Cantidad
                    </th>
                    <th
                      scope="col"
                      className="table-header-cell"
                      style={{
                        display: isRecruiter()
                          ? "none"
                          : "table-header-cell",
                      }}
                    >
                      Tarifa
                    </th>
                    <th
                      scope="col"
                      className="table-header-cell"
                      style={{
                        display: isRecruiter()
                          ? "none"
                          : "table-header-cell",
                      }}
                    >
                      Tipo Tarifa
                    </th>
                    <th
                      scope="col"
                      className="table-header-cell text-center"
                    >
                      Otros
                    </th>
                    <th
                      scope="col"
                      className="table-header-cell"
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.length <= 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        No hay vacantes disponibles.
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, index) => {
                      const availableProfiles =
                        getAvailableProfiles(index);
                      const currentProfile =
                        currentVacantes[index]?.idPerfil;
                      const showCurrentProfile =
                        currentProfile === 0 ||
                        availableProfiles.some(
                          (p) => p.idPerfil === currentProfile
                        ) ||
                        !tarifario.some(
                          (p) => p.idPerfil === currentProfile
                        );

                      const optionsToShow = showCurrentProfile
                        ? [...availableProfiles]
                        : [
                            ...availableProfiles,
                            ...tarifario.filter(
                              (p) => p.idPerfil === currentProfile
                            ),
                          ];

                      const tipoTarifa =
                        tarifario.find(
                          (item) =>
                            item.idPerfil ===
                            getValues(`lstVacantes.${index}.idPerfil`)
                        )?.tipoTarifa || "-";

                      return (
                        <tr key={field.id} className="table-row">
                          <td className="table-cell">
                            <select
                              {...register(
                                `lstVacantes.${index}.idPerfil`,
                                { valueAsNumber: true }
                              )}
                              onChange={(e) =>
                                handleProfileChange(
                                  index,
                                  e.target.value
                                )
                              }
                              className="h-10 px-4 border-gray-300 border rounded-lg focus:outline-none focus:border-[#4F46E5]"
                              value={currentProfile}
                            >
                              <option value={0}>
                                Seleccione un perfil
                              </option>
                              {optionsToShow.map((perfil) => (
                                <option
                                  key={perfil.idPerfil}
                                  value={perfil.idPerfil}
                                >
                                  {perfil.perfil}
                                </option>
                              ))}
                            </select>
                            {errors.lstVacantes?.[index]
                              ?.idPerfil && (
                              <p className="text-red-500 text-xs mt-1">
                                {
                                  errors.lstVacantes[index]?.idPerfil
                                    ?.message
                                }
                              </p>
                            )}
                          </td>
                          <td className="table-cell">
                            <div className="flex">
                              <div className="flex flex-col gap-1 relative">
                                <NumberInput<newRQSchemaType>
                                  control={control}
                                  name={`lstVacantes.${index}.cantidad`}
                                  error={
                                    errors.lstVacantes?.[index]
                                      ?.cantidad?.message
                                  }
                                />
                              </div>
                            </div>
                          </td>
                          <td
                            className="table-cell"
                            style={{
                              display: isRecruiter()
                                ? "none"
                                : "table-header-cell",
                            }}
                          >
                            <input
                              {...register(
                                `lstVacantes.${index}.tarifa`
                              )}
                              defaultValue={`${Utils.formatCoin(
                                Number(
                                  getValues(
                                    `lstVacantes.${index}.tarifa`
                                  )
                                )
                              )}`}
                              type="text"
                              id="v-tarifa"
                              className="input-readonly-text"
                              readOnly
                            />
                          </td>
                          <td
                            className="table-cell"
                            style={{
                              display: isRecruiter()
                                ? "none"
                                : "table-cell",
                            }}
                          >
                            <p>{tipoTarifa}</p>
                          </td>
                          <td className="table-cell text-center relative group">
                            <div className="flex items-center gap-3 justify-center">
                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar carreras"
                                onClick={() =>
                                  openModalAddCareer(currentProfile)
                                }
                              >
                                <img
                                  className="w-6 h-6"
                                  src="/assets/ic_student.png"
                                  alt="admin-settings-male"
                                />
                                {/**@marker skills careers */}
                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalCareersForProfile(
                                    currentProfile
                                  )}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar habilidades"
                                onClick={() => {
                                  handleOpenModal(currentProfile);
                                }}
                              >
                                <img
                                  src="/assets/ic_skills.png"
                                  alt="icon add"
                                  className="w-6 h-6"
                                />
                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalSkillsForProfile(
                                    currentProfile
                                  )}
                                </span>
                              </button>
                            </div>
                          </td>
                          <td className="table-cell">
                            <button
                              type="button"
                              title="Eliminar vacante"
                              className="bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                              onClick={() =>
                                handleRemoveVacante(index)
                              }
                            >
                              <img
                                src="/assets/ic_remove.png"
                                alt="icon remove"
                                className="w-6 h-6"
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
