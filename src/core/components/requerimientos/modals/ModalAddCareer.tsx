import { useState } from "react";
import { X } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { Dialog, DialogContent, DialogTitle } from "@/core/components/ui/shadcn/dialog";
import { Button } from "@/core/components/ui/shadcn/button";
import { Input } from "@/core/components/ui/shadcn/input";
import { Label } from "@/core/components/ui/shadcn/label";
import { Switch } from "@/core/components/ui/shadcn/switch";
import { AppSelect } from "@/core/components/ui/AppSelect";
import { Hint } from "@/core/components/ui/Hint";

export type CareerProps = {
  label: string;
  degreeId: number;
  isOptional: boolean;
};

interface CareerModalProps {
  degreeOptions: { id: number; label: string }[];
  initialCareers?: CareerProps[];
  onSave: (careers: CareerProps[]) => void;
  onClose: () => void;
}

const showWarningSnack = (message: string) =>
  enqueueSnackbar({ message, variant: "warning" });

export const AddCareerModal = ({
  degreeOptions,
  initialCareers = [],
  onSave,
  onClose,
}: CareerModalProps) => {
  const [careerName, setCareerName] = useState("");
  const [selectedDegreeId, setSelectedDegreeId] = useState<
    number | ""
  >("");
  const [isOptional, setIsOptional] = useState(false);
  const [careers, setCareers] =
    useState<CareerProps[]>(initialCareers);

  const handleAddCareer = () => {
    const trimmedName = careerName.trim();

    if (!trimmedName || !selectedDegreeId) {
      showWarningSnack(
        "Debes ingresar una carrera y seleccionar un grado."
      );
      return;
    }

    // Evita duplicados por nombre (case-insensitive)
    if (
      careers.some(
        (c) => c.label.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      showWarningSnack("La carrera ya fue agregada.");
      return;
    }

    setCareers([
      ...careers,
      { label: trimmedName, degreeId: selectedDegreeId, isOptional },
    ]);
    setCareerName("");
    setSelectedDegreeId("");
    setIsOptional(false);
  };

  const handleRemoveCareer = (label: string) => {
    setCareers(careers.filter((c) => c.label !== label));
  };

  const handleSave = () => {
    onSave(careers);
    onClose();
  };

  return (
    // Escape cierra como la X; un clic fuera no (como antes).
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="block w-full max-w-none md:w-[90%] lg:w-[700px] min-h-[400px] max-h-[80vh] overflow-y-auto p-6"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-lg font-bold mb-4 text-gray-800 dark:text-slate-100">
          Seleccionar carreras
        </DialogTitle>

        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-4 right-4 focus:outline-none"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Inputs */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              aria-label="Nombre de la carrera"
              className="h-12 px-3"
              placeholder="Nombre de la carrera..."
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
            />

            <AppSelect
              aria-label="Grado"
              className="h-12 px-3"
              value={selectedDegreeId}
              onChange={(v) => setSelectedDegreeId(parseInt(v) || "")}
              options={degreeOptions.map((d) => ({ value: d.id, label: d.label }))}
              placeholder="Selecciona un grado..."
            />

            <Button variant="blue" className="mx-1 h-12 shadow-sm" onClick={handleAddCareer}>
              Agregar
            </Button>
          </div>

          {/* Interruptor para carrera opcional */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center">
              <Switch
                id="career-optional"
                size="md"
                checked={isOptional}
                onCheckedChange={setIsOptional}
              />
              <Label
                htmlFor="career-optional"
                className="ml-3 cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-200"
              >
                Carrera opcional
              </Label>
            </div>
            <Hint label="Si está marcado, esta carrera será opcional para el candidato">
              <button
                type="button"
                aria-label="Qué significa carrera opcional"
                className="text-gray-400 cursor-help dark:text-slate-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </Hint>
          </div>
        </div>

        {/* Lista de carreras agregadas */}
        <ul className="flex flex-col gap-2 mb-12">
          {careers.length > 0 ? (
            careers.map((career, index) => {
              const degree = degreeOptions.find(
                (d) => d.id === career.degreeId
              );
              return (
                <li
                  key={`${career.label}-${index}`}
                  className={`flex justify-between items-center border rounded px-3 py-2 transition-colors dark:border-slate-700 ${
                    career.isOptional
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30"
                      : "bg-gray-50 dark:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="font-medium">
                        {career.label}
                      </span>{" "}
                      <span className="text-sm text-gray-500 dark:text-slate-400">
                        ({degree?.label ?? "Sin grado"})
                      </span>
                    </div>
                    {career.isOptional && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                        Opcional
                      </span>
                    )}
                    {!career.isOptional && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300">
                        Obligatorio
                      </span>
                    )}
                  </div>

                  <Hint label="Eliminar carrera">
                    <button
                      type="button"
                      aria-label={`Eliminar carrera ${career.label}`}
                      className="text-red-500 hover:text-red-700 ml-3 dark:hover:text-red-300"
                      onClick={() => handleRemoveCareer(career.label)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </Hint>
                </li>
              );
            })
          ) : (
            <li className="text-gray-500 text-sm dark:text-slate-400">
              No hay carreras agregadas.
            </li>
          )}
        </ul>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-end px-4">
          <div className="flex gap-2">
            {/* Era `btn btn-secondary`, clase que no existe en App.css: se
                veía como texto con padding. ghost es lo más fiel. */}
            <Button variant="ghost" onClick={onClose} className="mx-1">
              Cancelar
            </Button>
            <Button variant="blue" onClick={handleSave} className="mx-1">
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
