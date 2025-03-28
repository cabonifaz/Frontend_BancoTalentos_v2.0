import { enqueueSnackbar } from "notistack";
import { useRef, useState } from "react";
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

export const ModalAvailability = ({ idTalento, availability, onUpdate }: Props) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const { closeModal } = useModal();
    const availabilityRef = useRef<HTMLInputElement>(null);

    const { loading, fetch: updateData } = useApi<BaseResponse, TalentAvailabilityParams>(updateTalentAvailability, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => handleResponse({ response: response, showSuccessMessage: true, enqueueSnackbar: enqueueSnackbar }),
    });

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (availabilityRef.current && idTalento) {
            const disponibilidad = availabilityRef.current.value;

            const textValidation = validateText(disponibilidad);
            if (!textValidation.isValid) {
                newErrors.availability = textValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            updateData({
                idTalento: idTalento,
                disponibilidad: disponibilidad
            }).then((response) => {
                if (response.data.idMensaje === 2) {
                    if (onUpdate) onUpdate(idTalento);
                    closeModal("modalAvailability");
                }
            });
        }
    }

    return (
        <Modal id="modalAvailability" title="Edita tu disponibilidad" confirmationLabel="Editar" onConfirm={handleOnConfirm}>
            {loading && (<Loading opacity="opacity-60" />)}
            <div>
                <h3 className="text-[#71717A] text-sm mt-6">¿Tiempo de nueva disponibilidad?. Edítela</h3>
                <div className="flex flex-col my-2">
                    <label htmlFor="availability" className="input-label">Disponibilidad</label>
                    <input
                        type="text"
                        id="availability"
                        name="availability"
                        ref={availabilityRef}
                        defaultValue={availability}
                        placeholder="Disponibilidad"
                        className="input" />

                    {errors.availability && <p className="text-red-500 text-sm mt-2">{errors.availability}</p>}
                </div>
            </div>
        </Modal>
    );
}