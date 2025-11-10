import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { UpdateBaseRQSchemaType } from "../../../../models/schemas/UpdateBaseRQSchema";
import { Utils } from "../../../../utilities/utils";
import { NumberInputFMIBase } from "../../../ui/NumberInputFMIBase";
import { Tarifa } from "../../../../models/interfaces/Tarifa";
import { showWarningSnack } from "../ui.helpers";
import {
  GRADO_ESTUDIO,
  HABILIDADES_TECNICAS,
} from "../../../../utilities/constants";
import {
  MODAL_DETAILS_VAC_SKILLS,
  MODAL_UPDATE_CAREER,
} from "../../../../utilities/modalsIds";
import { ModalDetailsVacSkills } from "../../ModalDetailVacSkills";
import { useModal } from "../../../../context/ModalContext";
import { useParams } from "../../../../context/ParamsContext";
import { enqueueSnackbar } from "notistack";
import { ModalDetailsVacCarreras } from "../../ModalUpdateCareer";
import { ReqVacante } from "../../../../models";
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

interface TabProps {
  tariff: Tarifa[];
  vacancies: ReqVacante[];
  isEditing: boolean;
  availableTechSkills: { id: number; label: string }[];
  availableDegrees: { id: number; label: string }[];
  fetchRequirement: () => void;
  toggleEdit: () => void;
  refetchParams: (param: string) => void;
}

