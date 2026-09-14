import { useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { AppError } from "@/core/models";
import { Loading } from "@/core/components/ui/Loading";
import {
  useFetchVacCarreras,
  useUpdateVacCarreras,
} from "@/core/hooks/requerimientos/carreras";
import { VacanteCarrera } from "@/core/models/interfaces/VacanteCarrera";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import { Switch } from "@/core/components/ui/shadcn/switch";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { Hint } from "@/core/components/ui/Hint";

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

  const degreeOptions = availableDegrees.map((g) => ({
    value: g.id,
    label: g.label,
  }));

  return (
    // Escape cierra como la X; un clic fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        overlayClassName="bg-black/40"
        className="block w-full max-w-none md:w-[90%] lg:w-[700px] min-h-[400px] max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {(isLoading || isUpdating) && (
          <Loading opacity="opacity-60" />
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-bold text-gray-800 dark:text-slate-100">
            Lista de carreras asociadas
          </DialogTitle>

          <div className="flex gap-2">
            <Button
              variant="outline-blue"
              className="mx-1"
              onClick={toggleEditMode}
            >
              {modalMode === MODAL_MODES.EDIT ? "Cancelar" : "Editar"}
              <Pencil className="w-5 h-5" />
            </Button>

            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Input para nueva carrera */}
        {modalMode === MODAL_MODES.EDIT && (
          <div className="flex flex-col gap-3 mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex gap-2">
              <Input
                type="text"
                aria-label="Nombre de la carrera"
                className="h-12 flex-1 px-3"
                placeholder="Escribe el nombre de una carrera..."
                value={newCareer}
                onChange={(e) => setNewCareer(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleAddCareer()
                }
              />
              <Button variant="blue" onClick={handleAddCareer} className="mx-1 h-12">
                Agregar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de carreras */}
        <ul className="flex flex-col gap-2">
          {activeCarreras.length > 0 ? (
            activeCarreras.map((c, i) => (
              <li
                key={`${c.carrera}-${i}`}
                className={`flex flex-col gap-3 border rounded px-3 py-3 transition-colors dark:border-slate-700 ${
                  c.isOptional
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30"
                    : "bg-gray-50 dark:bg-slate-800"
                }`}
              >
                {/* Fila superior: Nombre y acciones */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium">{c.carrera}</span>
                    {/* Badge de estado */}
                    {c.isOptional ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                        Opcional
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300">
                        Obligatorio
                      </span>
                    )}
                  </div>

                  {modalMode === MODAL_MODES.EDIT && (
                    <Hint label="Eliminar carrera">
                      <button
                        type="button"
                        aria-label={`Eliminar carrera ${c.carrera}`}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
                        onClick={() => handleRemoveCareer(c.carrera)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Hint>
                  )}
                </div>

                {/* Fila inferior: Grado e interruptor opcional */}
                <div className="flex justify-between items-center">
                  {/* Select grado de estudios */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-slate-300">
                      Grado:
                    </span>
                    {modalMode === MODAL_MODES.EDIT ? (
                      // "Seleccione un grado" era la opción value=0: la opción
                      // vacía del AppSelect devuelve "" y Number("") es 0.
                      <AppSelect
                        aria-label={`Grado de ${c.carrera}`}
                        className="h-auto w-auto gap-1 rounded px-2 py-1 text-sm"
                        value={c.idGradoEstudios ?? 0}
                        onChange={(v) =>
                          handleChangeGrado(c.carrera, Number(v))
                        }
                        options={degreeOptions}
                        placeholder="Seleccione un grado"
                      />
                    ) : (
                      <span className="text-sm text-gray-800 dark:text-slate-100">
                        {availableDegrees.find(
                          (g) => g.id === c.idGradoEstudios
                        )?.label || "Sin grado"}
                      </span>
                    )}
                  </div>

                  {/* Interruptor para carrera opcional */}
                  {modalMode === MODAL_MODES.EDIT && (
                    <label className="inline-flex items-center cursor-pointer">
                      <Switch
                        checked={c.isOptional || false}
                        onCheckedChange={(checked) =>
                          handleChangeOptional(c.carrera, checked)
                        }
                      />
                      <span className="ml-2 text-xs font-medium text-gray-700 dark:text-slate-200">
                        Opcional
                      </span>
                    </label>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic dark:text-slate-400">
              No hay carreras asociadas aún.
            </li>
          )}
        </ul>

        {/* Footer */}
        {modalMode === MODAL_MODES.EDIT && (
          <div className="mt-6 flex justify-end">
            <Button variant="blue" onClick={handleUpdate} className="mx-1">
              Guardar cambios
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
