import { useState } from "react";
import { X } from "lucide-react";
import { Autocomplete } from "../../ui/AutoComplete";
import { enqueueSnackbar } from "notistack";
import { AppError } from "../../../models";
import { useCreateNewTechSkill } from "../../../hooks/requerimientos/useCreateNewTechSkill";
import { Loading } from "../../ui/Loading";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[800px] min-h-[500px] max-h-[80vh] overflow-hidden relative flex flex-col dark:bg-slate-800">
        {isCreating && <Loading opacity="opacity-60" />}
        <div
          className="flex-col flex-1 min-h-0"
          style={{ display: modalMode === "add" ? "none" : "flex" }}
        >
          <h2 className="text-lg font-bold mb-4 shrink-0">
            Agregar habilidades técnicas
          </h2>

          <button
            type="button"
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
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-200">
                          Años:
                        </label>
                        <input
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
                          className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:border-slate-600"
                        />
                      </div>

                      {/* Lado derecho: Switch opcional y botón eliminar */}
                      <div className="flex items-center gap-3">
                        {/* Switch para cambiar estado opcional */}
                        <label className="inline-flex items-center cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={skill.isOptional || false}
                              onChange={(e) =>
                                handleOptionalChange(
                                  skill.id,
                                  e.target.checked
                                )
                              }
                              className="sr-only"
                            />
                            <div
                              className={`block w-8 h-5 rounded-full transition-colors duration-200 ${
                                skill.isOptional
                                  ? "bg-blue-600"
                                  : "bg-gray-300 dark:bg-slate-600"
                              }`}
                            >
                              <div
                                className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 dark:bg-slate-800 ${
                                  skill.isOptional
                                    ? "transform translate-x-3"
                                    : ""
                                }`}
                              ></div>
                            </div>
                          </div>
                          <span className="ml-2 text-xs font-medium text-gray-600 dark:text-slate-300">
                            Opcional
                          </span>
                        </label>

                        {/* Botón eliminar */}
                        <button
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200 dark:hover:text-red-300 dark:hover:bg-red-500/10"
                          title="Eliminar habilidad"
                          onClick={() => handleRemoveSkill(skill.id)}
                        >
                          <X className="w-4 h-4" />
                        </button>
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
              <button
                type="button"
                onClick={handleOnClose}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-blue"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>

        {modalMode === "add" && (
          <div className="relative max-w-lg mx-auto bg-white rounded-2xl p-8 flex flex-col h-[450px] shrink-0 dark:bg-slate-800">
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
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-slate-200">
                  Habilidad:
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
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
      </div>
    </div>
  );
};
