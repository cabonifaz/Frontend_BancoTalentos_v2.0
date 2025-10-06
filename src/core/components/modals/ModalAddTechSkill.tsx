import { useState } from "react";
import { Autocomplete } from "../ui/AutoComplete";
import { enqueueSnackbar } from "notistack";
import { AppError } from "../../models";
import { useCreateNewTechSkill } from "../../hooks/useCreateNewTechSkill";
import { Loading } from "../ui/Loading";

export type BaseSkillProps = {
  id: number;
  label: string;
  years: number;
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
  const [skills, setSkills] = useState<BaseSkillProps[]>(initialSkills);
  const [newSkillName, setNewSkillName] = useState("");
  const [skillCreated, setSkillCreated] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "normal">("normal");

  const handleAddSkill = (option: { id: number; label: string }) => {
    if (skills.some((s) => s.id === option.id)) {
      showWarningSnack("La habilidad ya fue agregada");
      return;
    }
    setSkills([...skills, { ...option, years: 1 }]);
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
  const { createNewTechSkill, isLoading: isCreating } = useCreateNewTechSkill();
  const [autoQuery, setAutoQuery] = useState("");

  const handleCreateNewOne = async (skillName: string) => {
    // Skill already exists
    if (availableSkills.some((s) => s.label === skillName.toUpperCase())) {
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
      <div className="bg-white rounded-lg shadow-lg p-4 w-full md:w-[90%] lg:w-[800px] min-h-[500px] max-h-[80vh] overflow-y-auto relative">
        {isCreating && <Loading opacity="opacity-60" />}
        <div style={{ display: modalMode === "add" ? "none" : "block" }}>
          <h2 className="text-lg font-bold mb-4">
            Agregar habilidades técnicas
          </h2>

          <button
            type="button"
            onClick={handleOnClose}
            className="absolute top-4 right-4 focus:outline-none"
          >
            <img
              src="/assets/ic_close_x.svg"
              alt="icon close"
              className="w-6 h-6"
            />
          </button>

          <div className="flex flex-col gap-4">
            <Autocomplete
              options={availableSkills}
              onSelect={handleAddSkill}
              placeholder="Buscar o seleccionar habilidad..."
              value={autoQuery}
              onQueryChange={setAutoQuery}
            />

            <ul className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex justify-between items-center border rounded px-3 py-2 bg-gray-50 gap-2"
                >
                  <span className="flex-1">{skill.label}</span>

                  <div className="flex items-center gap-2">
                    <label className="text-sm">Años: </label>
                    <input
                      type="number"
                      min={0}
                      value={skill.years}
                      onChange={(e) => {
                        const numValue = parseInt(e.target.value) || 0;
                        handleYearsChange(skill.id, numValue);
                        if (e.target.value.startsWith("0"))
                          e.target.value = e.target.value.replace("0", "");
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-16 border rounded px-2 py-1 focus:ring focus:ring-blue-300 text-center"
                    />
                  </div>

                  <button
                    className="text-red-500 hover:text-red-700 ml-3"
                    title="Eliminar habilidad"
                    onClick={() => handleRemoveSkill(skill.id)}
                  >
                    <img
                      src="/assets/ic_close_x.svg"
                      alt="icon close"
                      className="w-4 h-4"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                ¿No encuentras una habilidad?
              </p>
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
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
          <div className="relative max-w-lg mx-auto bg-white rounded-2xl p-8 flex flex-col h-[450px]">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                Crea una nueva habilidad
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Descuida, tu progreso no se perderá. Al guardar podrás volver a
                seleccionar o presiona cancelar
              </p>
            </div>

            {/* Input en el centro */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
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
