import { useState } from "react";
import { enqueueSnackbar } from "notistack";

export type CareerProps = {
  label: string;
  degreeId: number;
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
  const [selectedDegreeId, setSelectedDegreeId] = useState<number | "">("");
  const [careers, setCareers] = useState<CareerProps[]>(initialCareers);

  const handleAddCareer = () => {
    const trimmedName = careerName.trim();

    if (!trimmedName || !selectedDegreeId) {
      showWarningSnack("Debes ingresar una carrera y seleccionar un grado.");
      return;
    }

    // Evita duplicados por nombre (case-insensitive)
    if (
      careers.some((c) => c.label.toLowerCase() === trimmedName.toLowerCase())
    ) {
      showWarningSnack("La carrera ya fue agregada.");
      return;
    }

    setCareers([
      ...careers,
      { label: trimmedName, degreeId: selectedDegreeId },
    ]);
    setCareerName("");
    setSelectedDegreeId("");
  };

  const handleRemoveCareer = (label: string) => {
    setCareers(careers.filter((c) => c.label !== label));
  };

  const handleSave = () => {
    if (careers.length === 0) {
      showWarningSnack("Agrega al menos una carrera antes de guardar.");
      return;
    }

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
          <img src="/assets/ic_close_x.svg" alt="close" className="w-6 h-6" />
        </button>

        {/* Inputs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                  className="flex justify-between items-center border rounded px-3 py-2 bg-gray-50"
                >
                  <div>
                    <span className="font-medium">{career.label}</span>{" "}
                    <span className="text-sm text-gray-500">
                      ({degree?.label ?? "Sin grado"})
                    </span>
                  </div>

                  <button
                    className="text-red-500 hover:text-red-700 ml-3"
                    title="Eliminar carrera"
                    onClick={() => handleRemoveCareer(career.label)}
                  >
                    <img
                      src="/assets/ic_close_x.svg"
                      alt="icon close"
                      className="w-4 h-4"
                    />
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
            <button type="button" onClick={handleSave} className="btn btn-blue">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
