import { GraduationCap, Trash2, Wrench } from "lucide-react";
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
import {
  SearchableSelect,
  SearchableOption,
} from "../../../ui/SearchableSelect";

/** Validate rol */
const isRecruiter = (): boolean => {
  const token = localStorage.getItem("token");
  const roles = Utils.decodeJwt(token ?? "").roles as any[];
  return roles.includes("RECLUTADOR");
};

type SkillsPayload = BaseSkillProps & { tempVacancyId: string };

type VacancyCareerPayload = CareerProps & { tempVacancyId: string };

interface TabProps {
  tarifario: Tarifa[];
  techSkills: { id: number; label: string }[];
  availableDegrees: { id: number; label: string }[];
  refetchParams: () => Promise<void>;
}

export const TabVacancies = ({
  tarifario,
  techSkills,
  availableDegrees,
  refetchParams,
}: TabProps) => {
  const { openModal, isModalOpen, closeModal } = useModal();

  /** Select skills for Vacante*/
  const [selectedTechSkills, setSelectedTechSkills] = useState<
    Record<string, SkillsPayload[]>
  >({});

  /**Select career for Vacante */
  const [selectedCareers, setSelectedCareers] = useState<
    Record<string, VacancyCareerPayload[]>
  >({});

  const [careerVacancyId, setCareerVacancyId] = useState<string | null>(null);
  const [currentVacancyId, setCurrentVacancyId] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
    control,
    watch,
  } = useFormContext<newRQSchemaType>();

  const currentVacantes = watch("lstVacantes");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lstVacantes",
  });

  useEffect(() => {
    const lstVacanteSkills = Object.entries(selectedTechSkills).flatMap(
      ([tempVacancyId, skills]) => {
        const vacancy = currentVacantes.find(
          (item) => item.tempVacancyId === tempVacancyId
        );
        if (!vacancy) return [];

        return skills.map((skill) => ({
          tempVacancyId,
          idPerfil: vacancy.idPerfil,
          idSkill: skill.id,
          anios: skill.years,
          isOptional: skill.isOptional,
        }));
      }
    );
    setValue("lstVacanteSkills", lstVacanteSkills, {
      shouldValidate: false,
    });
  }, [selectedTechSkills, currentVacantes, setValue]);

  // Sincroniza selectedCareers con el form context - padre
  useEffect(() => {
    const lstCarreras = Object.entries(selectedCareers).flatMap(
      ([tempVacancyId, careers]) => {
        const vacancy = currentVacantes.find(
          (item) => item.tempVacancyId === tempVacancyId
        );
        if (!vacancy) return [];

        return careers.map((c) => ({
          tempVacancyId,
          idPerfil: vacancy.idPerfil,
          carrera: c.label,
          idGrado: c.degreeId,
          isOptional: c.isOptional,
        }));
      }
    );
    setValue("lstCarreras", lstCarreras, {
      shouldValidate: false,
    });
  }, [selectedCareers, currentVacantes, setValue]);

  const handleAddVacante = () => {
    const clientId = getValues("idCliente");

    if (!clientId || clientId === 0) {
      enqueueSnackbar({
        message: "Primero selecciona un cliente",
        variant: "warning",
      });
      return;
    }

    append({
      tempVacancyId: crypto.randomUUID(),
      idPerfil: 0,
      cantidad: 1,
    });
    clearErrors("lstVacantes");
  };

  const handleRemoveVacante = (index: number) => {
    const tempVacancyId = getValues(
      `lstVacantes.${index}.tempVacancyId`
    );

    remove(index);

    setSelectedTechSkills((prev) => {
      const next = { ...prev };
      delete next[tempVacancyId];
      return next;
    });
    setSelectedCareers((prev) => {
      const next = { ...prev };
      delete next[tempVacancyId];
      return next;
    });
  };

  const getAvailableProfiles = () => {
    if (getValues("idCliente") === 0) return [];
    return tarifario;
  };

  const handleProfileChange = (index: number, value: string) => {
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
  };

  const openModalAddCareer = (tempVacancyId: string, profileId: number) => {
    if (!profileId || profileId === 0) {
      const msg = "Selecciona una vacante para continuar";
      enqueueSnackbar({ message: msg, variant: "warning" });
      return;
    }
    setCareerVacancyId(tempVacancyId);
    openModal(MODAL_ADD_CAREER);
  };

  const handleOpenModal = (tempVacancyId: string, profileId: number) => {
    if (!profileId || profileId === 0) {
      enqueueSnackbar({
        message:
          "Selecciona un perfil para agregar habilidades técnicas.",
        variant: "warning",
      });
      return;
    }
    setCurrentVacancyId(tempVacancyId);
    openModal(MODAL_ADD_TECH_SKILL);
  };

  const getTotalCareersForVacancy = (tempVacancyId: string): number => {
    return selectedCareers[tempVacancyId]?.length || 0;
  };

  const getTotalSkillsForVacancy = (tempVacancyId: string): number => {
    return selectedTechSkills[tempVacancyId]?.length || 0;
  };

  const handleCloseModalSkills = () => {
    setCurrentVacancyId(null);
    closeModal(MODAL_ADD_TECH_SKILL);
  };

  /** Handle save tech skills */
  const handleSaveTechSkills = (skills: BaseSkillProps[]) => {
    if (!currentVacancyId) return;
    const vacanteSkills: SkillsPayload[] = skills.map((skill) => ({
      tempVacancyId: currentVacancyId,
      id: skill.id,
      years: skill.years,
      label: skill?.label || "",
      isOptional: skill.isOptional,
    }));
    setSelectedTechSkills((prev) => ({
      ...prev,
      [currentVacancyId]: vacanteSkills,
    }));
  };

  /**Get initial skills */
  const getInitialSkills = (tempVacancyId: string): SkillsPayload[] => {
    return selectedTechSkills[tempVacancyId] || [];
  };

  const closeModalAddCareer = () => {
    setCareerVacancyId(null);
    closeModal(MODAL_ADD_CAREER);
  };

  const handleSaveCarrers = (careers: CareerProps[]) => {
    if (!careerVacancyId) return;

    setSelectedCareers((prev) => ({
      ...prev,
      [careerVacancyId]: careers.map((career) => ({
        ...career,
        tempVacancyId: careerVacancyId,
      })),
    }));
  };

  const getInialCareers = (tempVacancyId: string): CareerProps[] => {
    return selectedCareers[tempVacancyId] || [];
  };

  const availableProfiles = getAvailableProfiles();

  return (
    <>
      {isModalOpen(MODAL_ADD_TECH_SKILL) && (
        <TechSkillsModal
          onClose={handleCloseModalSkills}
          availableSkills={techSkills}
          onSave={handleSaveTechSkills}
          initialSkills={
            currentVacancyId ? getInitialSkills(currentVacancyId) : []
          }
          refetchAvailableSkills={() =>
            refetchParams()
          }
        />
      )}
      {isModalOpen(MODAL_ADD_CAREER) && (
        <AddCareerModal
          degreeOptions={availableDegrees}
          initialCareers={
            careerVacancyId ? getInialCareers(careerVacancyId) : []
          }
          onSave={handleSaveCarrers}
          onClose={closeModalAddCareer}
        />
      )}
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-1 text-end">
          <button
            type="button"
            className="btn btn-blue"
            onClick={handleAddVacante}
          >
            Agregar
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-visible p-1">
          <div className="table-container h-full">
            <div className="table-wrapper h-full overflow-y-auto">
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
                      const currentProfile =
                        currentVacantes[index]?.idPerfil;
                      const tempVacancyId =
                        currentVacantes[index]?.tempVacancyId;

                      const tipoTarifa =
                        tarifario.find(
                          (item) =>
                            item.idPerfil ===
                            getValues(`lstVacantes.${index}.idPerfil`)
                        )?.tipoTarifa || "-";

                      return (
                        <tr key={field.id} className="table-row">
                          <td className="table-cell">
                            <SearchableSelect
                              options={[
                                {
                                  value: 0,
                                  label: "Seleccione un perfil",
                                },
                                ...availableProfiles.map((perfil) => ({
                                  value: perfil.idPerfil,
                                  label: perfil.perfil,
                                })),
                              ]}
                              value={currentProfile || 0}
                              onChange={(value) => {
                                handleProfileChange(
                                  index,
                                  value.toString()
                                );
                                setValue(
                                  `lstVacantes.${index}.idPerfil`,
                                  Number(value)
                                );
                              }}
                              placeholder="Seleccione un perfil"
                            />
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
                                  openModalAddCareer(
                                    tempVacancyId,
                                    currentProfile
                                  )
                                }
                              >
                                <GraduationCap className="w-6 h-6" />
                                {/**@marker skills careers */}
                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalCareersForVacancy(tempVacancyId)}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar habilidades"
                                onClick={() => {
                                  handleOpenModal(
                                    tempVacancyId,
                                    currentProfile
                                  );
                                }}
                              >
                                <Wrench className="w-6 h-6" />
                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalSkillsForVacancy(tempVacancyId)}
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
                              <Trash2 className="w-6 h-6 text-red-500" />
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