export const TabVacancies = ({
  tariff,
  vacancies,
  isEditing,
  fetchRequirement,
  toggleEdit,
  availableDegrees,
  availableTechSkills,
  refetchParams,
}: TabProps) => {
  // @marker base states
  const [vacQuant, setVacQuant] = useState<string[]>([]);
  const [originQuant, setOriginQuant] = useState<string[]>([]);
  const { closeModal, isModalOpen, openModal } = useModal();
  const [idVac, setIdVac] = useState<number | undefined>();

  // @marker form handlers
  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    clearErrors,
    watch,
    control,
  } = useFormContext<UpdateBaseRQSchemaType>();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "lstVacantes",
  });

  const cVacancies = watch("lstVacantes");

  const getAvailableProfiles = (cIndex: number) => {
    if (!tariff || tariff.length === 0) return [];

    const selectedProfiles = cVacancies
      .filter((_, index) => index !== cIndex)
      .map((v) => v.idPerfil)
      .filter((id) => id !== 0);

    return tariff.filter(
      (perfil) => !selectedProfiles.includes(perfil.idPerfil)
    );
  };

  const handleProfileChange = (index: number, value: string) => {
    const currentValue = getValues(`lstVacantes.${index}`);
    if (
      currentValue.idRequerimientoVacante > 0 &&
      currentValue.idEstado === 0
    ) {
      setValue(`lstVacantes.${index}.idEstado`, 2);
    }

    const idPerfil = Number(value);

    setValue(`lstVacantes.${index}.idPerfil`, idPerfil);

    // Verificar si hay tarifario disponible
    if (tariff && tariff.length > 0) {
      const tarifa =
        tariff
          .find((item) => item.idPerfil === idPerfil)
          ?.tarifa.toFixed(2) || "-";

      const moneda =
        tariff.find((item) => item.idPerfil === idPerfil)?.moneda ||
        "S/.";

      setValue(
        `lstVacantes.${index}.tarifa`,
        `${moneda} ${Utils.formatCoin(Number(tarifa))}`
      );
    } else {
      setValue(`lstVacantes.${index}.tarifa`, "S/. -");
    }

    clearErrors(`lstVacantes.${index}.idPerfil`);
  };

  const handleAddVacancy = () => {
    append({
      idPerfil: 0,
      cantidad: 1,
      idEstado: 1,
      idRequerimientoVacante: 0,
    });
    setVacQuant((prev) => [...prev, "1"]);
    clearErrors("lstVacantes");
  };
  const handleRemoveVacante = (index: number) => {
    const vacancies = getValues("lstVacantes").filter(
      (vacante) => vacante.idEstado !== 3
    );

    if (vacancies.length === 1) {
      showWarningSnack(
        "El Requerimiento debe tener al menos un vacante."
      );
      return;
    }

    const vacancy = getValues(`lstVacantes.${index}`);

    if (vacancy.idRequerimientoVacante > 0) {
      update(index, {
        ...vacancy,
        idEstado: 3,
      });

      setVacQuant((prev) => {
        const newCantidades = [...prev];
        newCantidades[index] = "0";
        return newCantidades;
      });
    } else {
      remove(index);
      setVacQuant((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const getTotalCareersForVacancy = (vacancyId: number) => {
    const vacancy = vacancies.find(
      (v) => v.idRequerimientoVacante === vacancyId
    );
    if (!vacancy) return 0;
    return vacancy.totalCarreras;
  };

  const getTotalSkillsForVacancy = (vacancyId: number) => {
    const vacancy = vacancies.find(
      (v) => v.idRequerimientoVacante === vacancyId
    );
    if (!vacancy) return 0;
    return vacancy.totalHabilidades;
  };

  // @marker skills modal
  /**Modal Skills close */
  const handleCloseModalSkills = () => {
    closeModal(MODAL_DETAILS_VAC_SKILLS);
    setIdVac(undefined);
    fetchRequirement();
  };
  const handleOpenModal = (idVac: number) => {
    if (!idVac || idVac === 0) {
      enqueueSnackbar({
        message:
          "Selecciona una y/o guarda la vacante para agregar habilidades técnicas.",
        variant: "warning",
      });
      return;
    }
    setIdVac(idVac);
    openModal(MODAL_DETAILS_VAC_SKILLS);
  };

  // @marker careers modal
  const closeModalCareers = () => {
    setIdVac(undefined);
    closeModal(MODAL_UPDATE_CAREER);
    fetchRequirement();
  };

  const openModalCareers = (idVac: number) => {
    if (!idVac || idVac === 0) {
      enqueueSnackbar({
        message:
          "Selecciona una y/o guarda vacante para agregar habilidades técnicas.",
        variant: "warning",
      });
      return;
    }
    setIdVac(idVac);
    openModal(MODAL_UPDATE_CAREER);
  };

  return (
    <>
      {isModalOpen(MODAL_DETAILS_VAC_SKILLS) && (
        <ModalDetailsVacSkills
          onClose={handleCloseModalSkills}
          availableSkills={availableTechSkills}
          refetchAvailableSkills={() =>
            refetchParams(`${HABILIDADES_TECNICAS}`)
          }
          idVac={idVac ?? 0}
        />
      )}
      {isModalOpen(MODAL_UPDATE_CAREER) && (
        <ModalDetailsVacCarreras
          idVac={idVac ?? 0}
          onClose={closeModalCareers}
          availableDegrees={availableDegrees}
        />
      )}
      <div className="flex flex-col h-[calc(570px-120px)]">
        <div className="flex items-center justify-between my-2">
          <button
            type="button"
            onClick={toggleEdit}
            className="focus:outline-none ms-2"
          >
            <img
              src="/assets/ic_edit.svg"
              alt="Editar"
              className="w-7 h-7"
            />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`focus:outline-none text-sm min-w-24 h-8 rounded-lg py-1 px-2 mx-1 ${
                isEditing ? "btn-blue cursor-pointer" : "btn-disabled"
              }`}
              onClick={handleAddVacancy}
              disabled={!isEditing}
            >
              Agregar
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-visible">
          <div className="table-container h-full">
            <div className="table-wrapper h-full overflow-y-auto custom-scroll">
              <table className="table">
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">
                      Perfil profesional
                    </th>
                    <th className="table-header-cell">Cantidad</th>

                    <th
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
                      className="table-header-cell"
                      style={{
                        display: isRecruiter()
                          ? "none"
                          : "table-header-cell",
                      }}
                    >
                      Tipo tarifa
                    </th>
                    <th className="table-header-cell text-center">
                      Otros
                    </th>
                    <th className="table-header-cell"></th>
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
                      if (field.idEstado === 3) {
                        return (
                          <tr
                            key={`hidden-${field.id}-${index}`}
                            className="hidden"
                          >
                            {/* Campos ocultos pero presentes en el formulario */}
                            <input
                              type="hidden"
                              {...register(
                                `lstVacantes.${index}.idEstado`
                              )}
                              value={3}
                            />
                            <input
                              type="hidden"
                              {...register(
                                `lstVacantes.${index}.idPerfil`
                              )}
                              value={0}
                            />
                            <input
                              type="hidden"
                              {...register(
                                `lstVacantes.${index}.cantidad`
                              )}
                              value={0}
                            />
                            {field.idRequerimientoVacante && (
                              <input
                                type="hidden"
                                {...register(
                                  `lstVacantes.${index}.idRequerimientoVacante`
                                )}
                                value={field.idRequerimientoVacante}
                              />
                            )}
                          </tr>
                        );
                      }

                      const availableProfiles =
                        getAvailableProfiles(index);
                      const currentProfile =
                        cVacancies[index]?.idPerfil;
                      const showCurrentProfile =
                        currentProfile === 0 ||
                        availableProfiles.some(
                          (p) => p.idPerfil === currentProfile
                        ) ||
                        !tariff.some(
                          (p) => p.idPerfil === currentProfile
                        );

                      const optionsToShow = showCurrentProfile
                        ? [...availableProfiles]
                        : [
                            ...availableProfiles,
                            ...tariff.filter(
                              (p) => p.idPerfil === currentProfile
                            ),
                          ];

                      const tipoTarifa =
                        tariff.find(
                          (item) =>
                            item.idPerfil ===
                            getValues(`lstVacantes.${index}.idPerfil`)
                        )?.tipoTarifa || "-";

                      return (
                        <tr key={index} className="table-row">
                          <td className="table-cell">
                            <SearchableSelect
                              options={[
                                {
                                  value: 0,
                                  label: "Seleccione un perfil",
                                },
                                ...optionsToShow.map((perfil) => ({
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
                              disabled={!isEditing}
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
                                <NumberInputFMIBase<UpdateBaseRQSchemaType>
                                  register={register}
                                  control={control}
                                  name={`lstVacantes.${index}.cantidad`}
                                  defaultValue={Number(
                                    originQuant[index] || 1
                                  )}
                                  disabled={!isEditing}
                                  onChange={(value) => {
                                    const numValue =
                                      Number(value) || 0;
                                    const currentValue = getValues(
                                      `lstVacantes.${index}`
                                    );
                                    if (
                                      currentValue.idRequerimientoVacante >
                                        0 &&
                                      currentValue.idEstado === 0
                                    ) {
                                      setValue(
                                        `lstVacantes.${index}.idEstado`,
                                        2
                                      );
                                    }
                                    setVacQuant((prev) => {
                                      const newCantidades = [...prev];
                                      newCantidades[index] =
                                        String(numValue);
                                      return newCantidades;
                                    });
                                    clearErrors(
                                      `lstVacantes.${index}.cantidad`
                                    );
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-[#4F46E5]"
                                />
                                {errors.lstVacantes?.[index]
                                  ?.cantidad && (
                                  <p className="text-red-500 text-xs mt-1 absolute -bottom-5">
                                    {
                                      errors.lstVacantes[index]
                                        ?.cantidad?.message
                                    }
                                  </p>
                                )}
                              </div>
                              <div className="ms-4 flex items-center">
                                {field.idEstado === 1 ? (
                                  <span className="text-sm w-fit px-2 py-1 rounded-lg bg-green-100 text-green-700 truncate mr-2">
                                    Nuevo
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td
                            className="table-cell"
                            style={{
                              display: isRecruiter()
                                ? "none"
                                : "table-cell",
                            }}
                          >
                            <input
                              {...register(
                                `lstVacantes.${index}.tarifa`
                              )}
                              defaultValue={
                                Utils.formatCoin(
                                  Number(
                                    getValues(
                                      `lstVacantes.${index}.tarifa`
                                    )
                                  )
                                )?.toString() || "-"
                              }
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
                            {tipoTarifa}
                          </td>

                          <td className="table-cell text-center relative group">
                            <div className="flex items-center gap-3 justify-center">
                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar carreras"
                                onClick={() => {
                                  const idVacante =
                                    field.idRequerimientoVacante;
                                  openModalCareers(idVacante);
                                }}
                              >
                                <img
                                  className="w-6 h-6"
                                  src="/assets/ic_student.png"
                                  alt="admin-settings-male"
                                />
                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalCareersForVacancy(
                                    field.idRequerimientoVacante
                                  )}
                                </span>
                              </button>
                              <button
                                type="button"
                                className="relative bg-white p-2 rounded rounded-full shadow-sm shadow-gray-400"
                                title="Agregar habilidades"
                                onClick={() => {
                                  const idVacante =
                                    field.idRequerimientoVacante;
                                  handleOpenModal(idVacante);
                                }}
                              >
                                <img
                                  src="/assets/ic_skills.png"
                                  alt="icon add"
                                  className="w-6 h-6"
                                />
                                <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                  {getTotalSkillsForVacancy(
                                    field.idRequerimientoVacante
                                  )}
                                </span>
                              </button>
                            </div>
                          </td>

                          <td className="table-cell">
                            {isEditing && (
                              <button
                                type="button"
                                disabled={!isEditing}
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
                            )}
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
        <div className="mt-2 self-end">
          <button
            type="submit"
            disabled={!isEditing}
            className={`focus:outline-none text-sm min-w-24 h-8 rounded-lg py-1 px-2 mx-1 ${
              isEditing
                ? "btn-primary cursor-pointer"
                : "btn-disabled"
            }`}
          >
            Actualizar
          </button>
        </div>
      </div>
    </>
  );
};
