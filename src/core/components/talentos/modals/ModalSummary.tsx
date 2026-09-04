import { useRef, useState, useEffect } from "react";
import { Modal } from "../../modals/Modal";
import { TalentDescriptionParams } from "../../../models/params/TalentUpdateParams";
import { updateTalentDescription } from "../../../services/talents.service";
import { BaseResponse } from "../../../models";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../../hooks/useApi";
import { handleError, handleResponse } from "../../../utilities/errorHandler";
import { useModal } from "../../../context/ModalContext";
import { processText } from "../../../utilities/textUtils";
import { Loading } from "../../ui/Loading";
// import { validateText } from "../../../utilities/validation";

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
    // validateField(description || "");
  }, [description]);

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  // Sanitizar cuando el usuario sale del campo
  const { text, wasSanitized, wasTruncated } = processText(e.target.value, 5000);
  
  if (text !== e.target.value) {
    setInputValue(text);
    
    if (wasTruncated) {
      enqueueSnackbar(
        "La presentación se interrumpió a los 5,000 caracteres",
        { variant: "warning" }
      );
    } else if (wasSanitized) {
      enqueueSnackbar(
        "Se limpiaron caracteres especiales de la presentación",
        { variant: "info" }
      );
    }
  }
  };

  // Validar en tiempo real
  // useEffect(() => {
  //   validateField(inputValue);
  // }, [inputValue]);

  // const validateField = (value: string) => {
  //   const newErrors: { [key: string]: string } = {};

  //   if (!value.trim()) {
  //     newErrors.description = "El resumen profesional es requerido";
  //   } else {
  //     const textValidation = validateText(value);
  //     if (!textValidation.isValid) {
  //       newErrors.description =
  //         textValidation.message || "Error de validación.";
  //     }
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleOnConfirm = () => {
    // const isValid = validateField(inputValue);

    if (!idTalento) {
      return;
    }

    // Sanitizar antes de enviar
  const { text } = processText(inputValue, 5000);

    updateData({
      idTalento: idTalento,
      descripcion: text.trim(),
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
        <h3 className="text-[#71717A] text-sm mt-6 dark:text-slate-400">
          ¿Tiempo para un nuevo resumen?. Edítelo
        </h3>
        <div className="flex flex-col my-2">
           <div className="flex justify-between items-center mb-1">
            <label htmlFor="description" className="input-label">
              Resumen profesional
            </label>
            {/* CONTADOR DE CARACTERES */}
            <span className={`text-xs font-semibold ${inputValue.length > 5000 ? "text-red-500" : "text-gray-500 dark:text-slate-400"}`}>
              {inputValue.length} / 5000
            </span>
          </div>
           <div className="mb-2 text-xs text-blue-600 flex items-center gap-1 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Los emojis y espacios extras se eliminarán automáticamente</span>
          </div>
          <textarea
            name="description"
            id="description"
            ref={descriptionRef}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="input resize-none h-32"
          ></textarea>

           {inputValue.length > 5000 && (
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              La presentación no debe exceder los 5,000 caracteres
            </p>
          )}

          {errors.description && (
            <p className="text-red-500 text-sm mt-2">{errors.description}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
