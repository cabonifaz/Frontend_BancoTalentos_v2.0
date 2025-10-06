import { useEffect, useState } from "react";
import { Autocomplete } from "../ui/AutoComplete";
import { enqueueSnackbar } from "notistack";
import { AppError } from "../../models";
import { Loading } from "../ui/Loading";
import {
  useFetchVacTechSkills,
  useUpdateVacTechSkills,
} from "../../hooks/vacantes";
import { VacanteSkill } from "../../models/interfaces/VacanteSkill";
import { useCreateNewTechSkill } from "../../hooks/useCreateNewTechSkill";

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
  const [modalMode, setModalMode] = useState<MODAL_MODES>(MODAL_MODES.NORMAL);

  /**Change modal mode */
  const changeModalMode = (mode: MODAL_MODES) => setModalMode(mode);
  const changeEditMode = () => {
    if (modalMode === MODAL_MODES.EDIT) changeModalMode(MODAL_MODES.NORMAL);
    else changeModalMode(MODAL_MODES.EDIT);
  };

  /** Fetch skills */
  const { fetchTechSkills, isLoading } = useFetchVacTechSkills();
  const fetchSkills = () => {
    fetchTechSkills(idVac)
      .then((res) => setSkills(res))
      .catch((error) => {
        if (error instanceof AppError) showWarningSnack(error.message);
        else showWarningSnack("Error al obtener las habilidades técnicas");
      });
  };

  /*First get the actual skills of the vacancy */
  useEffect(() => {
    fetchSkills();
  }, []);

  /*Handle Remove skill*/
  const handleRemoveSkill = (idHabilidad: number) => {
    setSkills(
      (prev) =>
        prev
          ?.map((skill) => {
            // Case 1: already exist in bd
            if (skill.idHabilidad === idHabilidad && skill.idVacanteHabilidad) {
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
    const existingSkill = skills.find((s) => s.idHabilidad === option.id);

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
    };

    setSkills([...skills, newSkill]);
  };

  const handleYearsChange = (idHabilidad: number, years: number) => {
    setSkills((prev) =>
      prev?.map((skill) =>
        skill.idHabilidad === idHabilidad ? { ...skill, anios: years } : skill
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
        else showWarningSnack("Error al actualizar las habilidades técnicas");
      });
  };

  const handleOnClose = () => {
    if (skillCreated) refetchAvailableSkills();
    setSkillCreated(false);
    onClose();
  };

  const { createNewTechSkill, isLoading: isCreating } = useCreateNewTechSkill();
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
        availableSkills.push({ id: idSkill, label: skillName.toUpperCase() });
        setSkillCreated(true);
        changeModalMode(MODAL_MODES.EDIT);
        setAutoQuery("");
      })
      .catch((err) => handleAppError(err, "Error al crear la nueva habilidad"));
  };

  const handleCancelNewSkill = () => {
    changeModalMode(MODAL_MODES.NORMAL);
    setNewSkillName("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-4 w-full md:w-[90%] lg:w-[800px] min-h-[500px] max-h-[80vh] overflow-y-auto relative">
        {(isLoading || isUpdating || isCreating) && (
          <Loading opacity="opacity-60" />
        )}
        <div
          style={{ display: modalMode === MODAL_MODES.ADD ? "none" : "block" }}
        >
          <h2 className="text-lg font-bold mb-4">
            Lista de habilidades para esta vacante
          </h2>
          <div className="flex justify-end my-2">
            <button
              className="btn btn-outline-blue flex gap-2 items-center"
              onClick={changeEditMode}
            >
              {modalMode === MODAL_MODES.EDIT ? "Cancelar" : "Editar"}
              <img
                src="/assets/ic_edit.svg"
                alt="icon edit"
                className="w-6 h-6"
              />
            </button>
          </div>

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
              disabled={modalMode !== MODAL_MODES.EDIT}
              placeholder="Buscar o seleccionar habilidad..."
              value={autoQuery}
              onQueryChange={setAutoQuery}
            />

            <ul className="flex flex-wrap gap-2">
              {filterActiveSkills(skills || []).map((skill) => (
                <li
                  key={skill.idHabilidad}
                  className="flex justify-between items-center border rounded px-3 py-2 bg-gray-50 gap-2"
                >
                  <span className="flex-1">{skill.habilidad}</span>

                  <div className="flex items-center gap-2">
                    <label className="text-sm">Años: </label>
                    <input
                      className="w-16 border rounded px-2 py-1 focus:ring focus:ring-blue-300 text-center"
                      type="number"
                      min={0}
                      disabled={modalMode !== MODAL_MODES.EDIT}
                      value={skill.anios}
                      onChange={(e) => {
                        const numValue = parseInt(e.target.value) || 0;
                        handleYearsChange(skill.idHabilidad, numValue);
                        if (e.target.value.startsWith("0"))
                          e.target.value = e.target.value.replace("0", "");
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>

                  <button
                    className="text-red-500 hover:text-red-700 ml-3"
                    title="Eliminar habilidad"
                    disabled={modalMode !== MODAL_MODES.EDIT}
                    onClick={() => handleRemoveSkill(skill.idHabilidad)}
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
                onClick={() => setModalMode(MODAL_MODES.ADD)}
              >
                Crear nueva habilidad
              </button>
            </div>
            {modalMode === MODAL_MODES.EDIT && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="btn btn-blue"
                >
                  Actualizar
                </button>
              </div>
            )}
          </div>
        </div>

        {modalMode === MODAL_MODES.ADD && (
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
