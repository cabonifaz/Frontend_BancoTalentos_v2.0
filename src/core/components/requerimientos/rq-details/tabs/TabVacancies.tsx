import { GraduationCap, Info, Plus, Trash2, Wrench } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { UpdateBaseRQSchemaType } from "@/core/models/schemas/UpdateBaseRQSchema";
import { Utils } from "@/core/utilities/utils";
import { NumberInputFMIBase } from "@/core/components/requerimientos/NumberInputFMIBase";
import { Tarifa } from "@/core/models/interfaces/Tarifa";
import { showWarningSnack } from "@/core/components/requerimientos/rq-details/ui.helpers";
import {
  MODAL_DETAILS_VAC_SKILLS,
  MODAL_UPDATE_CAREER,
} from "@/core/utilities/modalsIds";
import { ModalDetailsVacSkills } from "@/core/components/requerimientos/modals/ModalDetailVacSkills";
import { useModal } from "@/core/context/ModalContext";
import { enqueueSnackbar } from "notistack";
import { ModalDetailsVacCarreras } from "@/core/components/requerimientos/modals/ModalUpdateCareer";
import { ReqVacante } from "@/core/models";
import { SearchableSelect } from "@/core/components/ui/SearchableSelect";
import { Button } from "@/core/components/ui/shadcn/button";
import { Badge } from "@/core/components/ui/shadcn/badge";
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
  rqReadonly,
  rqTable,
} from "@/core/components/requerimientos/rq-ui";

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
  refetchParams: () => void;
}

