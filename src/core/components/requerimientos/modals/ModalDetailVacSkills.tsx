import { useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import { Autocomplete } from "@/core/components/ui/AutoComplete";
import { enqueueSnackbar } from "notistack";
import { AppError } from "@/core/models";
import { Loading } from "@/core/components/ui/Loading";
import {
  useFetchVacTechSkills,
  useUpdateVacTechSkills,
} from "@/core/hooks/requerimientos/vacantes";
import { VacanteSkill } from "@/core/models/interfaces/VacanteSkill";
import { useCreateNewTechSkill } from "@/core/hooks/requerimientos/useCreateNewTechSkill";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import { Label } from "@/core/components/ui/shadcn/label";
import { Switch } from "@/core/components/ui/shadcn/switch";
import { Hint } from "@/core/components/ui/Hint";

// Helpers
const showWarningSnack = (message: string) =>
  enqueueSnackbar({ message, variant: "warning" });

const showSuccessSnack = (message: string) =>
  enqueueSnackbar({ message, variant: "success" });

const handleAppError = (error: any, message: string) => {
  if (error instanceof AppError) showWarningSnack(error.message);
  else showWarningSnack(message);
};

const filterActiveSkills = (skills: VacanteSkill[]) =>
  skills.filter((skill) => skill.idEstadoRegistro === 1);

enum MODAL_MODES {
  ADD = "add", // Create new skills
  NORMAL = "normal", // Not editable
  EDIT = "edit", // Editable
}

interface TechSkillsModalProps {
  idVac: number;
  availableSkills: { id: number; label: string }[];
  onClose: () => void;
  refetchAvailableSkills: () => void;
}

export const ModalDetailsVacSkills = ({
  idVac,
  availableSkills,
  onClose,
  refetchAvailableSkills,
}: TechSkillsModalProps) => {
  const [skills, setSkills] = useState<VacanteSkill[]>();
  const [newSkillName, setNewSkillName] = useState("");
  const [skillCreated, setSkillCreated] = useState(false);
  const [modalMode, setModalMode] = useState<MODAL_MODES>(
    MODAL_MODES.NORMAL
  );

  /**Change modal mode */
  const changeModalMode = (mode: MODAL_MODES) => setModalMode(mode);
  const changeEditMode = () => {
    if (modalMode === MODAL_MODES.EDIT)
      changeModalMode(MODAL_MODES.NORMAL);
    else changeModalMode(MODAL_MODES.EDIT);
  };

  /** Fetch skills */
  const { fetchTechSkills, isLoading } = useFetchVacTechSkills();
  const fetchSkills = () => {
    fetchTechSkills(idVac)
      .then((res) => setSkills(res))
      .catch((error) => {
        if (error instanceof AppError)
          showWarningSnack(error.message);
        else
          showWarningSnack(
            "Error al obtener las habilidades técnicas"
          );
      });
  };

  /*First get the actual skills of the vacancy */
  useEffect(() => {
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*Handle Remove skill*/
  const handleRemoveSkill = (idHabilidad: number) => {
    setSkills(
      (prev) =>
        prev
          ?.map((skill) => {
            // Case 1: already exist in bd
            if (
              skill.idHabilidad === idHabilidad &&
              skill.idVacanteHabilidad
            ) {
              if (skill.idEstadoRegistro === 1) {
                return { ...skill, idEstadoRegistro: 0 }; // set as removed
              }
              return null; // if already removed, remove from state
            }

            // Case 2: new skill, not in bd
            if (
              skill.idHabilidad === idHabilidad &&
              !skill.idVacanteHabilidad
            ) {
              return null; // remove from state
            }

            return skill;
          })
          .filter(Boolean) as VacanteSkill[]
    );
  };

  const handleAddSkill = (option: { id: number; label: string }) => {
    if (!skills) return;

    // Buscar si ya existe la habilidad
    const existingSkill = skills.find(
      (s) => s.idHabilidad === option.id
    );

    if (existingSkill) {
      if (existingSkill.idEstadoRegistro === 1) {
        // Ya está activa
        showWarningSnack("La habilidad ya fue agregada");
        return;
      } else {
        // Estaba eliminada → reactivamos
        const updatedSkills = skills.map((s) =>
          s.idHabilidad === option.id
            ? { ...s, idEstadoRegistro: 1, anios: s.anios || 1 } // reactivar y resetear años
            : s
        );
        setSkills(updatedSkills);
        return;
      }
    }

    // Crear nueva habilidad si no existe
    const newSkill: VacanteSkill = {
      idVacanteHabilidad: undefined, // No existe en BD aún
      idHabilidad: option.id,
      idVacante: idVac,
      habilidad: option.label,
      idEstadoRegistro: 1, // Activa
      anios: 1, // Valor inicial
      isOptional: false,
    };

    setSkills([...skills, newSkill]);
  };

  const handleYearsChange = (idHabilidad: number, years: number) => {
    setSkills((prev) =>
      prev?.map((skill) =>
        skill.idHabilidad === idHabilidad
          ? { ...skill, anios: years }
          : skill
      )
    );
  };

  const handleOptionalChange = (
    idHabilidad: number,
    isOptional: boolean
  ) => {
    setSkills((prev) =>
      prev?.map((skill) =>
        skill.idHabilidad === idHabilidad
          ? { ...skill, isOptional }
          : skill
      )
    );
  };

  /** Update skills */
  const [isUpdating, update] = useUpdateVacTechSkills();
  const handleUpdate = () => {
    // Send data to API
    if (!skills) return;
    update(idVac, skills)
      .then((res) => {
        showSuccessSnack(res?.mensaje || "Habilidades actualizadas");
        fetchSkills();
        changeEditMode();
      })
      .catch((e) => {
        if (e instanceof AppError) showWarningSnack(e.message);
        else
          showWarningSnack(
            "Error al actualizar las habilidades técnicas"
          );
      });
  };

  const handleOnClose = () => {
    if (skillCreated) refetchAvailableSkills();
    setSkillCreated(false);
    onClose();
  };

  const { createNewTechSkill, isLoading: isCreating } =
    useCreateNewTechSkill();
  const [autoQuery, setAutoQuery] = useState("");
  const handleCreateNewOne = async (skillName: string) => {
    // Skill already exists
    const exists = availableSkills.some(
      (s) => s.label === skillName.toUpperCase()
    );
    if (exists) {
      showWarningSnack(`La habilidad ${skillName} ya existe`);
      return;
    }
    // Create new one
    createNewTechSkill(skillName)
      .then((res) => {
        const { baseResponse, idSkill } = res.data;
        showSuccessSnack(baseResponse.mensaje);
        availableSkills.push({
          id: idSkill,
          label: skillName.toUpperCase(),
        });
        setSkillCreated(true);
        changeModalMode(MODAL_MODES.EDIT);
        setAutoQuery("");
        refetchAvailableSkills();
      })
      .catch((err) =>
        handleAppError(err, "Error al crear la nueva habilidad")
      );
  };

  const handleCancelNewSkill = () => {
    changeModalMode(MODAL_MODES.NORMAL);
    setNewSkillName("");
  };

  return (
    // Escape cierra como la X (handleOnClose); un clic fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) handleOnClose(); }}>
      <DialogContent
        overlayClassName="bg-black/40"
        className="flex w-full max-w-none md:w-[90%] lg:w-[800px] min-h-[500px] max-h-[80vh] flex-col gap-0 overflow-hidden p-6 shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {(isLoading || isUpdating || isCreating) && (
          <Loading opacity="opacity-50" />
        )}
        <div
          className="flex-col flex-1 min-h-0"
          style={{
            display:
              modalMode === MODAL_MODES.ADD ? "none" : "flex",
          }}
        >
          <DialogTitle className="text-lg font-bold mb-4 shrink-0">
            Lista de habilidades para esta vacante
          </DialogTitle>
          <div className="flex justify-end my-2 shrink-0">
            <Button
              variant="outline-blue"
              className="mx-1"
              onClick={changeEditMode}
            >
              {modalMode === MODAL_MODES.EDIT ? "Cancelar" : "Editar"}
              <Pencil className="w-6 h-6" />
            </Button>
          </div>

          <button
            type="button"
            aria-label="Cerrar"
            onClick={handleOnClose}
            className="absolute top-4 right-4 focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col gap-4 flex-1 min-h-0">
            {/* Sección de búsqueda */}
            <div className="flex flex-col gap-3 p-3 border rounded-lg bg-gray-50 shrink-0 dark:bg-slate-800 dark:border-slate-700">
              <Autocomplete
                options={availableSkills}
                onSelect={handleAddSkill}
                disabled={modalMode !== MODAL_MODES.EDIT}
                placeholder="Buscar o seleccionar habilidad..."
                value={autoQuery}
                onQueryChange={setAutoQuery}
              />
            </div>

            {/* Lista de habilidades mejorada */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <h3 className="text-sm font-medium text-gray-700 mb-3 dark:text-slate-200">
                Habilidades seleccionadas (
                {filterActiveSkills(skills || []).length})
              </h3>
              {filterActiveSkills(skills || []).length > 0 ? (
                <div className="grid gap-3">
                  {filterActiveSkills(skills || []).map((skill) => (
                    <div
                      key={skill.idHabilidad}
                      className={`group flex items-center justify-between p-4 border-2 rounded-xl transition-all duration-200 dark:border-slate-700 ${
                        skill.isOptional
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:border-blue-500/30 dark:hover:bg-blue-500/15"
                          : "bg-white border-gray-200 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600"
                      }`}
                    >
                      {/* Lado izquierdo: Nombre y badge */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-slate-50">
                            {skill.habilidad}
                          </span>
                          {skill.isOptional ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                              Opcional
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300">
                              Obligatorio
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Centro: Años de experiencia */}
                      <div className="flex items-center gap-2 mx-4">
                        <Label
                          htmlFor={`vac-skill-years-${skill.idHabilidad}`}
                          className="text-sm font-medium text-gray-700 dark:text-slate-200"
                        >
                          Años:
                        </Label>
                        <Input
                          id={`vac-skill-years-${skill.idHabilidad}`}
                          type="number"
                          min={0}
                          disabled={modalMode !== MODAL_MODES.EDIT}
                          value={skill.anios}
                          onChange={(e) => {
                            const numValue =
                              parseInt(e.target.value) || 0;
                            handleYearsChange(
                              skill.idHabilidad,
                              numValue
                            );
                            if (e.target.value.startsWith("0"))
                              e.target.value = e.target.value.replace(
                                "0",
                                ""
                              );
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-16 px-2 py-1 text-center text-sm disabled:bg-gray-100 disabled:opacity-100 dark:disabled:bg-slate-700"
                        />
                      </div>

                      {/* Lado derecho: interruptor opcional y botón eliminar */}
                      <div className="flex items-center gap-3">
                        {modalMode === MODAL_MODES.EDIT && (
                          <label className="inline-flex items-center cursor-pointer">
                            <Switch
                              checked={skill.isOptional || false}
                              onCheckedChange={(checked) =>
                                handleOptionalChange(
                                  skill.idHabilidad,
                                  checked
                                )
                              }
                            />
                            <span className="ml-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                              Opcional
                            </span>
                          </label>
                        )}

                        {/* Botón eliminar */}
                        {modalMode === MODAL_MODES.EDIT && (
                          <Hint label="Eliminar habilidad">
                            <button
                              type="button"
                              aria-label={`Eliminar habilidad ${skill.habilidad}`}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 dark:hover:text-red-300 dark:hover:bg-red-500/10"
                              onClick={() =>
                                handleRemoveSkill(skill.idHabilidad)
                              }
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </Hint>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg dark:border-slate-600">
                  <p className="text-gray-500 text-sm dark:text-slate-400">
                    No hay habilidades seleccionadas
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                ¿No encuentras una habilidad?
              </p>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                onClick={() => setModalMode(MODAL_MODES.ADD)}
              >
                Crear nueva habilidad
              </button>
            </div>
            {modalMode === MODAL_MODES.EDIT && (
              <div className="flex gap-2">
                <Button variant="blue" onClick={handleUpdate} className="mx-1">
                  Actualizar
                </Button>
              </div>
            )}
          </div>
        </div>

        {modalMode === MODAL_MODES.ADD && (
          <div className="relative max-w-lg mx-auto bg-white rounded-2xl p-6 flex flex-col h-[450px] shrink-0 dark:bg-slate-800">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
                Crea una nueva habilidad
              </h2>
              <p className="text-sm text-gray-500 mt-2 dark:text-slate-400">
                Descuida, tu progreso no se perderá. Al guardar podrás
                volver a seleccionar o presiona cancelar
              </p>
            </div>

            {/* Input en el centro */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full">
                <Label
                  htmlFor="new-vac-tech-skill"
                  className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-200"
                >
                  Habilidad:
                </Label>
                <Input
                  id="new-vac-tech-skill"
                  type="text"
                  className="h-12 px-3 text-gray-700 shadow-sm"
                  value={newSkillName}
                  onChange={(e) =>
                    setNewSkillName(e.target.value.toUpperCase())
                  }
                  placeholder="Escribe el nombre de la habilidad..."
                />
              </div>
            </div>

            {/* Footer con botones */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancelNewSkill}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
                onClick={() => handleCreateNewOne(newSkillName)}
              >
                Crear
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
