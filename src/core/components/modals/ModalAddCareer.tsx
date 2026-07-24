import { useState } from "react";
import { X } from "lucide-react";
import { enqueueSnackbar } from "notistack";

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full md:w-[90%] lg:w-[700px] min-h-[400px] max-h-[80vh] overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          Seleccionar carreras
        </h2>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 focus:outline-none"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Inputs */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300"
              placeholder="Nombre de la carrera..."
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
            />

            <select
              className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-blue-300"
              value={selectedDegreeId}
              onChange={(e) =>
                setSelectedDegreeId(parseInt(e.target.value) || "")
              }
            >
              <option value="">Selecciona un grado...</option>
              {degreeOptions.map((degree) => (
                <option key={degree.id} value={degree.id}>
                  {degree.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-blue shadow-sm"
              onClick={handleAddCareer}
            >
              Agregar
            </button>
          </div>

          {/* Checkbox para carrera opcional */}
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isOptional}
                  onChange={(e) => setIsOptional(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`block w-10 h-6 rounded-full transition-colors duration-200 ${
                    isOptional ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                      isOptional ? "transform translate-x-4" : ""
                    }`}
                  ></div>
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                Carrera opcional
              </span>
            </label>
            <div className="group relative">
              <svg
                className="w-4 h-4 text-gray-400 cursor-help"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                Si está marcado, esta carrera será opcional para el
                candidato
              </div>
            </div>
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
                  className={`flex justify-between items-center border rounded px-3 py-2 transition-colors ${
                    career.isOptional
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div>
                      <span className="font-medium">
                        {career.label}
                      </span>{" "}
                      <span className="text-sm text-gray-500">
                        ({degree?.label ?? "Sin grado"})
                      </span>
                    </div>
                    {career.isOptional && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Opcional
                      </span>
                    )}
                    {!career.isOptional && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Obligatorio
                      </span>
                    )}
                  </div>

                  <button
                    className="text-red-500 hover:text-red-700 ml-3"
                    title="Eliminar carrera"
                    onClick={() => handleRemoveCareer(career.label)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              );
            })
          ) : (
            <li className="text-gray-500 text-sm">
              No hay carreras agregadas.
            </li>
          )}
        </ul>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-end px-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
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
    </div>
  );
};
