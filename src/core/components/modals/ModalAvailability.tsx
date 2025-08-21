import { enqueueSnackbar } from "notistack";
import { useRef, useState, useEffect } from "react";
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

export const ModalAvailability = ({
  idTalento,
  availability = "",
  onUpdate,
}: Props) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [inputValue, setInputValue] = useState("");
  const { closeModal } = useModal();
  const availabilityRef = useRef<HTMLInputElement>(null);

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
    setInputValue(availability || "");
    validateField(availability || "");
  }, [availability]);

  // Validar en tiempo real
  useEffect(() => {
    validateField(inputValue);
  }, [inputValue]);

  const validateField = (value: string) => {
    const newErrors: { [key: string]: string } = {};

    if (!value.trim()) {
      newErrors.availability = "La disponibilidad es requerida";
    } else {
      const textValidation = validateText(value);
      if (!textValidation.isValid) {
        newErrors.availability =
          textValidation.message || "Error de validación.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleOnConfirm = () => {
    const isValid = validateField(inputValue);

    if (!isValid || !idTalento) {
      return;
    }

    updateData({
      idTalento: idTalento,
      disponibilidad: inputValue.trim(),
    }).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate) onUpdate(idTalento);
        closeModal("modalAvailability");
      }
    });
  };

  const handleCloseModal = () => {
    // Restaurar el valor original al cerrar/cancelar
    setInputValue(availability || "");
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
          ¿Tiempo de nueva disponibilidad?. Edítela
        </h3>
        <div className="flex flex-col my-2">
          <label htmlFor="availability" className="input-label">
            Disponibilidad
          </label>
          <input
            type="text"
            id="availability"
            name="availability"
            ref={availabilityRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Disponibilidad"
            className="input"
          />

          {errors.availability && (
            <p className="text-red-500 text-sm mt-2">{errors.availability}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
