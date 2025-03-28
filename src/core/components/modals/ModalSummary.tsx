import { useRef, useState } from "react";
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

export const ModalSummary = ({ idTalento, description, onUpdate }: Props) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { closeModal } = useModal();
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    const { loading, fetch: updateData } = useApi<BaseResponse, TalentDescriptionParams>(updateTalentDescription, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (descriptionRef.current && idTalento) {
            const description = descriptionRef.current.value;

            const textValidation = validateText(description);
            if (!textValidation.isValid) {
                newErrors.description = textValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            updateData({
                idTalento: idTalento,
                descripcion: description
            }).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalSummary");
                }
            });
        }
    }

    return (
        <Modal id="modalSummary" title="Edita tu resumen profesional" confirmationLabel="Editar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">¿Tiempo para un nuevo resumen?. Edítelo</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="description" className="input-label">Resumen profesional</label>
                    <textarea
                        name="description"
                        id="description"
                        ref={descriptionRef}
                        defaultValue={description}
                        className="input resize-none">
                    </textarea>

                    {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
                </div>
            </div>
        </Modal>
    );
}