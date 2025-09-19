import { enqueueSnackbar } from "notistack";
import { useState, useEffect } from "react";
import { useModal } from "../../context/ModalContext";
import { useApi } from "../../hooks/useApi";
import { BaseResponse } from "../../models";
import { TalentAvailabilityParams } from "../../models/params/TalentUpdateParams";
import { updateTalentAvailability } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Modal } from "./Modal";
import { Loading } from "../ui/Loading";
import { validateText } from "../../utilities/validation";

interface Props {
  idTalento?: number;
  availability?: string;
  onUpdate?: (idTalento: number) => void;
}

// Opciones desde local, para evitar hacer demasiadas llamadas a la API
const availabilityOptions = [
  { idParametro: 188, string1: "Presencial" },
  { idParametro: 189, string1: "Remoto" },
  { idParametro: 190, string1: "Híbrido" },
];

export const ModalAvailability = ({
  idTalento,
  availability = "",
  onUpdate,
}: Props) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { closeModal } = useModal();
  const [selectedAvailabilities, setSelectedAvailabilities] = useState<
    number[]
  >([]);

  const { loading, fetch: updateData } = useApi<
    BaseResponse,
    TalentAvailabilityParams
  >(updateTalentAvailability, {
    onError: (error) => handleError(error, enqueueSnackbar),
    onSuccess: (response) =>
      handleResponse({
        response: response,
        showSuccessMessage: true,
        enqueueSnackbar: enqueueSnackbar,
      }),
  });

  // Sincronizar el estado con la prop cuando cambie
  useEffect(() => {
    if (availability)
      setSelectedAvailabilities(
        availability
          .split(",")
          .map((id) => id.trim())
          .filter((id) => /^\d+$/.test(id))
          .map((id) => Number(id))
      );
    else setSelectedAvailabilities([]);
  }, [availability]);

  const handleCheckboxChange = (id: number) => {
    setSelectedAvailabilities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const validateField = (selected: number[]) => {
    const newErrors: { [key: string]: string } = {};

    if (selected.length === 0) {
      newErrors.availability = "La disponibilidad es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOnConfirm = () => {
    const isValid = validateField(selectedAvailabilities);

    if (!isValid || !idTalento) return;

    const availabilityString = selectedAvailabilities.join(",");

    updateData({
      idTalento: idTalento,
      disponibilidad: availabilityString,
    }).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate) onUpdate(idTalento);
        closeModal("modalAvailability");
        setErrors({ availability: "" });
      }
    });
  };

  const handleCloseModal = () => {
    // Restaurar el valor original al cerrar/cancelar
    setSelectedAvailabilities(
      availability
        ? availability
            .split(",")
            .map((id) => Number(id.trim()))
            .filter((id) => !isNaN(id))
        : []
    );
    setErrors({});
    closeModal("modalAvailability");
  };

  return (
    <Modal
      id="modalAvailability"
      title="Edita tu disponibilidad"
      confirmationLabel="Editar"
      onConfirm={handleOnConfirm}
      onClose={handleCloseModal}
    >
      {loading && <Loading opacity="opacity-60" />}
      <div>
        <h3 className="text-[#71717A] text-sm mt-6">
          ¿Nueva disponibilidad?. Edítela
        </h3>
        <div className="flex flex-col my-2">
          <label htmlFor="availability" className="input-label">
            Disponibilidad
          </label>
          {availabilityOptions.map((d) => (
            <label className="flex items-center gap-2" key={d.idParametro}>
              <input
                type="checkbox"
                value={d.idParametro}
                className="w-4 h-4"
                checked={selectedAvailabilities.includes(d.idParametro)}
                onChange={() => handleCheckboxChange(d.idParametro)}
              />
              <span>{d.string1}</span>
            </label>
          ))}

          {errors.availability && (
            <p className="text-red-500 text-sm mt-2">{errors.availability}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
