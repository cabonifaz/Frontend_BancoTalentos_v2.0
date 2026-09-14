import { GraduationCap, Plus, Trash2, Wrench } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { newRQSchemaType } from "@/core/models/schemas/NewRQSchemaV1";
import { Utils } from "@/core/utilities/utils";
import { NumberInput } from "@/core/components/requerimientos/InputNumber";
import { useEffect, useState } from "react";
import { Tarifa } from "@/core/models/interfaces/Tarifa";
import {
  BaseSkillProps,
  TechSkillsModal,
} from "@/core/components/requerimientos/modals/ModalAddTechSkill";
import { AddCareerModal, CareerProps } from "@/core/components/requerimientos/modals/ModalAddCareer";
import { enqueueSnackbar } from "notistack";
import { useModal } from "@/core/context/ModalContext";
import {
  MODAL_ADD_CAREER,
  MODAL_ADD_TECH_SKILL,
} from "@/core/utilities/modalsIds";
import { SearchableSelect } from "@/core/components/ui/SearchableSelect";
import { Button } from "@/core/components/ui/shadcn/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/shadcn/table";
import { cn } from "@/core/lib/utils";
import {
  IconAction,
  RequirementChip,
  SectionHeader,
  TabBody,
  rqTable,
} from "@/core/components/requerimientos/rq-ui";

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

    // La tarifa solo se muestra (no va en el payload); sin tarifario, vacía.
    const found = tarifario.find((item) => item.idPerfil === idPerfil);
    setValue(
      `lstVacantes.${index}.tarifa`,
      found
        ? `${found.moneda || "S/."} ${Utils.formatCoin(Number(found.tarifa.toFixed(2)))}`
        : ""
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
  const recruiter = isRecruiter();
  // Tarifa y Tipo de tarifa no se muestran al rol Reclutador.
  const columnCount = recruiter ? 4 : 6;
  const listError =
    errors.lstVacantes?.message ?? errors.lstVacantes?.root?.message;

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
      <TabBody>
        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Vacantes"
            helper="Perfiles que solicita el cliente y cuántas personas se necesitan de cada uno."
            actions={
              <Button
                variant="blue"
                onClick={handleAddVacante}
                className="font-medium"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Agregar vacante
              </Button>
            }
          />

          <div className={rqTable.wrapper}>
            <div className="overflow-x-auto">
              <Table className={cn(rqTable.table, "min-w-[56rem]")}>
                <TableHeader>
                  <TableRow className={rqTable.headRow}>
                    <TableHead scope="col" className={rqTable.head}>
                      Perfil profesional
                    </TableHead>
                    <TableHead scope="col" className={cn(rqTable.head, "w-32")}>
                      Cantidad
                    </TableHead>
                    {!recruiter && (
                      <TableHead scope="col" className={cn(rqTable.head, "w-36 text-right")}>
                        Tarifa
                      </TableHead>
                    )}
                    {!recruiter && (
                      <TableHead scope="col" className={cn(rqTable.head, "w-36")}>
                        Tipo de tarifa
                      </TableHead>
                    )}
                    <TableHead scope="col" className={cn(rqTable.head, "w-72")}>
                      Requisitos
                    </TableHead>
                    <TableHead scope="col" className={cn(rqTable.head, "w-16")}>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length <= 0 ? (
                    <TableRow>
                      <TableCell colSpan={columnCount} className={rqTable.empty}>
                        Aún no hay vacantes. Usa «Agregar vacante» para añadir la primera.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field, index) => {
                      const currentProfile = currentVacantes[index]?.idPerfil;
                      const tempVacancyId = currentVacantes[index]?.tempVacancyId;
                      const tarifa = currentVacantes[index]?.tarifa;

                      const tipoTarifa =
                        tarifario.find((item) => item.idPerfil === currentProfile)
                          ?.tipoTarifa || "—";

                      const totalCareers = getTotalCareersForVacancy(tempVacancyId);
                      const totalSkills = getTotalSkillsForVacancy(tempVacancyId);
                      const profileError =
                        errors.lstVacantes?.[index]?.idPerfil?.message;

                      return (
                        <TableRow key={field.id} className={rqTable.row}>
                          <TableCell className={cn(rqTable.cell, "py-2.5")}>
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
                              onChange={(value) =>
                                handleProfileChange(index, value.toString())
                              }
                              placeholder="Seleccione un perfil"
                              className={cn(
                                "h-12",
                                profileError && "border-red-500 dark:border-red-400"
                              )}
                            />
                            {profileError && (
                              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                {profileError}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className={cn(rqTable.cell, "py-2.5")}>
                            <div className="flex w-20 flex-col gap-1">
                              <NumberInput<newRQSchemaType>
                                control={control}
                                name={`lstVacantes.${index}.cantidad`}
                                error={
                                  errors.lstVacantes?.[index]?.cantidad?.message
                                }
                                className="w-full text-center"
                              />
                            </div>
                          </TableCell>
                          {!recruiter && (
                            <TableCell className={cn(rqTable.cell, "text-right tabular-nums")}>
                              {tarifa || "—"}
                            </TableCell>
                          )}
                          {!recruiter && (
                            <TableCell className={rqTable.cell}>{tipoTarifa}</TableCell>
                          )}
                          <TableCell className={rqTable.cell}>
                            <div className="flex flex-wrap gap-2">
                              <RequirementChip
                                icon={GraduationCap}
                                label="Carreras"
                                count={totalCareers}
                                hint="Agregar carreras"
                                muted={!currentProfile}
                                onClick={() =>
                                  openModalAddCareer(tempVacancyId, currentProfile)
                                }
                              />
                              <RequirementChip
                                icon={Wrench}
                                label="Habilidades"
                                count={totalSkills}
                                hint="Agregar habilidades"
                                muted={!currentProfile}
                                onClick={() =>
                                  handleOpenModal(tempVacancyId, currentProfile)
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className={cn(rqTable.cell, "py-2")}>
                            <IconAction
                              icon={Trash2}
                              tone="red"
                              label="Eliminar vacante"
                              onClick={() => handleRemoveVacante(index)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          {listError && (
            <p className="text-[13px] text-red-500 dark:text-red-400">{listError}</p>
          )}
        </section>
      </TabBody>
    </>
  );
};
