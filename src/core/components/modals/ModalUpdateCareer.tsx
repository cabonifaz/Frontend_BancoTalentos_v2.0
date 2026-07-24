import { useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { AppError } from "../../models";
import { Loading } from "../ui/Loading";
import {
  useFetchVacCarreras,
  useUpdateVacCarreras,
} from "../../hooks/carreras";
import { VacanteCarrera } from "../../models/interfaces/VacanteCarrera";

// Helpers
const showWarningSnack = (message: string) =>
  enqueueSnackbar({ message, variant: "warning" });

const showSuccessSnack = (message: string) =>
  enqueueSnackbar({ message, variant: "success" });

enum MODAL_MODES {
  NORMAL = "normal",
  EDIT = "edit",
}

interface ModalDetailsVacCarrerasProps {
  idVac: number;
  availableDegrees: { id: number; label: string }[];
  onClose: () => void;
}

export const ModalDetailsVacCarreras = ({
  idVac,
  availableDegrees,
  onClose,
}: ModalDetailsVacCarrerasProps) => {
  const [carreras, setCarreras] = useState<VacanteCarrera[]>([]);
  const [modalMode, setModalMode] = useState<MODAL_MODES>(
    MODAL_MODES.NORMAL
  );
  const [newCareer, setNewCareer] = useState("");

  const { fetchCarreras, isLoading } = useFetchVacCarreras();
  const { isUpdating, update } = useUpdateVacCarreras();

  /** Obtener carreras */
  const loadCarreras = () => {
    fetchCarreras(idVac)
      .then((res) => {
        setCarreras(res.carreras);
      })
      .catch((err) => {
        if (err instanceof AppError) showWarningSnack(err.message);
        else showWarningSnack("Error al obtener las carreras");
      });
  };

  useEffect(() => {
    loadCarreras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Cambiar modo */
  const toggleEditMode = () => {
    setModalMode((prev) =>
      prev === MODAL_MODES.EDIT
        ? MODAL_MODES.NORMAL
        : MODAL_MODES.EDIT
    );
  };

  /** Agregar carrera */
  const handleAddCareer = () => {
    const name = newCareer.trim().toUpperCase();
    if (!name) return;

    const exists = carreras.find(
      (c) => c.carrera.toUpperCase() === name
    );

    if (exists && exists.idEstadoRegistro === 1) {
      showWarningSnack("La carrera ya fue agregada");
      return;
    }

    if (exists && exists.idEstadoRegistro === 0) {
      // Reactivar carrera
      setCarreras((prev) =>
        prev.map((c) =>
          c.carrera.toUpperCase() === name
            ? { ...c, idEstadoRegistro: 1 }
            : c
        )
      );
      setNewCareer("");
      return;
    }

    // Crear nueva carrera
    const newCarrera: VacanteCarrera = {
      idVacanteCarrera: undefined,
      idVacante: idVac,
      carrera: name,
      idGradoEstudios: 0, // valor inicial: "Seleccione un grado"
      idEstadoRegistro: 1,
      isOptional: false,
    };

    setCarreras((prev) => [...prev, newCarrera]);
    setNewCareer("");
  };

  /** Eliminar carrera */
  const handleRemoveCareer = (nombreCarrera: string) => {
    setCarreras(
      (prev) =>
        prev
          .map((c) => {
            // Si existe en BD, marcar como inactiva
            if (c.carrera === nombreCarrera && c.idVacanteCarrera) {
              return { ...c, idEstadoRegistro: 0 };
            }
            // Si es nueva, eliminar físicamente
            if (c.carrera === nombreCarrera && !c.idVacanteCarrera) {
              return null;
            }
            return c;
          })
          .filter(Boolean) as VacanteCarrera[]
    );
  };

  /** Actualizar grado de estudios */
  const handleChangeGrado = (
    nombreCarrera: string,
    idGrado: number
  ) => {
    setCarreras((prev) =>
      prev.map((c) =>
        c.carrera === nombreCarrera
          ? { ...c, idGradoEstudios: idGrado }
          : c
      )
    );
  };

  /** Actualizar estado opcional de una carrera */
  const handleChangeOptional = (
    nombreCarrera: string,
    isOptional: boolean
  ) => {
    setCarreras((prev) =>
      prev.map((c) =>
        c.carrera === nombreCarrera ? { ...c, isOptional } : c
      )
    );
  };

  /** Actualizar carreras */
  const handleUpdate = () => {
    update(idVac, carreras)
      .then((res) => {
        showSuccessSnack(
          res?.mensaje || "Carreras actualizadas correctamente"
        );
        loadCarreras();
        toggleEditMode();
      })
      .catch((err) => {
        if (err instanceof AppError) showWarningSnack(err.message);
        else showWarningSnack("Error al actualizar las carreras");
      });
  };

  /** Filtrar carreras activas */
  const activeCarreras = carreras.filter(
    (c) => c.idEstadoRegistro === 1
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full md:w-[90%] lg:w-[700px] min-h-[400px] max-h-[80vh] overflow-y-auto relative">
        {(isLoading || isUpdating) && (
          <Loading opacity="opacity-60" />
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Lista de carreras asociadas
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline-blue flex gap-2 items-center"
              onClick={toggleEditMode}
            >
              {modalMode === MODAL_MODES.EDIT ? "Cancelar" : "Editar"}
              <Pencil className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Input para nueva carrera */}
        {modalMode === MODAL_MODES.EDIT && (
          <div className="flex flex-col gap-3 mb-4 p-3 border rounded-lg bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                placeholder="Escribe el nombre de una carrera..."
                value={newCareer}
                onChange={(e) => setNewCareer(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAddCareer()
                }
              />
              <button
                type="button"
                onClick={handleAddCareer}
                className="btn btn-blue"
              >
                Agregar
              </button>
            </div>
          </div>
        )}

        {/* Lista de carreras */}
        <ul className="flex flex-col gap-2">
          {activeCarreras.length > 0 ? (
            activeCarreras.map((c, i) => (
              <li
                key={`${c.carrera}-${i}`}
                className={`flex flex-col gap-3 border rounded px-3 py-3 transition-colors ${
                  c.isOptional
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50"
                }`}
              >
                {/* Fila superior: Nombre y acciones */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium">{c.carrera}</span>
                    {/* Badge de estado */}
                    {c.isOptional ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Opcional
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Obligatorio
                      </span>
                    )}
                  </div>

                  {modalMode === MODAL_MODES.EDIT && (
                    <button
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar carrera"
                      onClick={() => handleRemoveCareer(c.carrera)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Fila inferior: Grado y switch opcional */}
                <div className="flex justify-between items-center">
                  {/* Select grado de estudios */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Grado:
                    </span>
                    {modalMode === MODAL_MODES.EDIT ? (
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={c.idGradoEstudios ?? 0}
                        onChange={(e) =>
                          handleChangeGrado(
                            c.carrera,
                            Number(e.target.value)
                          )
                        }
                      >
                        <option value={0}>Seleccione un grado</option>
                        {availableDegrees.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-800">
                        {availableDegrees.find(
                          (g) => g.id === c.idGradoEstudios
                        )?.label || "Sin grado"}
                      </span>
                    )}
                  </div>

                  {/* Switch para carrera opcional */}
                  {modalMode === MODAL_MODES.EDIT && (
                    <label className="inline-flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={c.isOptional || false}
                          onChange={(e) =>
                            handleChangeOptional(
                              c.carrera,
                              e.target.checked
                            )
                          }
                          className="sr-only"
                        />
                        <div
                          className={`block w-8 h-5 rounded-full transition-colors duration-200 ${
                            c.isOptional
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                              c.isOptional
                                ? "transform translate-x-3"
                                : ""
                            }`}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-700">
                        Opcional
                      </span>
                    </label>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic">
              No hay carreras asociadas aún.
            </li>
          )}
        </ul>

        {/* Footer */}
        {modalMode === MODAL_MODES.EDIT && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleUpdate}
              className="btn btn-blue"
            >
              Guardar cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