export const TabVacancies = ({
  tariff,
  vacancies,
  isEditing,
  fetchRequirement,
  availableDegrees,
  availableTechSkills,
  refetchParams,
}: TabProps) => {
  // @marker base states
  const [, setVacQuant] = useState<string[]>([]);
  const [originQuant] = useState<string[]>([]);
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

  const getAvailableProfiles = () => {
    if (!tariff || tariff.length === 0) return [];
    return tariff;
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

  const findVacancy = (vacancyId: number) =>
    vacancies.find((v) => v.idRequerimientoVacante === vacancyId);

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

  const recruiter = isRecruiter();
  // Tarifa y Tipo de tarifa no se muestran al rol Reclutador.
  const columnCount = recruiter ? 4 : 6;
  const hasUnsaved = isEditing && cVacancies.some((v) => v.idEstado === 1);
  const listError =
    errors.lstVacantes?.message ?? errors.lstVacantes?.root?.message;

  return (
    <>
      {isModalOpen(MODAL_DETAILS_VAC_SKILLS) && (
        <ModalDetailsVacSkills
          onClose={handleCloseModalSkills}
          availableSkills={availableTechSkills}
          refetchAvailableSkills={() =>
            refetchParams()
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
      <TabBody>
        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Vacantes"
            helper={
              isEditing
                ? "Cambia el perfil o la cantidad, agrega o quita vacantes y guarda los cambios."
                : "Pulsa Editar para cambiar perfiles o cantidades. Carreras y habilidades se abren desde cada vacante."
            }
            actions={
              isEditing && (
                <Button
                  variant="blue"
                  onClick={handleAddVacancy}
                  className="font-medium"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Agregar vacante
                </Button>
              )
            }
          />

          <div className={rqTable.wrapper}>
            <div className="overflow-x-auto">
              <Table className={cn(rqTable.table, "min-w-[56rem]")}>
                <TableHeader>
                  <TableRow className={rqTable.headRow}>
                    <TableHead className={rqTable.head}>Perfil profesional</TableHead>
                    <TableHead className={cn(rqTable.head, "w-32")}>Cantidad</TableHead>
                    {!recruiter && (
                      <TableHead className={cn(rqTable.head, "w-36 text-right")}>
                        Tarifa
                      </TableHead>
                    )}
                    {!recruiter && (
                      <TableHead className={cn(rqTable.head, "w-36")}>
                        Tipo de tarifa
                      </TableHead>
                    )}
                    <TableHead className={cn(rqTable.head, "w-72")}>Requisitos</TableHead>
                    <TableHead className={cn(rqTable.head, "w-16")}>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length <= 0 ? (
                    <TableRow>
                      <TableCell colSpan={columnCount} className={rqTable.empty}>
                        No hay vacantes disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field, index) => {
                      if (field.idEstado === 3) {
                        return (
                          <TableRow
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
                          </TableRow>
                        );
                      }

                      const availableProfiles = getAvailableProfiles();
                      const currentProfile = cVacancies[index]?.idPerfil;
                      const saved = findVacancy(field.idRequerimientoVacante);
                      const isNew = field.idEstado === 1;

                      // Opciones del tarifario; si el perfil guardado ya no
                      // está en él, se añade para que el campo no salga vacío.
                      const profileOptions = [
                        { value: 0, label: "Seleccione un perfil" },
                        ...availableProfiles.map((perfil) => ({
                          value: perfil.idPerfil,
                          label: perfil.perfil,
                        })),
                      ];
                      if (
                        currentProfile &&
                        saved?.perfilProfesional &&
                        !profileOptions.some((o) => o.value === currentProfile)
                      ) {
                        profileOptions.push({
                          value: currentProfile,
                          label: saved.perfilProfesional,
                        });
                      }

                      const tipoTarifa =
                        tariff.find((item) => item.idPerfil === currentProfile)
                          ?.tipoTarifa || "—";

                      const totalCareers = saved?.totalCarreras ?? 0;
                      const totalSkills = saved?.totalHabilidades ?? 0;
                      const profileError =
                        errors.lstVacantes?.[index]?.idPerfil?.message;
                      const quantityError =
                        errors.lstVacantes?.[index]?.cantidad?.message;
                      // Sin guardar no hay vacante a la que colgar requisitos.
                      const canEditRequirements = field.idRequerimientoVacante > 0;

                      return (
                        <TableRow key={field.id} className={rqTable.row}>
                          <TableCell className={cn(rqTable.cell, "py-2.5")}>
                            <div className="flex items-center gap-2">
                              <div className="min-w-0 flex-1">
                                <SearchableSelect
                                  options={profileOptions}
                                  value={currentProfile || 0}
                                  onChange={(value) =>
                                    handleProfileChange(index, value.toString())
                                  }
                                  placeholder="Seleccione un perfil"
                                  disabled={!isEditing}
                                  className={cn(
                                    "h-12",
                                    // Bloqueado se lee como un campo normal.
                                    !isEditing &&
                                      "cursor-not-allowed bg-gray-50 dark:bg-slate-800/60",
                                    profileError && "border-red-500 dark:border-red-400"
                                  )}
                                />
                              </div>
                              {isEditing && isNew && (
                                <Badge variant="green">Nueva</Badge>
                              )}
                            </div>
                            {profileError && (
                              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                                {profileError}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className={cn(rqTable.cell, "py-2.5")}>
                              <div className="flex w-20 flex-col gap-1">
                                <NumberInputFMIBase<UpdateBaseRQSchemaType>
                                  register={register}
                                  control={control}
                                  name={`lstVacantes.${index}.cantidad`}
                                  defaultValue={Number(
                                    originQuant[index] || 1
                                  )}
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
                                  disabled={!isEditing}
                                  className={cn(
                                    "h-12 w-full text-center",
                                    rqReadonly
                                  )}
                                />
                                {quantityError && (
                                  <p className="text-xs text-red-500 dark:text-red-400">
                                    {quantityError}
                                  </p>
                                )}
                              </div>
                          </TableCell>

                          {!recruiter && (
                            <TableCell className={cn(rqTable.cell, "text-right tabular-nums")}>
                              {cVacancies[index]?.tarifa || "—"}
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
                                hint={
                                  canEditRequirements
                                    ? "Ver o editar carreras"
                                    : "Guarda la vacante para agregar carreras"
                                }
                                muted={!canEditRequirements}
                                onClick={() =>
                                  openModalCareers(field.idRequerimientoVacante)
                                }
                              />
                              <RequirementChip
                                icon={Wrench}
                                label="Habilidades"
                                count={totalSkills}
                                hint={
                                  canEditRequirements
                                    ? "Ver o editar habilidades"
                                    : "Guarda la vacante para agregar habilidades"
                                }
                                muted={!canEditRequirements}
                                onClick={() =>
                                  handleOpenModal(field.idRequerimientoVacante)
                                }
                              />
                            </div>
                          </TableCell>

                          <TableCell className={cn(rqTable.cell, "py-2")}>
                            {isEditing && (
                              <IconAction
                                icon={Trash2}
                                tone="red"
                                label="Eliminar vacante"
                                onClick={() => handleRemoveVacante(index)}
                              />
                            )}
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
          {hasUnsaved && (
            <p className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400">
              <Info className="h-4 w-4 shrink-0" aria-hidden />
              Guarda las vacantes nuevas para poder agregarles carreras y habilidades.
            </p>
          )}
        </section>
      </TabBody>
    </>
  );
};
