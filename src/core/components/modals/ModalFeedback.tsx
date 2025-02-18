import { useEffect, useRef, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { AddOrUpdateFeedbackParams, BaseResponse, Feedback } from "../../models";
import { Modal } from "./Modal";
import { enqueueSnackbar } from "notistack";
import { useApi } from "../../hooks/useApi";
import { addOrUpdateTalentFeedback, deleteTalenteFeedback } from "../../services/apiService";
import { handleError, handleResponse } from "../../utilities/errorHandler";
import { Loading } from "../ui/Loading";
import { validateText } from "../../utilities/validation";

interface Props {
    idTalento?: number;
    feedbackRef: React.MutableRefObject<Feedback | null>;
    onUpdate?: () => void;
}

export const ModalFeedback = ({ idTalento, feedbackRef, onUpdate }: Props) => {
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const isEditing = !!feedbackRef.current;
    const { closeModal, isModalOpen } = useModal();
    const [stars, setStars] = useState(0);

    useEffect(() => {
        setStars(feedbackRef.current?.estrellas || 0);

        return () => {
            setStars(0);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen]);

    const { loading: addOrUpdateLoading, fetch: addOrUpdateData } = useApi<BaseResponse, AddOrUpdateFeedbackParams>(addOrUpdateTalentFeedback, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);

            if (response.data.idMensaje === 2) {
                if (onUpdate) onUpdate();
                closeModal("modalFeedback");
                enqueueSnackbar("Guardado", { variant: 'success' });
            }
        },
    });

    const { loading: deleteLoading, fetch: deleteData } = useApi<BaseResponse, number>(deleteTalenteFeedback, {
        onError: (error) => handleError(error, enqueueSnackbar),
        onSuccess: (response) => {
            handleResponse(response, enqueueSnackbar);

            if (response.data.idMensaje === 2) {
                if (onUpdate) onUpdate();
                closeModal("modalFeedback");
                enqueueSnackbar("Eliminado", { variant: 'success' });
            }
        },
    });

    const handleOnConfirm = () => {
        setErrors({});
        const newErrors: { [key: string]: string } = {};
        if (descriptionRef.current && idTalento) {
            const descripcion = descriptionRef.current.value;

            const textValidation = validateText(descripcion);
            if (!textValidation.isValid) {
                newErrors.descripcion = textValidation.message || "Error de validación.";
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            let data: AddOrUpdateFeedbackParams = {
                idTalento: idTalento,
                descripcion: descripcion,
                estrellas: stars,
            }

            if (isEditing && feedbackRef.current) {
                data = {
                    idFeedback: feedbackRef.current.idFeedback,
                    ...data
                }
            }

            addOrUpdateData(data);
        }
    }

    const handleOnDelete = () => {
        if (feedbackRef.current) {
            deleteData(feedbackRef.current.idFeedback);
        }
    }

    const handleStarClick = (starPosition: number) => {
        if (starPosition === stars) {
            setStars(0);
            return;
        }

        setStars(starPosition);
    }

    return (
        <Modal id="modalFeedback" title={isEditing ? "Editar feedback" : "Agregar feedback"} confirmationLabel={isEditing ? "Actualizar" : "Agregar"} onConfirm={handleOnConfirm}>
            {(addOrUpdateLoading || deleteLoading) && (<Loading opacity="opacity-60" />)}
            <div className="relative">
                <h3 className="text-[#71717A] text-sm mt-6">Agrega un nuevo puntaje y agrega un comentario.</h3>
                {isEditing && (
                    <button type="button" onClick={handleOnDelete} className="absolute -right-2 top-6 rounded-lg hover:bg-red-50 w-10 h-10">
                        <img src="/assets/ic_delete.svg" alt="delete icon" className="w-7 h-7 mx-auto" />
                    </button>
                )}
                <div id="rating-container" className="flex items-center my-6 gap-2 *:cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <div
                            key={star}
                            className="star cursor-pointer"
                            onClick={() => handleStarClick(star)}>
                            <img
                                src={stars >= star ? "/assets/ic_fill_star.svg" : "/assets/ic_outline_star.svg"}
                                alt={`Star ${star}`}
                                className="star-icon w-6 h-6"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col my-2">
                    <label htmlFor="feedback" className="text-[#37404c] text-base my-2">Feedback</label>
                    <textarea
                        name="feedback"
                        id="feedback"
                        ref={descriptionRef}
                        defaultValue={feedbackRef.current?.descripcion}
                        placeholder="Agrega un comentario"
                        className="h-44 p-3 resize-none border-gray-300 border-2 rounded-lg focus:outline-none focus:border-[#4F46E5]">
                    </textarea>
                    {errors.descripcion && <p className="text-red-500 text-sm mt-2">{errors.descripcion}</p>}
                </div>
            </div>
        </Modal>
    );
}