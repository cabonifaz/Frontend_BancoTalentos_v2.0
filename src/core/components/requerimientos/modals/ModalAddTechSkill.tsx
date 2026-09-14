import { useState } from "react";
import { X } from "lucide-react";
import { Autocomplete } from "@/core/components/ui/AutoComplete";
import { enqueueSnackbar } from "notistack";
import { AppError } from "@/core/models";
import { useCreateNewTechSkill } from "@/core/hooks/requerimientos/useCreateNewTechSkill";
import { Loading } from "@/core/components/ui/Loading";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import { Label } from "@/core/components/ui/shadcn/label";
import { Switch } from "@/core/components/ui/shadcn/switch";
import { Hint } from "@/core/components/ui/Hint";

export type BaseSkillProps = {
  id: number;
  label: string;
  years: number;
  isOptional: boolean;
};

interface TechSkillsModalProps {
  availableSkills: { id: number; label: string }[];
  initialSkills?: BaseSkillProps[];
  onSave: (skills: BaseSkillProps[]) => void;
  onClose: () => void;
  refetchAvailableSkills: () => void;
}

// Some helpers
const showWarningSnack = (message: string) =>
  enqueueSnackbar({ message, variant: "warning" });

const showSuccessSnack = (message: string) =>
  enqueueSnackbar({ message, variant: "success" });

const handleAppError = (error: any, message: string) => {
  if (error instanceof AppError) {
    showWarningSnack(error.message);
  } else {
    showWarningSnack(message);
  }
};

export const TechSkillsModal = ({
  availableSkills,
  onSave,
  onClose,
  refetchAvailableSkills,
  initialSkills = [],
}: TechSkillsModalProps) => {
  const [skills, setSkills] =
    useState<BaseSkillProps[]>(initialSkills);
  const [newSkillName, setNewSkillName] = useState("");
  const [skillCreated, setSkillCreated] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "normal">(
    "normal"
  );

  const handleAddSkill = (option: { id: number; label: string }) => {
    if (skills.some((s) => s.id === option.id)) {
      showWarningSnack("La habilidad ya fue agregada");
      return;
    }
    setSkills([
      ...skills,
      { ...option, years: 1, isOptional: false },
    ]);
  };

  const handleRemoveSkill = (id: number) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  const handleYearsChange = (id: number, years: number) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.id === id ? { ...skill, years: years } : skill
      )
    );
  };

  const handleOptionalChange = (id: number, isOptional: boolean) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.id === id ? { ...skill, isOptional } : skill
      )
    );
  };

  const handleSave = () => {
    onSave(skills);
    setSkills([]);
    handleOnClose();
  };

  const handleOnClose = () => {
    if (skillCreated) refetchAvailableSkills();
    setSkillCreated(false);
    onClose();
  };

  /** Create new skills */
  const { createNewTechSkill, isLoading: isCreating } =
    useCreateNewTechSkill();
  const [autoQuery, setAutoQuery] = useState("");

  const handleCreateNewOne = async (skillName: string) => {
    // Skill already exists
    if (
      availableSkills.some((s) => s.label === skillName.toUpperCase())
    ) {
      showWarningSnack(`La habilidad ${skillName} ya existe`);
      return;
    }

    try {
      const { data } = await createNewTechSkill(skillName);
      showSuccessSnack(data.baseResponse.mensaje);
      setModalMode("normal");
      setNewSkillName("");

      /** Add the new skill to the available skills */
      availableSkills.push({
        id: data.idSkill,
        label: skillName.toUpperCase(),
      });
      setSkillCreated(true);
      setAutoQuery("");
      refetchAvailableSkills();
    } catch (error: any) {
      handleAppError(error, "Error al crear la habilidad técnica");
    }
  };

  const handleCancelNewSkill = () => {
    setModalMode("normal");
    setNewSkillName("");
  };

  return (
    // Escape cierra como la X (handleOnClose); un clic fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) handleOnClose(); }}>
      <DialogContent
        className="flex w-full max-w-none md:w-[90%] lg:w-[800px] min-h-[500px] max-h-[80vh] flex-col gap-0 overflow-hidden p-6"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {isCreating && <Loading opacity="opacity-60" />}
        <div
          className="flex-col flex-1 min-h-0"
          style={{ display: modalMode === "add" ? "none" : "flex" }}
        >
          <DialogTitle className="text-lg font-bold mb-4 shrink-0">
            Agregar habilidades técnicas
          </DialogTitle>

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
                placeholder="Buscar o seleccionar habilidad..."
                value={autoQuery}
                onQueryChange={setAutoQuery}
              />
            </div>

            {/* Lista de habilidades mejorada */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <h3 className="text-sm font-medium text-gray-700 mb-3 dark:text-slate-200">
                Habilidades seleccionadas ({skills.length})
              </h3>
              {skills.length > 0 ? (
                <div className="grid gap-3">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
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
                            {skill.label}
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
                          htmlFor={`skill-years-${skill.id}`}
                          className="text-sm font-medium text-gray-700 dark:text-slate-200"
                        >
                          Años:
                        </Label>
                        <Input
                          id={`skill-years-${skill.id}`}
                          type="number"
                          min={0}
                          value={skill.years}
                          onChange={(e) => {
                            const numValue =
                              parseInt(e.target.value) || 0;
                            handleYearsChange(skill.id, numValue);
                            if (e.target.value.startsWith("0"))
                              e.target.value = e.target.value.replace(
                                "0",
                                ""
                              );
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-16 px-2 py-1 text-center text-sm"
                        />
                      </div>

                      {/* Lado derecho: interruptor opcional y botón eliminar */}
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <Switch
                            checked={skill.isOptional || false}
                            onCheckedChange={(checked) =>
                              handleOptionalChange(skill.id, checked)
                            }
                          />
                          <span className="ml-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                            Opcional
                          </span>
                        </label>

                        {/* Botón eliminar */}
                        <Hint label="Eliminar habilidad">
                          <button
                            type="button"
                            aria-label={`Eliminar habilidad ${skill.label}`}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 dark:hover:text-red-300 dark:hover:bg-red-500/10"
                            onClick={() => handleRemoveSkill(skill.id)}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </Hint>
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
                onClick={() => setModalMode("add")}
              >
                Crear nueva habilidad
              </button>
            </div>
            <div className="flex gap-2">
              {/* Era `btn btn-secondary`, clase inexistente: ghost es lo más fiel. */}
              <Button variant="ghost" onClick={handleOnClose} className="mx-1">
                Cancelar
              </Button>
              <Button variant="blue" onClick={handleSave} className="mx-1">
                Guardar
              </Button>
            </div>
          </div>
        </div>

        {modalMode === "add" && (
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
                  htmlFor="new-tech-skill"
                  className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-200"
                >
                  Habilidad:
                </Label>
                <Input
                  id="new-tech-skill"
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
