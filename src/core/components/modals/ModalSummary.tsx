import { useRef, useState, useEffect } from "react";
import { Modal } from "./Modal";
import { TalentDescriptionParams } from "../../models/params/TalentUpdateParams";
import { updateTalentDescription } from "../../services/apiService";
import { BaseResponse } from "../../models";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../hooks/useApi";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { useModal } from "../../context/ModalContext";
import { Loading } from "../ui/Loading";
import { validateText } from "../../utilities/validation";

interface Props {
  idTalento?: number;
  description?: string;
  onUpdate?: (idTalento: number) => void;
}

export const ModalSummary = ({
  idTalento,
  description = "",
  onUpdate,
}: Props) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [inputValue, setInputValue] = useState("");
  const { closeModal } = useModal();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const { loading, fetch: updateData } = useApi<
    BaseResponse,
    TalentDescriptionParams
  >(updateTalentDescription, {
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
    setInputValue(description || "");
    validateField(description || "");
  }, [description]);

  // Validar en tiempo real
  useEffect(() => {
    validateField(inputValue);
  }, [inputValue]);

  const validateField = (value: string) => {
    const newErrors: { [key: string]: string } = {};

    if (!value.trim()) {
      newErrors.description = "El resumen profesional es requerido";
    } else {
      const textValidation = validateText(value);
      if (!textValidation.isValid) {
        newErrors.description =
          textValidation.message || "Error de validación.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleOnConfirm = () => {
    const isValid = validateField(inputValue);

    if (!isValid || !idTalento) {
      return;
    }

    updateData({
      idTalento: idTalento,
      descripcion: inputValue.trim(),
    }).then((response) => {
      if (response.data.idMensaje === 2) {
        if (onUpdate) onUpdate(idTalento);
        closeModal("modalSummary");
      }
    });
  };

  const handleCloseModal = () => {
    // Restaurar el valor original al cerrar/cancelar
    setInputValue(description || "");
    setErrors({});
    closeModal("modalSummary");
  };

  return (
    <Modal
      id="modalSummary"
      title="Edita tu resumen profesional"
      confirmationLabel="Editar"
      onConfirm={handleOnConfirm}
      onClose={handleCloseModal}
    >
      {loading && <Loading opacity="opacity-60" />}
      <div>
        <h3 className="text-[#71717A] text-sm mt-6">
          ¿Tiempo para un nuevo resumen?. Edítelo
        </h3>
        <div className="flex flex-col my-2">
          <label htmlFor="description" className="input-label">
            Resumen profesional
          </label>
          <textarea
            name="description"
            id="description"
            ref={descriptionRef}
            value={inputValue}
            onChange={handleInputChange}
            className="input resize-none"
          ></textarea>

          {errors.description && (
            <p className="text-red-500 text-sm mt-2">{errors.description}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
